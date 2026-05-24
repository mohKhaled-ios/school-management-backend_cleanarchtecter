// routes/notifications.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// الحصول على إشعاراتي
router.get('/', authMiddleware, notificationController.getMyNotifications);

// عدد الإشعارات غير المقروءة
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// إنشاء إشعار جديد
router.post('/', authMiddleware, notificationController.createNotification);

// تحديد جميع الإشعارات كمقروءة
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

// تحديد إشعار كمقروء
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

// حذف إشعار
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

// حذف جميع الإشعارات
router.delete('/', authMiddleware, notificationController.clearAll);

module.exports = router;