const Cinema = require('../models/Cinema');

// Récupérer les séances d'un cinéma
const getCinemaSessions = async (req, res) => {
    try {
        const { id } = req.params;
        const cinema = await Cinema.findOne({ id });
        if (!cinema) return res.status(404).json({ message: "Cinema not found." });

        res.status(200).json(cinema.sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une séance
const updateSession = async (req, res) => {
    try {
        const { cinemaId, sessionId } = req.params;
        const update = req.body;

        const cinema = await Cinema.findOne({ id: cinemaId });
        if (!cinema) return res.status(404).json({ message: "Cinema not found." });

        const sessionIndex = cinema.sessions.findIndex((session) => session.id === parseInt(sessionId));
        if (sessionIndex === -1) return res.status(404).json({ message: "Session not found." });

        cinema.sessions[sessionIndex] = { ...cinema.sessions[sessionIndex], ...update };
        await cinema.save();

        res.status(200).json(cinema.sessions[sessionIndex]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addSession = async (req, res) => {
    try {
        const { id } = req.params; // Identifiant du cinéma
        const newSession = req.body; // Données de la nouvelle séance

        const cinema = await Cinema.findOne({ id });
        if (!cinema) return res.status(404).json({ message: "Cinema not found." });

        // Ajouter la nouvelle séance au tableau sessions
        cinema.sessions.push(newSession);
        await cinema.save();

        res.status(201).json(cinema.sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCinemaSessions, updateSession, addSession };
