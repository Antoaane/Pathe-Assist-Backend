const express = require('express');
const multer = require("multer");

const authenticateToken = require('../middlewares/tokenVerification')
const { login } = require('../controllers/loginController')
const { getCinemaSessions, validateSession, addSession } = require('../controllers/cinemaController');

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post('/login', login);

router.get('/sessions', authenticateToken, getCinemaSessions);
router.post('/sessions', upload.single("image"), authenticateToken, addSession);
router.post('/sessions/:sessionId', authenticateToken, validateSession);

module.exports = router;
