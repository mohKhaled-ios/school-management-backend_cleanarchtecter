const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, attendanceController.markAttendance);
router.get('/', authMiddleware, attendanceController.getAttendance);
router.put('/:id', authMiddleware, attendanceController.updateAttendance);
router.get('/stats', authMiddleware, attendanceController.getAttendanceStats);

module.exports = router; // ✅ يجب أن نصدر الـ router فقط
