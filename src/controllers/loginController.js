const Cinema = require('../models/Cinema');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();

const generateToken = (cinemaId) => {
    const JWT_SECRET = process.env.JWT_SECRET;

    return jwt.sign(
        { cinemaId },
        JWT_SECRET,
        { expiresIn: "600h" }
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
            res.status(500).json({ erreur: "Identifiants incorrectes" })
        }

    } else {
        res.status(500).json({ erreur: "champs incomplets" })
    }
}

const verifyToken = async (req, res) => {
    if (req.cinemaId) { 
        res.status(200).json({ message: "token valide." })
    } else {
        res.status(403).json({ message: "token invalide." })
    }
}

module.exports = { login, verifyToken };
