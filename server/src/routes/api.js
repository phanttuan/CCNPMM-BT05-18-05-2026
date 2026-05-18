const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

// Controllers
const authController = require("../controllers/authController");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");

// Middleware
const { verifyToken } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { handleValidationErrors } = require("../middleware/validate");
const { loginLimiter, apiLimiter, otpLimiter } = require("../middleware/rateLimiter");

// === AUTH ROUTES ===

// Validation rules cho register
const registerValidation = [
  body("name").trim().notEmpty().withMessage("TÃªn khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng"),
  body("email").isEmail().withMessage("Email khÃ´ng há»£p lá»‡").normalizeEmail(),
  body("phone")
    .optional()
    .isMobilePhone("vi-VN")
    .withMessage("Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±"),
];

// Validation rules cho login
const loginValidation = [
  body("email").isEmail().withMessage("Email khÃ´ng há»£p lá»‡").normalizeEmail(),
  body("password").notEmpty().withMessage("Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng"),
];

// Validation rules cho reset password
const resetPasswordValidation = [
  body("email").isEmail().withMessage("Email khÃ´ng há»£p lá»‡").normalizeEmail(),
  body("otp").notEmpty().withMessage("OTP khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Máº­t kháº©u má»›i pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±"),
];

// Validation rules cho request OTP
const requestOtpValidation = [
  body("email").isEmail().withMessage("Email khÃ´ng há»£p lá»‡").normalizeEmail(),
];

// POST /api/auth/request-register-otp - Lá»›p 1 (validate) + Lá»›p 2 (rate limit)
router.post(
  "/auth/request-register-otp",
  apiLimiter,
  registerValidation,
  handleValidationErrors,
  authController.requestRegisterOtp
);

// POST /api/auth/verify-register-otp - Lá»›p 1 + Lá»›p 2
router.post(
  "/auth/verify-register-otp",
  otpLimiter,
  [
    body("email").isEmail().withMessage("Email khÃ´ng há»£p lá»‡").normalizeEmail(),
    body("otp").notEmpty().withMessage("OTP khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng"),
  ],
  handleValidationErrors,
  authController.verifyRegisterOtp
);

// POST /api/auth/login - Lá»›p 1 + Lá»›p 2 (strict)
router.post(
  "/auth/login",
  loginLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

// GET /api/auth/me - Lá»›p 3 (JWT)
router.get("/auth/me", verifyToken, authController.getMe);

// POST /api/auth/logout - Lá»›p 3
router.post("/auth/logout", verifyToken, authController.logout);

// POST /api/auth/request-otp - Lá»›p 1 + Lá»›p 2
router.post(
  "/auth/request-otp",
  otpLimiter,
  requestOtpValidation,
  handleValidationErrors,
  authController.requestOtp
);

// POST /api/auth/reset-password - Lá»›p 1 + Lá»›p 2
router.post(
  "/auth/reset-password",
  apiLimiter,
  resetPasswordValidation,
  handleValidationErrors,
  authController.resetPassword
);

// === PRODUCT ROUTES ===

// GET /api/home - Lá»›p 3 (cáº§n Ä‘Äƒng nháº­p)
router.get("/home", productController.getHomeData);

// GET /api/products - Lá»›p 3
router.get("/products", productController.getProducts);

// GET /api/products/:slug - Lá»›p 3
router.get("/products/:slug", productController.getProductDetail);

// === CATEGORY ROUTES ===
router.get("/categories", categoryController.getCategories);

module.exports = router;


