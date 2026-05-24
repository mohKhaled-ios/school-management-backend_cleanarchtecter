

// const express = require('express');
// const paymentController = require('../controllers/paymentController');
// console.log("paymentController =", paymentController)
// const authMiddleware = require('../middleware/authMiddleware');

// const router = express.Router();

// router.post('/invoices', authMiddleware, paymentController.createInvoice);
// router.get('/invoices', authMiddleware, paymentController.getInvoices);
// router.post('/create-order', authMiddleware, paymentController.createPaymentOrder);
// router.post('/confirm', paymentController.confirmPayment); // Webhook - no auth

// module.exports = router;


const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// للتأكد من أن الـ controller متعرف
console.log("paymentController =", paymentController);

router.post('/invoices', authMiddleware, paymentController.createInvoice);
router.get('/invoices', authMiddleware, paymentController.getInvoices);
router.post('/create-order', authMiddleware, paymentController.createPaymentOrder);
router.post('/confirm', paymentController.confirmPayment); // Webhook - no auth

module.exports = router;

