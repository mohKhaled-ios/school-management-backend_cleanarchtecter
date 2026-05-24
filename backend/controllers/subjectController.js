const Subject = require('../models/Subject');

const subjectController = {
  // إنشاء مادة جديدة
  createSubject: async (req, res) => {
    try {
      const { name, code, description, teacherId, classId } = req.body;

      const existingSubject = await Subject.findOne({ code });
      if (existingSubject) {
        return res.status(400).json({ message: 'كود المادة مستخدم مسبقاً' });
      }

      const subject = new Subject({ name, code, description, teacherId, classId });
      await subject.save();
      res.status(201).json(subject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على جميع المواد
  getSubjects: async (req, res) => {
    try {
      const { classId, teacherId } = req.query;
      let filter = {};

      if (classId) filter.classId = classId;
      if (teacherId) filter.teacherId = teacherId;

      const subjects = await Subject.find(filter)
        .populate('teacherId', 'name email')
        .populate('classId', 'name grade');

      res.json(subjects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على مادة بواسطة ID
  getSubjectById: async (req, res) => {
    try {
      const subject = await Subject.findById(req.params.id)
        .populate('teacherId', 'name email phone')
        .populate('classId', 'name grade section');

      if (!subject) {
        return res.status(404).json({ message: 'المادة غير موجودة' });
      }

      res.json(subject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // تحديث المادة
  updateSubject: async (req, res) => {
    try {
      const updatedSubject = await Subject.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('teacherId', 'name email');

      res.json(updatedSubject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // حذف المادة
  deleteSubject: async (req, res) => {
    try {
      await Subject.findByIdAndDelete(req.params.id);
      res.json({ message: 'تم حذف المادة بنجاح' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }
};

module.exports = subjectController;
