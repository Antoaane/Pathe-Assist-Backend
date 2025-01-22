const Cinema = require('../models/Cinema');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const axios = require("axios");
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const convertFileToBase64 = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data.toString("base64"));
        });
    });
};

const extractJson = (responseText) => {
    try {
        // Supprime les balises Markdown si présentes
        const cleanedText = responseText
        .replace(/```json/g, "") // Supprime ```json
        .replace(/```/g, ""); // Supprime ```
        
        // Tente de parser le JSON propre
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Erreur de parsing JSON :", error);
        return null;
    }
};

const sendImageToGemini = async (base64Image, prompt) => {

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const result = await model.generateContent([
            prompt, { 
                inlineData: { 
                    mimeType: "image/jpeg", 
                    data: base64Image 
                } 
            },
        ]);
        
        return result;
    } catch (error) {
        console.error("Erreur Gemini :", error);
        return null;
    }
};

function removeDuplicates(jsonArray) {
    const uniqueItems = new Map();

    jsonArray.forEach(item => {
        // On génère une clé unique pour chaque élément en concaténant ses valeurs
        const key = JSON.stringify(item);
        uniqueItems.set(key, item); // Seul l'élément unique est conservé
    });

    return Array.from(uniqueItems.values()); // Retourne un tableau d'objets uniques
}

const addSession = async (req, res) => {
    const filePath = req.file.path; 

    const prompt = `Analyse de l'image. Récupères TOUTES les lignes du tableau de l'image jointe et que tu me les transformes en des objets JSON ayant les caractéristiques suivantes : name, room, ban, start, play, end. Pour les salles, note uniquement le numéro ou nom de la salle (exemple : "8, IMAX, etc" et non "salle 8, salle IMAX etc"). Pour les ban, cela correspond simplement à la colonne des interdictions. Inscris-y simplement ce que tu y vois d'écrit.

    Exemple :
    [
        {
            "name": "Le Seigneur des Anneaux: La Guerre des Rohirrim",
            "room": "11",
            "ban" : "-12, etc"
            "start": "16:45",
            "play": "17:05",
            "end": "19:19"
        },
        {
            "name": "Vaiana 2",
            "room": "9",
            "ban" : "TP"
            "start": "17:30",
            "play": "17:50",
            "end": "19:29"
        },
        {
            etc...
        },
    ]`;

    try {
        const base64Image = await convertFileToBase64(filePath);
        const jsonResponse = await sendImageToGemini(base64Image, prompt);     

        if (jsonResponse) {
            const data = extractJson(jsonResponse.response.text())
        
            const cinema = await Cinema.findOne({ id: req.cinemaId });
            const sessions = cinema.sessions;
        
            data.forEach(film => {
                sessions.push(film);
            });

            cinema.sessions = removeDuplicates(sessions);

            res.status(200).json(cinema);
        } else {
            res.status(500).json({ message: "erreur lors de l'ajout des sessions" });
        }
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer les séances d'un cinéma
const getCinemaSessions = async (req, res) => {
    try {
        const cinema = await Cinema.findOne({ id : req.cinemaId });
        if (!cinema) return res.status(404).json({ message: "Cinema not found." });

        res.status(200).json(cinema);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCinemaSessions, addSession };
