const express = require('express');
const multer = require("multer");
const axios = require("axios");
const { login } = require('../controllers/loginController')
const authenticateToken = require('../middlewares/tokenVerification')
const { getCinemaSessions, addSession } = require('../controllers/cinemaController');

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post('/login', login);

router.get('/sessions', authenticateToken, getCinemaSessions);
router.post('/sessions', upload.single("image"), authenticateToken, addSession);

module.exports = router;
