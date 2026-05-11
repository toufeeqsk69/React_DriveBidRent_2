// controllers/auth.controller.js
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import { sendOTPEmail } from '../utils/email.service.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
  // === SIGNUP ===
  signup: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        userType,
        phone,
        dateOfBirth,
        termsAccepted,
        experienceYears,
        shopName,
        repairBikes,
        repairCars,
        googleAddressLink,
        approved_status,
      } = req.body;

      // Optional field for mechanics only
      const mechanicGoogleLink = userType === "mechanic" ? googleAddressLink : undefined;

      // Normalize address fields (handles both string and array from frontend)
      let doorNo = "", street = "", city = "", state = "";
      ["doorNo", "street", "city", "state"].forEach((field) => {
        const val = req.body[field];
        const normalized = Array.isArray(val) ? val.find(v => v?.trim()) || "" : val || "";
        if (field === "doorNo") doorNo = normalized;
        if (field === "street") street = normalized;
        if (field === "city") city = normalized;
        if (field === "state") state = normalized;
      });

      // Convert boolean values from form
      const isBikeRepair = repairBikes === "on" || repairBikes === true;
      const isCarRepair = repairCars === "on" || repairCars === true;

      // === VALIDATIONS ===
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const allowedTypes = ['buyer', 'seller', 'driver', 'mechanic', 'admin', 'auction_manager', 'superadmin'];
      if (!userType || !allowedTypes.includes(userType)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing userType' });
      }

      if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: "Phone number must be 10 digits" });
      }

      if (!dateOfBirth) {
        return res.status(400).json({ success: false, message: "Date of birth is required" });
      }

      const dob = new Date(dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) {
        return res.status(400).json({ success: false, message: "You must be at least 18 years old" });
      }

      if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
      }

      if (!termsAccepted) {
        return res.status(400).json({ success: false, message: "You must accept terms" });
      }

      // Check for existing user
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(409).json({ success: false, message: "Email or phone already exists" });
      }

      // Check if OTP is globally enabled
      const otpEnabled = process.env.ENABLE_OTP_VERIFICATION === 'true';

      // Build user data
      const userData = {
        firstName,
        lastName,
        email,
        password,
        userType,
        dateOfBirth: dob,
        phone,
        doorNo,
        street,
        city,
        state,
        shopName: userType === 'mechanic' ? shopName : undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        approved_status: approved_status || "No",
        repairBikes: isBikeRepair,
        repairCars: isCarRepair,
        googleAddressLink: mechanicGoogleLink,
        isVerified: !otpEnabled, // verified automatically if OTP is turned off
      };

      if (otpEnabled) {
        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any pending OTP registration attempts for this email
        await OTP.deleteMany({ email });

        // Temporarily store signup data with the code
        await OTP.create({
          email,
          otp: otpCode,
          userData
        });

        // Send Email
        const emailSent = await sendOTPEmail(email, otpCode);
        if (!emailSent) {
          return res.status(500).json({ success: false, message: "Failed to send verification email" });
        }

        return res.status(200).json({
          success: true,
          otpRequired: true,
          email,
          message: "A verification code has been sent to your email.",
        });
      }

      // No OTP required, create account but redirect to login
      const user = new User(userData);
      await user.save();

      const successMessage = user.userType === 'mechanic'
        ? "Account created! Your details are under admin review. You'll be notified once approved."
        : "Account created successfully! Please login to continue.";

      return res.status(201).json({
        success: true,
        message: successMessage,
        redirect: '/login'
      });

    } catch (err) {
      console.error("Signup error:", err);

      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message).join('; ');
        return res.status(400).json({ success: false, message: messages });
      }

      const message = err.code === 11000 ? "User already exists" : "Signup failed";
      return res.status(err.code === 11000 ? 409 : 500).json({ success: false, message });
    }
  },

  // === LOGIN ===
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      if (user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Your account has been blocked by the admin' });
      }

      const token = generateToken(user);
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("jwt", token, { 
        httpOnly: true, 
        sameSite: isProd ? "none" : "strict", 
        secure: isProd,
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });

      const redirectMap = {
        buyer: "/buyer",
        seller: "/seller",
        driver: "/driver-dashboard",
        mechanic: "/mechanic/dashboard",
        admin: "/admin",
        auction_manager: "/auctionmanager",
        superadmin: "/superadmin"
      };

      const redirectUrl = redirectMap[user.userType] || "/";

      const responseUser = {
        _id: user._id,
        id: user._id,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        approved_status: user.approved_status,
        notificationFlag: !!user.notificationFlag,
        doorNo: user.doorNo || '',
        street: user.street || '',
        city: user.city || '',
        state: user.state || ''
      };

      return res.json({
        success: true,
        message: "Login successful",
        redirect: redirectUrl,
        user: responseUser,
        token
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: "Login failed" });
    }
  },

  logout: (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: isProd ? "none" : "strict",
      secure: isProd
    });
    return res.json({ success: true, message: "Logged out successfully" });
  },

  // === GOOGLE OAUTH LOGIN ===
  googleLogin: async (req, res) => {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ success: false, message: "Google credential is required" });
      }

      // Verify the Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, given_name, family_name, name } = payload;

      if (!email) {
        return res.status(400).json({ success: false, message: "Could not get email from Google account" });
      }

      // Check if user already exists by email
      let user = await User.findOne({ email });

      if (user) {
        // Existing user — update googleId if not set
        if (!user.googleId) {
          user.googleId = googleId;
          user.provider = user.provider || 'google';
          await user.save();
        }
      } else {
        // No account exists — require proper signup first
        return res.status(401).json({
          success: false,
          message: "No account found for this email. Please sign up first."
        });
      }

      // Direct login path for Google users
      const token = generateToken(user);
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("jwt", token, { 
        httpOnly: true, 
        sameSite: isProd ? "none" : "strict", 
        secure: isProd,
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });

      const redirectMap = {
        buyer: "/buyer",
        seller: "/seller",
        driver: "/driver-dashboard",
        mechanic: "/mechanic/dashboard",
        admin: "/admin",
        auction_manager: "/auctionmanager",
        superadmin: "/superadmin"
      };

      const redirectUrl = redirectMap[user.userType] || "/";

      const responseUser = {
        _id: user._id,
        id: user._id,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        approved_status: user.approved_status,
        provider: user.provider,
        notificationFlag: !!user.notificationFlag,
        doorNo: user.doorNo || '',
        street: user.street || '',
        city: user.city || '',
        state: user.state || ''
      };

      return res.json({
        success: true,
        message: "Google login successful",
        redirect: redirectUrl,
        user: responseUser,
        token
      });

    } catch (err) {
      console.error("Google login error:", err);

      if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
        return res.status(401).json({ success: false, message: "Google token expired or invalid. Please try again." });
      }

      return res.status(500).json({ success: false, message: "Google login failed" });
    }
  },

  // === VERIFY SIGNUP OTP ===
  verifySignupOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
      }

      // Check the temporary OTP collection instead of User
      const otpRecord = await OTP.findOne({ email });
      if (!otpRecord) {
        return res.status(404).json({ success: false, message: "OTP session expired or not found. Please sign up again." });
      }

      if (otpRecord.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP code" });
      }

      // Valid OTP -> Create the actual user now!
      const user = new User(otpRecord.userData);
      await user.save();

      // Clear the OTP record so it can't be reused
      await OTP.deleteMany({ email });

      const successMessage = user.userType === 'mechanic'
        ? "Email verified & account created! Your details are under admin review. You'll be notified once approved."
        : "Email verified & account created successfully! Please login to continue.";

      return res.status(200).json({
        success: true,
        message: successMessage,
        redirect: '/login'
      });
    } catch (err) {
      console.error("Signup OTP verification error:", err);
      return res.status(500).json({ success: false, message: "OTP verification failed" });
    }
  }
};

export default authController;