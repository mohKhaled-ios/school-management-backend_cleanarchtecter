

const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', authMiddleware, chatController.sendMessage);
router.get('/rooms', authMiddleware, chatController.getChats);
router.get('/messages', authMiddleware, chatController.getMessages);
router.post('/read', authMiddleware, chatController.markAsRead);

module.exports = router; // ✅ هذا Router

