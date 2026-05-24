
const express = require('express'); // ✅ استدعاء express
const materialController = require('../controllers/materialController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, materialController.uploadMaterial);
router.get('/', authMiddleware, materialController.getMaterials);
router.delete('/:id', authMiddleware, materialController.deleteMaterial);

module.exports = router; // ✅ نصدر الـ router فقط
