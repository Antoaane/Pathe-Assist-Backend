const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    room: { type: String, required: true },
    ban: { type: String, required: true },
    start: { type: String, required: true },
    play: { type: String, required: true },
    end: { type: String, required: true },
    validation: { type: Boolean, required: true, default: false },
    id: { type: Number, required: true },
    next: { type: Object, default: {}}
});

const cinemaSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    login: { type: String, required: true },
    password: { type: String, required: true }, // Attention : stocker les mots de passe hachés !
    sessions: { type: [sessionSchema], default: [] },
});

module.exports = mongoose.model('Cinema', cinemaSchema);
