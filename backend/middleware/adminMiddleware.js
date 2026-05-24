const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'وصول مرفوض. تحتاج صلاحيات أدمن' });
  }
  next();
};

module.exports = adminMiddleware;