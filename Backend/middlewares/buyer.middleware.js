import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 

const buyerMiddleware = async (req, res, next) => {
  let token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user || 
          req.user.userType !== "buyer" || 
          decoded.userType !== "buyer" || 
          decoded.email !== req.user.email) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Buyer authentication required.',
          redirectUrl: "/"
        });
      }

      // Check if user is blocked
      if (req.user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been blocked. Please contact admin for assistance.',
          redirectUrl: "/"
        });
      }

      next();
    } catch (error) {
      console.error('Error in buyer.middleware:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        redirectUrl: "/"
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login.',
      redirectUrl: "/"
    });
  }
};

export default buyerMiddleware;