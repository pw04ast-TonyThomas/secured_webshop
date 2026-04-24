const express = require("express");

const router = express.Router();
const controller = require("../controllers/HomeController");
// Import the Auth middleware
const auth       = require('../middleware/auth');

// Use the middleware
router.use(auth)

router.get("/", controller.index);

module.exports = router;

