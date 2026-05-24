const Class = require('../models/Class');
const User = require('../models/User');

const classController = {
  // إنشاء صف جديد
  createClass: async (req, res) => {
    try {
      const { name, grade, section, capacity, teacherId, subjects } = req.body;

      const newClass = new Class({
        name,
        grade,
        section,
        capacity,
        teacherId,
        subjects
      });

      await newClass.save();
      res.status(201).json(newClass);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على جميع الصفوف
  getClasses: async (req, res) => {
    try {
      const classes = await Class.find()
        .populate('teacherId', 'name email')
        .populate('subjects', 'name code');
      
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على صف بواسطة ID
  getClassById: async (req, res) => {
    try {
      const classData = await Class.findById(req.params.id)
        .populate('teacherId', 'name email phone')
        .populate('subjects', 'name code description')
        .populate('schedule.periods.subjectId', 'name')
        .populate('schedule.periods.teacherId', 'name');

      if (!classData) {
        return res.status(404).json({ message: 'الصف غير موجود' });
      }

      res.json(classData);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // تحديث الصف
  updateClass: async (req, res) => {
    try {
      const updatedClass = await Class.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('teacherId', 'name email');

      res.json(updatedClass);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // حذف الصف
  deleteClass: async (req, res) => {
    try {
      // التحقق من وجود طلاب في الصف
      const studentsInClass = await User.find({ 
        classId: req.params.id, 
        role: 'student' 
      });

      if (studentsInClass.length > 0) {
        return res.status(400).json({ 
          message: 'لا يمكن حذف الصف لأنه يحتوي على طلاب' 
        });
      }

      await Class.findByIdAndDelete(req.params.id);
      res.json({ message: 'تم حذف الصف بنجاح' });
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // إضافة جدول الحصص
  addSchedule: async (req, res) => {
    try {
      const { schedule } = req.body;
      
      const updatedClass = await Class.findByIdAndUpdate(
        req.params.id,
        { schedule },
        { new: true }
      );

      res.json(updatedClass);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }
};

module.exports = classController;

