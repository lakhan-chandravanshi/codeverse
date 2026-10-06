const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const protect = require('../middlewares/auth');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getProfile);

module.exports = router;
