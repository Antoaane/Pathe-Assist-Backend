const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cinema = require('../models/Cinema');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        const cinema = new Cinema({
            id: "8yBUd8gSU65j2gzKe7F4",
            login: "pathe-labege",
            password: "$2y$10$duQi7ZheUi2M6tlD.Tt.PODS0hb8M6zNMoxz07yjYEvKWHmfkLppq", // Remplacer par un mot de passe haché
            sessions: [] // Une session vide pour démarrer
        });

        await cinema.save();
        console.log("Seed data inserted successfully.");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding data:", error);
        mongoose.connection.close();
    }
};

seedData();
