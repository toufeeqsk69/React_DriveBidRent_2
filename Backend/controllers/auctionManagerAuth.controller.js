// controllers/auctionManagerAuth.controller.js
import AuctionManager from '../models/AuctionManager.js';
import generateToken from '../utils/generateToken.js';

const auctionManagerAuthController = {
  // === AUCTION MANAGER SIGNUP ===
  signup: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        city,
        termsAccepted,
      } = req.body;

      // === VALIDATIONS ===
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }

      if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number must be 10 digits starting with 6-9" 
        });
      }

      if (!dateOfBirth) {
        return res.status(400).json({ 
          success: false, 
          message: "Date of birth is required" 
        });
      }

      // Age validation (must be 18+)
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age < 18) {
        return res.status(400).json({ 
          success: false, 
          message: "You must be at least 18 years old" 
        });
      }

      // Password strength validation
      if (password.length < 8) {
        return res.status(400).json({ 
          success: false, 
          message: "Password must be at least 8 characters" 
        });
      }

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
          success: false, 
          message: "Password must contain at least one letter, one digit, and one special character (@$!%*?&)" 
        });
      }

      if (!city || !city.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: "City is required" 
        });
      }

      if (!termsAccepted) {
        return res.status(400).json({ 
          success: false, 
          message: "You must accept the terms and conditions" 
        });
      }

      // Check for existing auction manager with same email or phone
      const existingManager = await AuctionManager.findOne({ 
        $or: [{ email }, { phone }] 
      });
      
      if (existingManager) {
        return res.status(409).json({ 
          success: false, 
          message: "Email or phone number already exists" 
        });
      }

      // Create new auction manager
      const auctionManagerData = {
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth: dob,
        city,
        approved: false, // Auction managers need admin approval
      };

      const auctionManager = new AuctionManager(auctionManagerData);
      await auctionManager.save();

      // Note: We don't generate token or login immediately for auction managers
      // They need admin approval first
      return res.status(201).json({
        success: true,
        message: "Auction Manager account created successfully. Awaiting admin approval.",
        manager: {
          id: auctionManager._id,
          firstName: auctionManager.firstName,
          lastName: auctionManager.lastName,
          email: auctionManager.email,
          approved: auctionManager.approved
        }
      });

    } catch (err) {
      console.error("Auction Manager Signup error:", err);

      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message).join('; ');
        return res.status(400).json({ success: false, message: messages });
      }

      const message = err.code === 11000 
        ? "Auction Manager with this email or phone already exists" 
        : "Signup failed";
      
      return res.status(err.code === 11000 ? 409 : 500).json({ 
        success: false, 
        message 
      });
    }
  },

  // === AUCTION MANAGER LOGIN ===
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Auction Manager login attempt for email:', email);

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Email and password are required" 
        });
      }

      // Find auction manager
      const auctionManager = await AuctionManager.findOne({ email });
      console.log('Auction Manager found:', auctionManager ? 'YES' : 'NO');

      if (!auctionManager) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Verify password
      const isPasswordValid = await auctionManager.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Check if approved
      if (!auctionManager.approved) {
        return res.status(403).json({ 
          success: false, 
          message: "Your account is pending admin approval. Please wait for approval.",
          approved: false
        });
      }

      // Generate token with userType as 'auction_manager'
      const tokenData = {
        _id: auctionManager._id,
        userType: 'auction_manager',
        email: auctionManager.email
      };
      
      const token = generateToken(tokenData);
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("jwt", token, { 
        httpOnly: true, 
        sameSite: isProd ? "none" : "strict", 
        secure: isProd,
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });

      const responseManager = {
        _id: auctionManager._id,
        id: auctionManager._id,
        userType: 'auction_manager',
        firstName: auctionManager.firstName,
        lastName: auctionManager.lastName,
        email: auctionManager.email,
        phone: auctionManager.phone,
        city: auctionManager.city,
        approved: auctionManager.approved
      };

      console.log('Sending response with auction manager:', responseManager);

      return res.json({
        success: true,
        message: "Login successful",
        redirect: "/auctionmanager",
        user: responseManager,
        token
      });

    } catch (err) {
      console.error("Auction Manager Login error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Login failed" 
      });
    }
  },

  // === AUCTION MANAGER LOGOUT ===
  logout: (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: isProd ? "none" : "strict",
      secure: isProd
    });
    return res.json({ 
      success: true, 
      message: "Logged out successfully",
      redirectUrl: '/'
    });
  }
};

export default auctionManagerAuthController;
