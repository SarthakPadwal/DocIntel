const express = require('express');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', authMiddleware, upload, documentController.upload);
router.get('/', authMiddleware, documentController.getAll);
router.get('/stats', authMiddleware, documentController.getStats);
router.get('/:id', authMiddleware, documentController.getById);
router.put('/:id', authMiddleware, requireRole('ADMIN'), documentController.update);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), documentController.remove);
router.get('/:id/file', authMiddleware, documentController.getFile);

module.exports = router;
