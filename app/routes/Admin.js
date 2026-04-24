const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AdminController');
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

router.get('/users', auth, adminOnly, controller.getUsers);

module.exports = router;
