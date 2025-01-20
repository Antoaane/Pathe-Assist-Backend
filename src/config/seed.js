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
            password: "labege123", // Remplacer par un mot de passe haché
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
