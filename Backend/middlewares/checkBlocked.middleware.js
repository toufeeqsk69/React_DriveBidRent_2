const checkBlocked = (req, res, next) => {
  if (req.user && req.user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked. You can view your data but cannot perform this action. Please contact admin for assistance.'
    });
  }
  next();
};

export default checkBlocked;
