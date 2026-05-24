// controllers/notificationController.js
const Notification = require('../models/Notification');

const notificationController = {

  // إنشاء إشعار جديد
  createNotification: async (req, res) => {
    try {
      const { userId, title, body, type, data } = req.body;

      const notification = new Notification({
        userId: userId || req.userId,
        title,
        body,
        type: type || 'general',
        data: data || null
      });

      await notification.save();
      res.status(201).json(notification);
    } catch (error) {
      console.error('createNotification error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على إشعارات المستخدم الحالي
  getMyNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(50);

      res.json(notifications);
    } catch (error) {
      console.error('getMyNotifications error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // تحديد إشعار كمقروء
  markAsRead: async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'الإشعار غير موجود' });
      }

      res.json(notification);
    } catch (error) {
      console.error('markAsRead error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // تحديد جميع الإشعارات كمقروءة
  markAllAsRead: async (req, res) => {
    try {
      await Notification.updateMany(
        { userId: req.userId, isRead: false },
        { isRead: true }
      );

      res.json({ message: 'تم تحديد جميع الإشعارات كمقروءة' });
    } catch (error) {
      console.error('markAllAsRead error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // حذف إشعار
  deleteNotification: async (req, res) => {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
      });

      if (!notification) {
        return res.status(404).json({ message: 'الإشعار غير موجود' });
      }

      res.json({ message: 'تم حذف الإشعار بنجاح' });
    } catch (error) {
      console.error('deleteNotification error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // حذف جميع الإشعارات
  clearAll: async (req, res) => {
    try {
      await Notification.deleteMany({ userId: req.userId });
      res.json({ message: 'تم حذف جميع الإشعارات' });
    } catch (error) {
      console.error('clearAll error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // عدد الإشعارات غير المقروءة
  getUnreadCount: async (req, res) => {
    try {
      const count = await Notification.countDocuments({
        userId: req.userId,
        isRead: false
      });

      res.json({ count });
    } catch (error) {
      console.error('getUnreadCount error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }
};

module.exports = notificationController;