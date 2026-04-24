const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AuthController');
// Import the Auth middleware
const auth       = require('../middleware/auth');

router.post('/login',    controller.login);
router.post('/register', controller.register);
// Check if user is logged in, uses auth middleware.
router.get("/me", auth, (req, res) => {
  res.json({
    loggedIn: true,
    user: req.user
  });
});
// Logout route.
router.post('/logout', auth, (req, res) => {
  res.clearCookie('jwt');
  res.json({ message: "Logged out" });
});

module.exports = router;
