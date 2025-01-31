const express = require('express');
const multer = require("multer");

const authenticateToken = require('../middlewares/tokenVerification')
const { login, verifyToken } = require('../controllers/loginController')
const { getCinemaSessions, validateSession, addSession, resetCinemaSessions } = require('../controllers/cinemaController');

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get('/', (req, res) => {
    res.send('Backend is running!');
});

router.post('/login', login);
router.get('/token', authenticateToken, verifyToken);

router.get('/sessions/reset', authenticateToken, resetCinemaSessions);
router.get('/sessions', authenticateToken, getCinemaSessions);
router.post('/sessions', upload.single("image"), authenticateToken, addSession);
router.post('/sessions/:sessionId', authenticateToken, validateSession);

module.exports = router;
