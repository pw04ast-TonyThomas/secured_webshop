// =============================================================
// Middleware d'authentification
// =============================================================

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  try {
    const decoded = jwt.verify(token, process.env.PRIVATEKEY);

    req.user = decoded; // attach user info
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalide" });
  }
};
