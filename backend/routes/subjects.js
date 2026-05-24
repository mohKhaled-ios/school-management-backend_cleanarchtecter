

const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');

// إنشاء مادة
router.post('/', authMiddleware, subjectController.createSubject);

// جلب كل المواد
router.get('/', authMiddleware, subjectController.getSubjects);

// جلب مادة بالـ ID
router.get('/:id', authMiddleware, subjectController.getSubjectById);

// تحديث مادة
router.put('/:id', authMiddleware, subjectController.updateSubject);

// حذف مادة
router.delete('/:id', authMiddleware, subjectController.deleteSubject);

module.exports = router; // ✅ تصدير router مباشرة

