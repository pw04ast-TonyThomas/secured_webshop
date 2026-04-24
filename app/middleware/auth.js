// =============================================================
// Middleware d'authentification
// =============================================================

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const publicRoutes = ["/login", "/register"];

  // allow public pages
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const token = req.cookies?.jwt;

  // function to handle unauthenticated cases
  const handleError = (status, message) => {
    // if it's an API call, return JSON
    if (req.originalUrl.startsWith("/api")) {
      return res.status(status).json({ error: message });
    }

    // If it's a web page, redirect
    return res.redirect("/login");
  };

  if (!token) {
    return handleError(401, "Non authentifié");
  }

  try {
    const decoded = jwt.verify(token, process.env.PRIVATEKEY);
    req.user = decoded;
    next();
  } catch (err) {
    return handleError(403, "Token invalide");
  }
};