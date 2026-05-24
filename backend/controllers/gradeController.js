const Grade = require('../models/Grade');

const gradeController = {
  // إضافة/تحديث درجة
  addGrade: async (req, res) => {
    try {
      const { studentId, examId, subjectId, marksObtained, totalMarks, comments } = req.body;

      // حساب التقدير
      const percentage = (marksObtained / totalMarks) * 100;
      let grade = '';
      
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';
      else grade = 'F';

      // التحقق من وجود درجة مسبقة
      const existingGrade = await Grade.findOne({ studentId, examId });

      if (existingGrade) {
        // تحديث الدرجة الموجودة
        const updatedGrade = await Grade.findByIdAndUpdate(
          existingGrade._id,
          {
            marksObtained,
            totalMarks,
            grade,
            comments
          },
          { new: true }
        ).populate('studentId', 'name email')
         .populate('examId', 'title')
         .populate('subjectId', 'name');

        return res.json(updatedGrade);
      }

      // إنشاء درجة جديدة
      const newGrade = new Grade({
        studentId,
        examId,
        subjectId,
        marksObtained,
        totalMarks,
        grade,
        comments
      });

      await newGrade.save();
      
      const populatedGrade = await Grade.findById(newGrade._id)
        .populate('studentId', 'name email')
        .populate('examId', 'title')
        .populate('subjectId', 'name');

      res.status(201).json(populatedGrade);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على درجات الطالب
  getStudentGrades: async (req, res) => {
    try {
      const { studentId, subjectId, examId } = req.query;
      let filter = {};

      if (studentId) filter.studentId = studentId;
      if (subjectId) filter.subjectId = subjectId;
      if (examId) filter.examId = examId;

      const grades = await Grade.find(filter)
        .populate('studentId', 'name email')
        .populate('examId', 'title date totalMarks')
        .populate('subjectId', 'name code')
        .sort({ createdAt: -1 });

      res.json(grades);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على إحصائيات الدرجات
  getGradeStats: async (req, res) => {
    try {
      const { classId, subjectId, examId } = req.query;

      const grades = await Grade.find({ examId })
        .populate({
          path: 'studentId',
          match: { classId: classId }
        })
        .populate('subjectId', 'name')
        .populate('examId', 'title');

      const classGrades = grades.filter(grade => grade.studentId !== null);

      if (classGrades.length === 0) {
        return res.json({
          average: 0,
          highest: 0,
          lowest: 0,
          totalStudents: 0,
          gradeDistribution: {}
        });
      }

      const marks = classGrades.map(grade => grade.marksObtained);
      const average = marks.reduce((a, b) => a + b, 0) / marks.length;
      const highest = Math.max(...marks);
      const lowest = Math.min(...marks);

      const gradeDistribution = {
        'A+': classGrades.filter(g => g.grade === 'A+').length,
        'A': classGrades.filter(g => g.grade === 'A').length,
        'B': classGrades.filter(g => g.grade === 'B').length,
        'C': classGrades.filter(g => g.grade === 'C').length,
        'D': classGrades.filter(g => g.grade === 'D').length,
        'F': classGrades.filter(g => g.grade === 'F').length
      };

      res.json({
        average: average.toFixed(2),
        highest,
        lowest,
        totalStudents: classGrades.length,
        gradeDistribution
      });
    } catch (error) {
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }
};

module.exports = gradeController;