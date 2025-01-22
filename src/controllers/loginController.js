const Cinema = require('../models/Cinema');
const bcrypt = require("bcrypt");
require('dotenv').config();

const validatePassword = async (id, password) => {
    const cinema = await Cinema.findOne({ id });

    if (cinema) {
        const storedHash = cinema.password;

        bcrypt.compare(password, storedHash, (err, isMatch) => {
            if (err) {
                return false;
            }
        
            if (isMatch) {
                return true;
            } else {
                console.log("Mot de passe incorrect.");
            }
        });
    }
}

const login = (req, res) => {
    const login = req.body;

    if (login.id && login.password) {

    } else {
        res.status(500).json("erreur", "champs incomplets")
    }
}

module.exports = { login };
