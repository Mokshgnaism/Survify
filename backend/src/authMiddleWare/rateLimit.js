import rateLimit from "express-rate-limit";

const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 5, 
  message: {
    status: 429,
    message: "Too many OTP requests. Please try again after 10 minutes.",
  },
  standardHeaders: true, 
  legacyHeaders: false,  
});

const loginRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    status: 429,
    message: "Too many login requests. Please try again after 10 minutes.",
  },
  standardHeaders: true, 
  legacyHeaders: false,  
});

// ✅ Export both together
export { otpRequestLimiter, loginRequestLimiter };
