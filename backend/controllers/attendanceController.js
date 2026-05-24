// const Attendance = require('../models/Attendance');

// const attendanceController = {
//   // تسجيل الحضور
//   markAttendance: async (req, res) => {
//     try {
//       const { studentId, classId, date, status, notes } = req.body;

//       // التحقق من عدم تكرار تسجيل الحضور لنفس اليوم
//       const existingAttendance = await Attendance.findOne({
//         studentId,
//         classId,
//         date: new Date(date).setHours(0, 0, 0, 0)
//       });

//       if (existingAttendance) {
//         return res.status(400).json({ 
//           message: 'تم تسجيل الحضور لهذا الطالب مسبقاً اليوم' 
//         });
//       }

//       const attendance = new Attendance({
//         studentId,
//         classId,
//         date,
//         status,
//         notes
//       });

//       await attendance.save();
//       res.status(201).json(attendance);
//     } catch (error) {
//       res.status(500).json({ message: 'خطأ في الخادم' });
//     }
//   },

//   // الحصول على سجل الحضور
//   getAttendance: async (req, res) => {
//     try {
//       const { studentId, classId, startDate, endDate } = req.query;
//       let filter = {};

//       if (studentId) filter.studentId = studentId;
//       if (classId) filter.classId = classId;

//       if (startDate && endDate) {
//         filter.date = {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate)
//         };
//       }

//       const attendance = await Attendance.find(filter)
//         .populate('studentId', 'name email')
//         .populate('classId', 'name grade')
//         .sort({ date: -1 });

//       res.json(attendance);
//     } catch (error) {
//       res.status(500).json({ message: 'خطأ في الخادم' });
//     }
//   },

//   // تحديث الحضور
//   updateAttendance: async (req, res) => {
//     try {
//       const updatedAttendance = await Attendance.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true }
//       ).populate('studentId', 'name email');

//       res.json(updatedAttendance);
//     } catch (error) {
//       res.status(500).json({ message: 'خطأ في الخادم' });
//     }
//   },

//   // إحصائيات الحضور
//   getAttendanceStats: async (req, res) => {
//     try {
//       const { studentId, classId, month, year } = req.query;
      
//       const startDate = new Date(year, month - 1, 1);
//       const endDate = new Date(year, month, 0);

//       const attendance = await Attendance.find({
//         studentId,
//         classId,
//         date: { $gte: startDate, $lte: endDate }
//       });

//       const totalDays = attendance.length;
//       const presentDays = attendance.filter(a => a.status === 'present').length;
//       const absentDays = attendance.filter(a => a.status === 'absent').length;
//       const lateDays = attendance.filter(a => a.status === 'late').length;

//       const stats = {
//         totalDays,
//         presentDays,
//         absentDays,
//         lateDays,
//         attendanceRate: totalDays > 0 ? (presentDays / totalDays * 100).toFixed(2) : 0
//       };

//       res.json(stats);
//     } catch (error) {
//       res.status(500).json({ message: 'خطأ في الخادم' });
//     }
//   }
// };

// module.exports = attendanceController;
const Attendance = require('../models/Attendance');

const attendanceController = {
  // تسجيل الحضور
  markAttendance: async (req, res) => {
    try {
      const { studentId, classId, date, status, notes } = req.body;

      // التحقق من صحة البيانات
      if (!studentId || !classId || !date || !status) {
        return res.status(400).json({ 
          message: 'جميع الحقول مطلوبة: studentId, classId, date, status' 
        });
      }

      // تحويل التاريخ إلى بداية اليوم
      const attendanceDate = new Date(date);
      const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

      // التحقق من عدم تكرار تسجيل الحضور لنفس اليوم
      const existingAttendance = await Attendance.findOne({
        studentId,
        classId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });

      if (existingAttendance) {
        return res.status(400).json({ 
          message: 'تم تسجيل الحضور لهذا الطالب مسبقاً اليوم' 
        });
      }

      const attendance = new Attendance({
        studentId,
        classId,
        date: new Date(date),
        status,
        notes
      });

      await attendance.save();
      
      // Populate data before sending response
      const populatedAttendance = await Attendance.findById(attendance._id)
        .populate('studentId', 'name email')
        .populate('classId', 'name grade');
      
      res.status(201).json(populatedAttendance);
    } catch (error) {
      console.error('Error in markAttendance:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على سجل الحضور
  getAttendance: async (req, res) => {
    try {
      const { studentId, classId, startDate, endDate } = req.query;
      let filter = {};

      if (studentId) filter.studentId = studentId;
      if (classId) filter.classId = classId;

      if (startDate && endDate) {
        filter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const attendance = await Attendance.find(filter)
        .populate('studentId', 'name email profileImage')
        .populate('classId', 'name grade section')
        .sort({ date: -1 });

      res.json(attendance);
    } catch (error) {
      console.error('Error in getAttendance:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // تحديث الحضور
  updateAttendance: async (req, res) => {
    try {
      const { status, notes } = req.body;
      
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        req.params.id,
        { status, notes },
        { new: true }
      )
      .populate('studentId', 'name email')
      .populate('classId', 'name grade');

      if (!updatedAttendance) {
        return res.status(404).json({ message: 'سجل الحضور غير موجود' });
      }

      res.json(updatedAttendance);
    } catch (error) {
      console.error('Error in updateAttendance:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // إحصائيات الحضور
  getAttendanceStats: async (req, res) => {
    try {
      const { studentId, classId, month, year } = req.query;
      
      // التحقق من وجود البيانات المطلوبة
      if (!month || !year) {
        return res.status(400).json({ 
          message: 'الشهر والسنة مطلوبان' 
        });
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      let filter = {
        date: { $gte: startDate, $lte: endDate }
      };

      if (studentId) filter.studentId = studentId;
      if (classId) filter.classId = classId;

      const attendance = await Attendance.find(filter);

      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const absentDays = attendance.filter(a => a.status === 'absent').length;
      const lateDays = attendance.filter(a => a.status === 'late').length;

      const stats = {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendanceRate: totalDays > 0 ? (presentDays / totalDays * 100).toFixed(2) : 0
      };

      res.json(stats);
    } catch (error) {
      console.error('Error in getAttendanceStats:', error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }
};

module.exports = attendanceController;