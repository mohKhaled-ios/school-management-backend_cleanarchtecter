

// const Material = require('../models/Material');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // إعداد multer لرفع الملفات
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /pdf|mp4|avi|mov|jpg|jpeg|png|doc|docx/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);
//     if (mimetype && extname) return cb(null, true);
//     cb(new Error('نوع الملف غير مدعوم'));
//   }
// });

// const materialController = {
//   uploadMaterial: [
//     upload.single('file'), // ✅ multer middleware
//     async (req, res) => {
//       try {
//         const { title, description, subjectId, classId, fileType } = req.body;

//         if (!req.file) {
//           return res.status(400).json({ message: 'يرجى اختيار ملف' });
//         }

//         const material = new Material({
//           title,
//           description,
//           subjectId,
//           classId,
//           teacherId: req.userId,
//           fileType,
//           fileUrl: `/uploads/${req.file.filename}`,
//           fileName: req.file.originalname,
//           fileSize: req.file.size
//         });

//         await material.save();

//         const populatedMaterial = await Material.findById(material._id)
//           .populate('subjectId', 'name code')
//           .populate('classId', 'name grade')
//           .populate('teacherId', 'name email');

//         res.status(201).json(populatedMaterial);
//       } catch (error) {
//         res.status(500).json({ message: 'خطأ في رفع الملف' });
//       }
//     }
//   ],

//   getMaterials: async (req, res) => {
//     try {
//       const { subjectId, classId, fileType } = req.query;
//       let filter = {};
//       if (subjectId) filter.subjectId = subjectId;
//       if (classId) filter.classId = classId;
//       if (fileType) filter.fileType = fileType;

//       const materials = await Material.find(filter)
//         .populate('subjectId', 'name code')
//         .populate('classId', 'name grade')
//         .populate('teacherId', 'name email')
//         .sort({ createdAt: -1 });

//       res.json(materials);
//     } catch (error) {
//       res.status(500).json({ message: 'خطأ في الخادم' });
//     }
//   },

//   deleteMaterial: async (req, res) => {
//     try {
//       const material = await Material.findById(req.params.id);
//       if (!material) return res.status(404).json({ message: 'المادة غير موجودة' });

//       const filePath = path.join(__dirname, '..', material.fileUrl);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//       await Material.findByIdAndDelete(req.params.id);
//       res.json({ message: 'تم حذف المادة بنجاح' });
//     } catch (error) {
//       res.status(500).json({ message: 'خطأ في الخادم' });
//     }
//   }
// };

// module.exports = materialController; // ✅ نصدر الـ controller فقط

const Material = require('../models/Material');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إنشاء مجلد uploads إذا مش موجود
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد multer لرفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|mp4|avi|mov|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('نوع الملف غير مدعوم'));
  }
});

const materialController = {
  uploadMaterial: [
    upload.single('file'), // ✅ multer middleware
    async (req, res) => {
      try {
        const { title, description, subjectId, classId, fileType } = req.body;

        if (!req.userId) {
          return res.status(401).json({ message: 'Unauthorized: user not found' });
        }

        if (!req.file) {
          return res.status(400).json({ message: 'يرجى اختيار ملف' });
        }

        const material = new Material({
          title,
          description,
          subjectId,
          classId,
          teacherId: req.userId,
          fileType,
          fileUrl: `/uploads/${req.file.filename}`,
          fileName: req.file.originalname,
          fileSize: req.file.size
        });

        await material.save();

        const populatedMaterial = await Material.findById(material._id)
          .populate('subjectId', 'name code')
          .populate('classId', 'name grade')
          .populate('teacherId', 'name email');

        res.status(201).json(populatedMaterial);
      } catch (error) {
        console.error('Upload Material Error:', error);
        res.status(500).json({ message: 'خطأ في رفع الملف', error: error.message });
      }
    }
  ],

  getMaterials: async (req, res) => {
    try {
      const { subjectId, classId, fileType } = req.query;
      let filter = {};
      if (subjectId) filter.subjectId = subjectId;
      if (classId) filter.classId = classId;
      if (fileType) filter.fileType = fileType;

      const materials = await Material.find(filter)
        .populate('subjectId', 'name code')
        .populate('classId', 'name grade')
        .populate('teacherId', 'name email')
        .sort({ createdAt: -1 });

      res.json(materials);
    } catch (error) {
      console.error('Get Materials Error:', error);
      res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
    }
  },

  deleteMaterial: async (req, res) => {
    try {
      const material = await Material.findById(req.params.id);
      if (!material) return res.status(404).json({ message: 'المادة غير موجودة' });

      const filePath = path.join(__dirname, '..', material.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await Material.findByIdAndDelete(req.params.id);
      res.json({ message: 'تم حذف المادة بنجاح' });
    } catch (error) {
      console.error('Delete Material Error:', error);
      res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
    }
  }
};

module.exports = materialController;
