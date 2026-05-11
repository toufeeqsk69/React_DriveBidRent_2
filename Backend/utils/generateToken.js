// utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userType: user.userType,
      email: user.email
    },
    process.env.JWT_SECRET || 'fallback_secret_for_dev',
    {
      expiresIn: "7d",
    }
  );
};

export default generateToken;