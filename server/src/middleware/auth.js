const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const isPublicGetProductRoute =
    req.method === "GET" &&
    (req.path === "/products" ||
      req.path.startsWith("/products/") ||
      req.path === "/categories" ||
      req.path === "/api/products" ||
      req.path.startsWith("/api/products/") ||
      req.path === "/api/categories");

  if (isPublicGetProductRoute) {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Không có token. Vui lòng đăng nhập.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

module.exports = { verifyToken };
