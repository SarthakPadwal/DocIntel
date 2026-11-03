const documentService = require('../services/documentService');
const storageService = require('../services/storageService');
const pythonProcessingService = require('../services/pythonProcessingService');
const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// Upload a new document
const upload = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 'No file provided', 400);

    const docData = {
      uploadedBy: req.user.userId,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      filePath: `${process.env.UPLOAD_DIR || 'uploads/documents'}/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      documentType: req.body.document_type || 'Other',
      dueDate: req.body.due_date || null
    };

    const document = await documentService.createDocument(docData);

    // Log upload action in history
    await pool.query(
      'INSERT INTO document_history (user_id, document_id, action) VALUES (?, ?, ?)',
      [req.user.userId, document.id, 'UPLOAD']
    );

    // Trigger Python processing asynchronously
    pythonProcessingService.triggerDocumentProcessing(document.id, document.file_path).catch(err => {
      console.error('Async Python processing error:', err);
    });

    return successResponse(res, 'Document uploaded successfully', { document }, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all documents with search, filter, sort, pagination
const getAll = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      document_type: req.query.document_type,
      status: req.query.status,
      company: req.query.company,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await documentService.getDocuments(filters);

    // Log search query to search_history if valid search term
    if (filters.search && filters.search.trim().length >= 2) {
      const cleanSearch = filters.search.trim();
      const [lastSearch] = await pool.query(
        'SELECT id, search_query FROM search_history WHERE user_id = ? ORDER BY searched_at DESC LIMIT 1',
        [req.user.userId]
      );
      if (!lastSearch.length || lastSearch[0].search_query.toLowerCase() !== cleanSearch.toLowerCase()) {
        await pool.query(
          'INSERT INTO search_history (user_id, search_query, filters, result_count) VALUES (?, ?, ?, ?)',
          [
            req.user.userId,
            cleanSearch,
            JSON.stringify({
              document_type: filters.document_type || null,
              status: filters.status || null,
              sort: filters.sort || null
            }),
            result.total || 0
          ]
        );
      } else {
        await pool.query(
          'UPDATE search_history SET searched_at = NOW(), result_count = ? WHERE id = ?',
          [result.total || 0, lastSearch[0].id]
        );
      }
    }

    return successResponse(res, 'Documents retrieved successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get a single document by ID
const getById = async (req, res) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);

    // Throttled logging: Avoid duplicate VIEW actions within 5 minutes
    const [recentViews] = await pool.query(
      'SELECT id FROM document_history WHERE user_id = ? AND document_id = ? AND action = "VIEW" AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) LIMIT 1',
      [req.user.userId, document.id]
    );
    if (recentViews.length === 0) {
      await pool.query(
        'INSERT INTO document_history (user_id, document_id, action) VALUES (?, ?, "VIEW")',
        [req.user.userId, document.id]
      );
    }

    return successResponse(res, 'Document retrieved', { document });
  } catch (error) {
    const statusCode = error.statusCode || 404;
    return errorResponse(res, error.message, statusCode);
  }
};

// Update document (admin only)
const update = async (req, res) => {
  try {
    const updated = await documentService.updateDocument(req.params.id, req.body);

    const actionType = req.body.status ? 'UPDATE_STATUS' : 'EDIT_META';
    await pool.query(
      'INSERT INTO document_history (user_id, document_id, action) VALUES (?, ?, ?)',
      [req.user.userId, req.params.id, actionType]
    );

    return successResponse(res, 'Document updated successfully', { document: updated });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete document (admin only)
const remove = async (req, res) => {
  try {
    const doc = await documentService.getDocumentById(req.params.id);

    // Soft Delete
    await documentService.deleteDocument(req.params.id, req.user.userId);

    // Log DELETE action in history
    await pool.query(
      'INSERT INTO document_history (user_id, document_id, action) VALUES (?, ?, ?)',
      [req.user.userId, req.params.id, 'DELETE']
    );

    return successResponse(res, 'Document deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const stats = await documentService.getStats();
    return successResponse(res, 'Stats retrieved', { stats });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Serve original file for viewing/download
const getFile = async (req, res) => {
  try {
    const doc = await documentService.getDocumentById(req.params.id);
    const filePath = storageService.getFilePath(doc.stored_filename);

    // Log OPEN action in history
    await pool.query(
      'INSERT INTO document_history (user_id, document_id, action) VALUES (?, ?, ?)',
      [req.user.userId, doc.id, 'OPEN']
    );

    return res.sendFile(filePath);
  } catch (error) {
    return errorResponse(res, 'File not found', 404);
  }
};

module.exports = {
  upload,
  getAll,
  getById,
  update,
  remove,
  getStats,
  getFile
};
