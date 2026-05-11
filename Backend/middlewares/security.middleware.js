import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "http://localhost",
    ].filter(Boolean);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
};

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => (
    req.url.includes('/notifications') ||
    req.url.includes('/auction/') ||
    req.url.includes('/buyer/dashboard') ||
    req.url.includes('/seller/dashboard') ||
    req.url.includes('/mechanic/dashboard') ||
    req.url.includes('/auctionmanager/dashboard') ||
    req.url.includes('/wishlist') ||
    req.url.includes('/api/chat') ||
    req.url.includes('/api/inspection-chat') ||
    req.url.includes('/api/buyer/')
  )
});

export { corsOptions, helmetConfig, limiter };
