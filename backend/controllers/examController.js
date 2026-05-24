const Exam = require('../models/Exam');
const Grade = require('../models/Grade');

const examController = {
  // إنشاء امتحان جديد
  createExam: async (req, res) => {
    try {
      const { title, subjectId, classId, date, duration, totalMarks, questions } = req.body;

      const exam = new Exam({
        title,
        subjectId,
        classId,
        date,
        duration,
        totalMarks,
        questions
      });

      await exam.save();
      res.status(201).json(exam);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على جميع الامتحانات
  getExams: async (req, res) => {
    try {
      const { subjectId, classId } = req.query;
      let filter = {};

      if (subjectId) filter.subjectId = subjectId;
      if (classId) filter.classId = classId;

      const exams = await Exam.find(filter)
        .populate('subjectId', 'name code')
        .populate('classId', 'name grade')
        .sort({ date: -1 });

      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على امتحان بواسطة ID
  getExamById: async (req, res) => {
    try {
      const exam = await Exam.findById(req.params.id)
        .populate('subjectId', 'name code')
        .populate('classId', 'name grade section');

      if (!exam) {
        return res.status(404).json({ message: 'الامتحان غير موجود' });
      }

      res.json(exam);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // تحديث الامتحان
  updateExam: async (req, res) => {
    try {
      const updatedExam = await Exam.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('subjectId', 'name code');

      res.json(updatedExam);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // حذف الامتحان
  deleteExam: async (req, res) => {
    try {
      // حذف الدرجات المرتبطة بالامتحان
      await Grade.deleteMany({ examId: req.params.id });
      await Exam.findByIdAndDelete(req.params.id);
      
      res.json({ message: 'تم حذف الامتحان والدرجات المرتبطة به بنجاح' });
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }
};

module.exports = examController;