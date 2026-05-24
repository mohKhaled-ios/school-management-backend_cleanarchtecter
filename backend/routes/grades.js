
const express = require('express');
const gradeController = require('../controllers/gradeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, gradeController.addGrade);
router.get('/', authMiddleware, gradeController.getStudentGrades);
router.get('/stats', authMiddleware, gradeController.getGradeStats);

module.exports = router;
