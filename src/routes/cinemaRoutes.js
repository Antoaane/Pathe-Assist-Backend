const express = require('express');
const multer = require("multer");
const axios = require("axios");
const { getCinemaSessions, addSession } = require('../controllers/cinemaController');

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get('/:id/sessions', getCinemaSessions);
router.post('/:id/sessions', upload.single("image"), addSession);

module.exports = router;
