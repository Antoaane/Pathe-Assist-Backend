const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    room: { type: String, required: true },
    ban: { type: String, required: true },
    start: { type: String, required: true },
    play: { type: String, required: true },
    end: { type: String, required: true },
    danger: { type: Number, required: true },
    id: { type: Number, required: true },
});

const cinemaSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    login: { type: String, required: true },
    password: { type: String, required: true }, // Attention : stocker les mots de passe hachés !
    sessions: { type: [sessionSchema], default: [] },
});

module.exports = mongoose.model('Cinema', cinemaSchema);
