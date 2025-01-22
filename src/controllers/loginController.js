const Cinema = require('../models/Cinema');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();

const password = "path3_lAbege-429/";

// // Génère un hash avec 10 "rounds" (niveau de complexité)
// bcrypt.hash(password, 10, (err, hash) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     console.log("Hash généré :", hash);
// });

const generateToken = (cinemaId) => {
    const JWT_SECRET = process.env.JWT_SECRET; // Charge ta clé secrète depuis l'environnement

    return jwt.sign(
        { cinemaId }, // Inclure l'identifiant du cinéma dans le payload
        JWT_SECRET,
        { expiresIn: "15h" } // Durée de validité
    );
};

const validatePassword = async (cinema, password) => {

    const storedHash = cinema.password;

    const validation = await bcrypt.compare(password, storedHash, (err, isMatch) => {

        if (err) {
            return false;
        }
    
        if (isMatch) {
            return isMatch;
        }
    });

    return validation;
}

const login = async (req, res) => {
    const cinemaId = req.body.cinemaId;
    const password = req.body.password;

    if (cinemaId && password) {
        const cinema = await Cinema.findOne({ login: cinemaId });
        
        if (cinema && validatePassword(cinema, password)) {

            const newToken = generateToken(cinema.id);

            return res.status(200).json({
                message: "Authentification réussie.",
                newToken,
            });
        } else {
            res.status(500).json({erreur: "Identifiants incorrectes"})
        }

    } else {
        res.status(500).json({erreur: "champs incomplets"})
    }
}

module.exports = { login };
