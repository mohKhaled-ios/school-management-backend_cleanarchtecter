
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {
  getUsers: async (req, res) => {
    try {
      const { role, classId } = req.query;
      let filter = {};

      if (role) filter.role = role;
      if (classId) filter.classId = classId;

      const users = await User.find(filter)
        .populate('classId')
        .populate('parentId')
        .populate('subjects');

      res.json(users);
    } catch (error) {
      console.error('getUsers error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .populate('classId')
        .populate('parentId')
        .populate('subjects');

      if (!user) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
      }

      res.json(user);
    } catch (error) {
      console.error('getUserById error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { password, ...updateData } = req.body;

      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error) {
      console.error('updateUser error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

    getStudentsByClass: async (req, res) => {
    try {
      const { classId } = req.params;

      const students = await User.find({
        role: 'student',
        classId: classId,
        isActive: true
      }).select('-password');

      res.json(students);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },
  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
      console.error('deleteUser error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // ✅ إضافة createUser لأنه موجود في الـ route
  createUser: async (req, res) => {
    try {
      const { password, ...userData } = req.body;

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({ ...userData, password: hashedPassword });
      await newUser.save();

      res.status(201).json(newUser);
    } catch (error) {
      console.error('createUser error:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }
};

module.exports = userController; // ✅ نصدر الـ controller فقط
