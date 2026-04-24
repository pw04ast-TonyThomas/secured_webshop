const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (!req.user?.admin) {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(403).json({ error: "Admin only" });
    }

    return res.redirect("/");
  }

  next();
};