const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Cinema = require('../models/Cinema');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        await Cinema.deleteMany();
        console.log('Anciens documents supprimés.');

        const cinema = new Cinema({
            id: "8yBUd8gSU65j2gzKe7F4",
            login: "pathe-labege",
            password: "$2y$10$duQi7ZheUi2M6tlD.Tt.PODS0hb8M6zNMoxz07yjYEvKWHmfkLppq",
            sessions: [],
        });

        await cinema.save();
        console.log("Données seed insérées avec succès.");
    } catch (error) {
        console.error("Erreur lors de l'exécution du seed :", error);
    } finally {
        mongoose.connection.close();
    }
};

seedData();
