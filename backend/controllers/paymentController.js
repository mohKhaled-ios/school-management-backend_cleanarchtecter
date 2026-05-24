

const Invoice = require('../models/Invoice');
const axios = require('axios');

const paymentController = {
  // إنشاء فاتورة جديدة
  createInvoice: async (req, res) => {
    try {
      const { studentId, classId, amount, dueDate, items } = req.body;
      const invoiceCount = await Invoice.countDocuments();
      const invoiceNumber = `INV-${Date.now()}-${invoiceCount + 1}`;

      const invoice = new Invoice({
        studentId,
        classId,
        invoiceNumber,
        amount,
        dueDate,
        items
      });

      await invoice.save();

      const populatedInvoice = await Invoice.findById(invoice._id)
        .populate('studentId', 'name email')
        .populate('classId', 'name grade');

      res.status(201).json(populatedInvoice);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // الحصول على الفواتير
  getInvoices: async (req, res) => {
    try {
      const { studentId, status } = req.query;
      let filter = {};
      if (studentId) filter.studentId = studentId;
      if (status) filter.status = status;

      const invoices = await Invoice.find(filter)
        .populate('studentId', 'name email')
        .populate('classId', 'name grade')
        .sort({ createdAt: -1 });

      res.json(invoices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  },

  // إنشاء طلب دفع عبر Paymob
  createPaymentOrder: async (req, res) => {
    try {
      const { invoiceId } = req.body;
      const invoice = await Invoice.findById(invoiceId).populate('studentId', 'name email');

      if (!invoice) return res.status(404).json({ message: 'الفاتورة غير موجودة' });

      // 1. Auth Token
      const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
        api_key: process.env.PAYMOB_API_KEY
      });
      const authToken = authResponse.data.token;

      // 2. Create Order
      const orderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
        auth_token: authToken,
        delivery_needed: false,
        amount: invoice.amount * 100,
        currency: 'EGP',
        items: invoice.items
      });
      const orderId = orderResponse.data.id;

      // 3. Payment Key
      const paymentKeyResponse = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
        auth_token: authToken,
        amount: invoice.amount * 100,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          first_name: invoice.studentId.name.split(' ')[0],
          last_name: invoice.studentId.name.split(' ').slice(1).join(' '),
          email: invoice.studentId.email,
          phone_number: "01010101010",
          country: "EGY",
          city: "Cairo",
          street: "N/A"
        },
        currency: "EGP",
        integration_id: 1 // غيّر بالـ integration id الصحيح
      });
      const paymentToken = paymentKeyResponse.data.token;

      res.json({
        paymentToken,
        orderId,
        paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/1?payment_token=${paymentToken}`
      });
    } catch (error) {
      console.error('Paymob error:', error.response?.data || error.message);
      res.status(500).json({ message: 'خطأ في إنشاء طلب الدفع' });
    }
  },

  // تأكيد الدفع (webhook)
  confirmPayment: async (req, res) => {
    try {
      const { orderId, transactionId, success } = req.body;

      if (success) {
        await Invoice.findOneAndUpdate(
          { invoiceNumber: { $regex: orderId } },
          {
            status: 'paid',
            paymentDate: new Date(),
            transactionId,
            paymentMethod: 'paymob'
          }
        );
      }

      res.json({ message: 'تم تحديث حالة الدفع' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'خطأ في تأكيد الدفع' });
    }
  }
};

// ✅ أهم شيء: التصدير يكون بعد تعريف كل شيء
module.exports = paymentController;
