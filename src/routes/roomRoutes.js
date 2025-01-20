const express = require('express');
const { getRooms, updateRoomStatus } = require('../controllers/roomController');
const router = express.Router();

router.get('/', getRooms);
router.put('/:id', updateRoomStatus);

module.exports = router;
