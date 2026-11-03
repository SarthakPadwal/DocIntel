const express = require('express');
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', authMiddleware, historyController.getSearchHistory);
router.post('/search', authMiddleware, historyController.addSearchHistory);
router.get('/activity', authMiddleware, historyController.getActivityHistory);
router.delete('/search', authMiddleware, historyController.clearSearchHistory);

module.exports = router;
