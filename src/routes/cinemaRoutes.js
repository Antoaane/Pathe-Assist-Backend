const express = require('express');
const { getCinemaSessions, updateSession, addSession } = require('../controllers/cinemaController');
const router = express.Router();

router.get('/:id/sessions', getCinemaSessions);
router.put('/:cinemaId/sessions/:sessionId', updateSession);
router.post('/:id/sessions', addSession);

module.exports = router;
