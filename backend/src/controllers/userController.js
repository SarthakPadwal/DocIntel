const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { validateRequired } = require('../utils/validation');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, department, designation, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    if (users.length === 0) return errorResponse(res, 'User not found', 404);

    const user = users[0];
    const isAdmin = user.role === 'ADMIN';

    // Role-specific stats & clearance metadata
    let stats = {};
    let clearance = {};

    if (isAdmin) {
      const [totalDocs] = await pool.query('SELECT COUNT(*) as count FROM documents WHERE is_deleted = 0');
      const [pendingDocs] = await pool.query("SELECT COUNT(*) as count FROM documents WHERE status = 'PENDING' AND is_deleted = 0");
      const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
      const [auditCount] = await pool.query('SELECT COUNT(*) as count FROM document_history');

      stats = {
        totalDocuments: totalDocs[0].count,
        pendingReview: pendingDocs[0].count,
        totalUsers: totalUsers[0].count,
        auditEvents: auditCount[0].count
      };

      clearance = {
        tier: 'SEC-LVL-4 ROOT CLEARANCE',
        badge: 'Verified Root Administrator',
        scope: 'Global System & Repository Control',
        privileges: [
          'Full Document Lifecycle Control (Read/Write/Delete/Restore)',
          'AI OCR & Extraction Microservice Engine Oversight',
          'User Management & Role Permissions Administration',
          'Database Schema & System Chronometry Configuration',
          'Immutable Enterprise Audit Trail Inspection'
        ]
      };
    } else {
      const [userDocs] = await pool.query(
        'SELECT COUNT(*) as count FROM documents WHERE uploaded_by = ? AND is_deleted = 0',
        [userId]
      );
      const [searches] = await pool.query(
        'SELECT COUNT(*) as count FROM search_history WHERE user_id = ?',
        [userId]
      );
      const [actions] = await pool.query(
        'SELECT COUNT(*) as count FROM document_history WHERE user_id = ?',
        [userId]
      );

      stats = {
        totalDocuments: userDocs[0].count,
        searchesPerformed: searches[0].count,
        actionsLogged: actions[0].count
      };

      clearance = {
        tier: 'ACCESS LEVEL: STANDARD REPOSITORY',
        badge: 'Verified Enterprise Member',
        scope: 'Departmental Ingestion & Processing',
        privileges: [
          'Document Upload & Ingestion Access',
          'Metadata Viewing & Attribute Extraction Search',
          'Document Preview & Content Search',
          'Personal Activity & Audit Trail History'
        ]
      };
    }

    return successResponse(res, 'Profile retrieved', { user, stats, clearance });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return errorResponse(res, error.message, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, department, designation, phone } = req.body;

    const missing = validateRequired([{ name: 'name', value: name }]);
    if (missing) return errorResponse(res, `Missing required field: ${missing}`, 400);

    await pool.query(
      `UPDATE users 
       SET name = ?, 
           department = ?, 
           designation = ?, 
           phone = ?,
           updated_at = NOW() 
       WHERE id = ?`,
      [
        name.trim(),
        department ? department.trim() : null,
        designation ? designation.trim() : null,
        phone ? phone.trim() : null,
        userId
      ]
    );

    // Audit the profile edit
    try {
      await pool.query(
        `INSERT INTO document_history (user_id, action, details) 
         VALUES (?, 'EDIT_META', ?)`,
        [userId, JSON.stringify({ action_type: 'PROFILE_UPDATE', name, department, designation, phone })]
      );
    } catch (auditErr) {
      console.warn('Audit log warning on profile update:', auditErr.message);
    }

    const [updatedUsers] = await pool.query(
      'SELECT id, name, email, phone, role, department, designation, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    return successResponse(res, 'Profile updated successfully', { user: updatedUsers[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
