const { pool } = require('../config/db');

// Create a new document record + empty document_information row
const createDocument = async (data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [docResult] = await connection.query(
      `INSERT INTO documents 
        (uploaded_by, original_filename, stored_filename, file_path, file_type, file_size, document_type, status, processing_status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 'UPLOADED', ?)`,
      [
        data.uploadedBy,
        data.originalFilename,
        data.storedFilename,
        data.filePath,
        data.fileType,
        data.fileSize,
        data.documentType || 'Other',
        data.dueDate || null
      ]
    );

    const documentId = docResult.insertId;

    // Create document_information row (with initial due_date if provided)
    await connection.query(
      'INSERT INTO document_information (document_id, due_date) VALUES (?, ?)',
      [documentId, data.dueDate || null]
    );

    await connection.commit();

    // Return the created document
    const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [documentId]);
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Get documents with search, filter, sort, pagination
const getDocuments = async (filters) => {
  let query = `
    SELECT d.id, d.uploaded_by, u.name AS uploader_name, d.original_filename, d.stored_filename, d.file_type, 
           d.file_size, d.document_type, d.status, d.processing_status,
           d.document_date, d.due_date, d.uploaded_at, d.updated_at,
           di.company_name, di.gst_number, di.document_number, 
           di.amount, di.summary, di.key_points, di.payment_terms,
           di.address, di.email, di.phone, di.pan, di.pincode, di.city, di.state, di.landmark, di.currency,
           di.document_date AS info_document_date, di.due_date AS info_due_date
    FROM documents d
    LEFT JOIN document_information di ON d.id = di.document_id
    LEFT JOIN users u ON d.uploaded_by = u.id
    WHERE d.is_deleted = 0
  `;
  const queryParams = [];

  // Search across company name, filename, document number, OCR text, summaries, and key points
  if (filters.search) {
    query += ' AND (di.company_name LIKE ? OR d.original_filename LIKE ? OR di.document_number LIKE ? OR d.document_type LIKE ? OR di.summary LIKE ? OR di.key_points LIKE ? OR di.extracted_text LIKE ?)';
    const searchPattern = `%${filters.search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }

  // Filter by document type
  if (filters.document_type) {
    query += ' AND d.document_type = ?';
    queryParams.push(filters.document_type);
  }

  // Filter by status
  if (filters.status) {
    query += ' AND d.status = ?';
    queryParams.push(filters.status);
  }

  // Filter by company
  if (filters.company) {
    query += ' AND di.company_name LIKE ?';
    queryParams.push(`%${filters.company}%`);
  }

  // Sorting — whitelist allowed sort fields to prevent SQL injection
  const sortMap = {
    'newest': 'd.uploaded_at DESC',
    'oldest': 'd.uploaded_at ASC',
    'document_date': 'd.document_date DESC NULLS LAST',
    'due_date': 'd.due_date ASC'
  };
  // MySQL doesn't support NULLS LAST directly, so handle it
  let sortClause;
  if (filters.sort === 'document_date') {
    sortClause = 'CASE WHEN d.document_date IS NULL THEN 1 ELSE 0 END, d.document_date DESC';
  } else {
    sortClause = sortMap[filters.sort] || sortMap['newest'];
  }
  query += ` ORDER BY ${sortClause}`;

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;

  // Build count query properly without string hacking
  let countQuery = `
    SELECT COUNT(*) as total 
    FROM documents d
    LEFT JOIN document_information di ON d.id = di.document_id
    LEFT JOIN users u ON d.uploaded_by = u.id
    WHERE d.is_deleted = 0
  `;
  
  if (filters.search) {
    countQuery += ' AND (di.company_name LIKE ? OR d.original_filename LIKE ? OR di.document_number LIKE ? OR d.document_type LIKE ? OR di.summary LIKE ? OR di.key_points LIKE ? OR di.extracted_text LIKE ?)';
  }
  if (filters.document_type) {
    countQuery += ' AND d.document_type = ?';
  }
  if (filters.status) {
    countQuery += ' AND d.status = ?';
  }
  if (filters.company) {
    countQuery += ' AND di.company_name LIKE ?';
  }

  const countParams = [...queryParams]; // same params for count
  const [countResult] = await pool.query(countQuery, countParams);
  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  const [documents] = await pool.query(query, queryParams);

  return { documents, total, page, totalPages };
};

// Get a single document with all its information
const getDocumentById = async (id) => {
  const [rows] = await pool.query(`
    SELECT d.id, d.uploaded_by, u.name AS uploader_name, d.original_filename, d.stored_filename, d.file_path,
           d.file_type, d.file_size, d.document_type, d.status, d.processing_status,
           d.document_date, d.due_date, d.uploaded_at, d.updated_at,
           di.company_name, di.gst_number, di.document_number,
           di.amount, di.key_points, di.summary, di.extracted_text, di.payment_terms,
           di.address, di.email, di.phone, di.pan, di.pincode, di.city, di.state, di.landmark, di.currency,
           di.document_date AS info_document_date, di.due_date AS info_due_date
    FROM documents d
    LEFT JOIN document_information di ON d.id = di.document_id
    LEFT JOIN users u ON d.uploaded_by = u.id
    WHERE d.id = ?
  `, [id]);

  if (rows.length === 0) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
};

// Update document and its information (admin only)
const updateDocument = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update fields on the documents table
    if (data.status || data.document_type || data.document_date || data.due_date) {
      const docFields = [];
      const docParams = [];

      if (data.status) { docFields.push('status = ?'); docParams.push(data.status); }
      if (data.document_type) { docFields.push('document_type = ?'); docParams.push(data.document_type); }
      if (data.document_date !== undefined) { docFields.push('document_date = ?'); docParams.push(data.document_date || null); }
      if (data.due_date !== undefined) { docFields.push('due_date = ?'); docParams.push(data.due_date || null); }

      if (docFields.length > 0) {
        docParams.push(id);
        await connection.query(
          `UPDATE documents SET ${docFields.join(', ')} WHERE id = ?`,
          docParams
        );
      }
    }

    // Update fields on document_information table
    const infoFields = [];
    const infoParams = [];

    if (data.company_name !== undefined) { infoFields.push('company_name = ?'); infoParams.push(data.company_name || null); }
    if (data.gst_number !== undefined) { infoFields.push('gst_number = ?'); infoParams.push(data.gst_number || null); }
    if (data.document_number !== undefined) { infoFields.push('document_number = ?'); infoParams.push(data.document_number || null); }
    if (data.amount !== undefined) { infoFields.push('amount = ?'); infoParams.push(data.amount || null); }
    if (data.key_points !== undefined) { infoFields.push('key_points = ?'); infoParams.push(data.key_points || null); }
    if (data.summary !== undefined) { infoFields.push('summary = ?'); infoParams.push(data.summary || null); }
    if (data.document_date !== undefined) { infoFields.push('document_date = ?'); infoParams.push(data.document_date || null); }
    if (data.due_date !== undefined) { infoFields.push('due_date = ?'); infoParams.push(data.due_date || null); }
    if (data.pan !== undefined) { infoFields.push('pan = ?'); infoParams.push(data.pan || null); }
    if (data.address !== undefined) { infoFields.push('address = ?'); infoParams.push(data.address || null); }
    if (data.email !== undefined) { infoFields.push('email = ?'); infoParams.push(data.email || null); }
    if (data.phone !== undefined) { infoFields.push('phone = ?'); infoParams.push(data.phone || null); }
    if (data.city !== undefined) { infoFields.push('city = ?'); infoParams.push(data.city || null); }
    if (data.state !== undefined) { infoFields.push('state = ?'); infoParams.push(data.state || null); }
    if (data.pincode !== undefined) { infoFields.push('pincode = ?'); infoParams.push(data.pincode || null); }
    if (data.currency !== undefined) { infoFields.push('currency = ?'); infoParams.push(data.currency || null); }

    if (infoFields.length > 0) {
      infoParams.push(id);
      await connection.query(
        `UPDATE document_information SET ${infoFields.join(', ')} WHERE document_id = ?`,
        infoParams
      );
    }

    await connection.commit();
    return getDocumentById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Soft delete a document
const deleteDocument = async (id, userId) => {
  const [result] = await pool.query(
    'UPDATE documents SET is_deleted = 1, deleted_at = NOW(), deleted_by = ? WHERE id = ?', 
    [userId, id]
  );
  return result.affectedRows > 0;
};

// Get dashboard statistics
const getStats = async () => {
  const [totalRes] = await pool.query('SELECT COUNT(*) as count FROM documents WHERE is_deleted = 0');
  const [pendingRes] = await pool.query("SELECT COUNT(*) as count FROM documents WHERE status = 'PENDING' AND is_deleted = 0");
  const [doneRes] = await pool.query("SELECT COUNT(*) as count FROM documents WHERE status = 'DONE' AND is_deleted = 0");
  
  // Upcoming deadlines in the next 14 days (1-2 weeks): only active/pending documents
  const [upcomingRes] = await pool.query(`
    SELECT COUNT(*) as count 
    FROM documents d 
    LEFT JOIN document_information di ON d.id = di.document_id 
    WHERE d.is_deleted = 0 
      AND d.status != 'DONE' 
      AND COALESCE(d.due_date, di.due_date) >= CURDATE() 
      AND COALESCE(d.due_date, di.due_date) <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)
  `);

  // Overdue documents: past due dates where status is not DONE, plus failed status
  const [overdueRes] = await pool.query(`
    SELECT COUNT(*) as count 
    FROM documents d 
    LEFT JOIN document_information di ON d.id = di.document_id 
    WHERE d.is_deleted = 0 
      AND (
        (COALESCE(d.due_date, di.due_date) IS NOT NULL AND COALESCE(d.due_date, di.due_date) < CURDATE() AND d.status != 'DONE') 
        OR d.status = 'FAILED'
      )
  `);

  // Purge queue: count of soft-deleted documents
  const [deletedRes] = await pool.query('SELECT COUNT(*) as count FROM documents WHERE is_deleted = 1');

  const [recentDocs] = await pool.query(`
    SELECT d.id, d.original_filename, d.document_type, d.status, d.processing_status,
           d.document_date, d.due_date, d.uploaded_at,
           di.company_name, di.document_number, di.amount,
           di.due_date as info_due_date, di.document_date as info_document_date
    FROM documents d
    LEFT JOIN document_information di ON d.id = di.document_id
    WHERE d.is_deleted = 0
    ORDER BY d.uploaded_at DESC 
    LIMIT 5
  `);

  return {
    total: totalRes[0].count,
    pending: pendingRes[0].count,
    done: doneRes[0].count,
    upcoming: upcomingRes[0].count,
    overdue: overdueRes[0].count,
    deleted: deletedRes[0].count,
    recent: recentDocs
  };
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getStats
};
