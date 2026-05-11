import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const isAdminLoggedin = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.userType !== "admin" || decoded.userType !== "admin" || decoded.email !== user.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token",
        data: null,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Token is not valid",
      data: null,
    });
  }
};

export default isAdminLoggedin;