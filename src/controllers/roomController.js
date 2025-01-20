const Room = require('../models/Room');

const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateRoomStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const room = await Room.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRooms, updateRoomStatus };
