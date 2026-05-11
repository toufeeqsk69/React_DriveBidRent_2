// controllers/superAdminControllers/createAdmin.controller.js
import User from '../../models/User.js';

const createAdminController = {
  createAdmin: async (req, res) => {
    try {
      const { email, password, phone } = req.body;

      // === VALIDATIONS ===
      if (!email || !password || !phone) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required (email, password, phone).'
        });
      }

      // Email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format.'
        });
      }

      // Password min length
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters.'
        });
      }

      // Phone: exactly 10 digits
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be exactly 10 digits.'
        });
      }

      // Check for existing user with same email or phone
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Phone number';
        return res.status(409).json({
          success: false,
          message: `${field} already exists.`
        });
      }

      // Create the admin user
      // firstName and lastName are required by the schema — use sensible defaults
      const newAdmin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email,
        password, // hashed automatically by User schema pre-save hook
        phone,
        userType: 'admin'
      });

      await newAdmin.save();

      return res.status(201).json({
        success: true,
        message: 'Admin created successfully.',
        admin: {
          id: newAdmin._id,
          email: newAdmin.email,
          phone: newAdmin.phone,
          userType: newAdmin.userType
        }
      });

    } catch (err) {
      console.error('Create Admin error:', err);

      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'User already exists.'
        });
      }

      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message).join('; ');
        return res.status(400).json({ success: false, message: messages });
      }

      return res.status(500).json({
        success: false,
        message: 'Server error. Could not create admin.'
      });
    }
  }
};

export default createAdminController;
