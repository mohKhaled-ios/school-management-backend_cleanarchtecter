
const express = require('express');
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, examController.createExam);
router.get('/', authMiddleware, examController.getExams);
router.get('/:id', authMiddleware, examController.getExamById);
router.put('/:id', authMiddleware, examController.updateExam);
router.delete('/:id', authMiddleware, examController.deleteExam);

module.exports = router;
