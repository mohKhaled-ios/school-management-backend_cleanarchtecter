
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  register: async (req, res) => {
    try {
      const { name, email, password, role, phone, classId, parentId } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'البريد الإلكتروني مستخدم مسبقاً' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        classId: role === 'student' ? classId : undefined,
        parentId: role === 'student' ? parentId : undefined
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }
};

module.exports = authController;
