const Cinema = require('../models/Cinema');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const axios = require("axios");
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const timeToMinutes = (time) => {
    try {
        let [hours, minutes] = time.split(":").map(Number);
    
        if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
            throw new Error(`Invalid time format: ${time}`);
        }

        let totalMinutes = hours * 60 + minutes;

        if (hours < 6) {
            totalMinutes += 1440;
        }

        return totalMinutes;
    } catch (error) {
        console.error(error.message);
        return null;
    }
    
    
};

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

const removeDuplicates = async (array) => {
    const accumulator = { keys: new Set(), result: [] };

    return array.reduce((acc, item) => {
        const key = `${item.room}-${item.start}`;

        if (!acc.keys.has(key)) {
            acc.keys.add(key);

            acc.result.push(item);
        }

        return acc;
    }, accumulator).result; 
};

const assignNextSession = (sessions) => {
    let sortedSessions = [...sessions].sort((a, b) => timeToMinutes(a.end) - timeToMinutes(b.end));

    // sortedSessions[44].next = [{
    //     "test": "test"
    // }];

    // const testSession = sortedSessions[44];

    sortedSessions.forEach((currentSession) => {
        sortedSessions.forEach((sessionToCompare) => {
            if ((currentSession.room === sessionToCompare.room) && (timeToMinutes(currentSession.start) - timeToMinutes(sessionToCompare.start) < 0)) {
                currentSession.next = sessionToCompare;
            }
        });
    });

    sortedSessions.forEach((cleaning) => {
        if (cleaning.next) {
            if (cleaning.next.next) {
                console.log(cleaning);
                cleaning.next.next = null;
            }
        }
    });

    return sortedSessions; 
};

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
        // const jsonResponse = [
        //     {
        //         "name": "Ma mini-séance : Mon beau sapin",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "10:30",
        //         "play": "10:45",
        //         "end": "11:20",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e802",
        //         "id": 0
        //     },
        //     {
        //         "name": "Ma mini-séance : Mon beau sapin",
        //         "room": "5",
        //         "ban": "TP",
        //         "start": "10:30",
        //         "play": "10:45",
        //         "end": "11:20",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1e1",
        //         "id": 1
        //     },
        //     {
        //         "name": "SONIC 3 - le film",
        //         "room": "9",
        //         "ban": "TP",
        //         "start": "10:30",
        //         "play": "10:50",
        //         "end": "12:40",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1e2",
        //         "id": 2
        //     },
        //     {
        //         "name": "Vaiana 2",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "10:45",
        //         "play": "11:05",
        //         "end": "12:44",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e804",
        //         "id": 3
        //     },
        //     {
        //         "name": "Vaiana 2",
        //         "room": "10",
        //         "ban": "TP",
        //         "start": "10:45",
        //         "play": "11:05",
        //         "end": "12:44",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1e3",
        //         "id": 4
        //     },
        //     {
        //         "name": "Niko le petit renne, mission Père Noël",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "11:00",
        //         "play": "11:20",
        //         "end": "12:45",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e805",
        //         "id": 5
        //     },
        //     {
        //         "name": "Niko le petit renne, mission Père Noël",
        //         "room": "14",
        //         "ban": "TP",
        //         "start": "11:00",
        //         "play": "11:20",
        //         "end": "12:45",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1e4",
        //         "id": 6
        //     },
        //     {
        //         "name": "La chambre d'à côté",
        //         "room": "8",
        //         "ban": "TP",
        //         "start": "10:45",
        //         "play": "11:05",
        //         "end": "12:52",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1e6",
        //         "id": 7
        //     },
        //     {
        //         "name": "L'Amour au présent",
        //         "room": "15",
        //         "ban": "TP",
        //         "start": "10:45",
        //         "play": "11:05",
        //         "end": "12:52",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1e7",
        //         "id": 8
        //     },
        //     {
        //         "name": "Totto-chan, la petite fille à la fenêtre",
        //         "room": "12",
        //         "ban": "TP",
        //         "start": "10:45",
        //         "play": "11:05",
        //         "end": "12:59",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1e8",
        //         "id": 9
        //     },
        //     {
        //         "name": "Criminal Squad: Pantera",
        //         "room": "11",
        //         "ban": "TP",
        //         "start": "10:30",
        //         "play": "10:50",
        //         "end": "13:00",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1e9",
        //         "id": 10
        //     },
        //     {
        //         "name": "Mufasa : Le Roi Lion",
        //         "room": "1",
        //         "ban": "TP",
        //         "start": "10:45",
        //         "play": "11:05",
        //         "end": "13:05",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1ea",
        //         "id": 11
        //     },
        //     {
        //         "name": "La Fille d'un grand amour",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "11:15",
        //         "play": "11:35",
        //         "end": "13:09",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e80c",
        //         "id": 12
        //     },
        //     {
        //         "name": "La Fille d'un grand amour",
        //         "room": "4",
        //         "ban": "TP",
        //         "start": "11:15",
        //         "play": "11:35",
        //         "end": "13:09",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1eb",
        //         "id": 13
        //     },
        //     {
        //         "name": "SONIC 3 - le film",
        //         "room": "4DX",
        //         "ban": "TP",
        //         "start": "11:00",
        //         "play": "11:20",
        //         "end": "13:10",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1ec",
        //         "id": 14
        //     },
        //     {
        //         "name": "Un ours dans le Jura",
        //         "room": "3",
        //         "ban": "AVERT",
        //         "start": "11:00",
        //         "play": "11:20",
        //         "end": "13:13",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1ed",
        //         "id": 15
        //     },
        //     {
        //         "name": "Gladiator II",
        //         "room": "16",
        //         "ban": "-12",
        //         "start": "10:30",
        //         "play": "10:50",
        //         "end": "13:20",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1ee",
        //         "id": 16
        //     },
        //     {
        //         "name": "Kraven le chasseur",
        //         "room": "6",
        //         "ban": "AVERT",
        //         "start": "11:00",
        //         "play": "11:20",
        //         "end": "13:27",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1ef",
        //         "id": 17
        //     },
        //     {
        //         "name": "Six jours",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "11:30",
        //         "play": "11:50",
        //         "end": "13:31",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e811",
        //         "id": 18
        //     },
        //     {
        //         "name": "Six jours",
        //         "room": "5",
        //         "ban": "TP",
        //         "start": "11:30",
        //         "play": "11:50",
        //         "end": "13:31",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f0",
        //         "id": 19
        //     },
        //     {
        //         "name": "Nosferatu",
        //         "room": "7",
        //         "ban": "-12 +Avt",
        //         "start": "11:00",
        //         "play": "11:20",
        //         "end": "13:32",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f1",
        //         "id": 20
        //     },
        //     {
        //         "name": "Ma mini-séance : Mon beau sapin",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "14:00",
        //         "play": "14:20",
        //         "end": "14:55",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e813",
        //         "id": 21
        //     },
        //     {
        //         "name": "Ma mini-séance : Mon beau sapin",
        //         "room": "11",
        //         "ban": "TP",
        //         "start": "14:00",
        //         "play": "14:20",
        //         "end": "14:55",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f2",
        //         "id": 22
        //     },
        //     {
        //         "name": "Niko le petit renne, mission Père Noël",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "13:30",
        //         "play": "13:50",
        //         "end": "15:15",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e814",
        //         "id": 23
        //     },
        //     {
        //         "name": "Niko le petit renne, mission Père Noël",
        //         "room": "4",
        //         "ban": "TP",
        //         "start": "13:30",
        //         "play": "13:50",
        //         "end": "15:15",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f3",
        //         "id": 24
        //     },
        //     {
        //         "name": "La Fille d'un grand amour",
        //         "room": "6",
        //         "ban": "TP",
        //         "start": "14:00",
        //         "play": "14:20",
        //         "end": "15:54",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f4",
        //         "id": 25
        //     },
        //     {
        //         "name": "SONIC 3 - le film",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "13:45",
        //         "play": "14:05",
        //         "end": "15:55",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e816",
        //         "id": 26
        //     },
        //     {
        //         "name": "SONIC 3 - le film",
        //         "room": "4DX",
        //         "ban": "TP",
        //         "start": "13:45",
        //         "play": "14:05",
        //         "end": "15:55",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f5",
        //         "id": 27
        //     },
        //     {
        //         "name": "Un ours dans le Jura",
        //         "room": "3",
        //         "ban": "AVERT",
        //         "start": "13:45",
        //         "play": "14:05",
        //         "end": "15:58",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f6",
        //         "id": 28
        //     },
        //     {
        //         "name": "Vaiana 2",
        //         "room": "1",
        //         "ban": "TP",
        //         "start": "14:00",
        //         "play": "14:20",
        //         "end": "15:59",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f7",
        //         "id": 29
        //     },
        //     {
        //         "name": "JURE N°2",
        //         "room": "7",
        //         "ban": "TP",
        //         "start": "13:45",
        //         "play": "14:05",
        //         "end": "15:59",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f8",
        //         "id": 30
        //     },
        //     {
        //         "name": "SONIC 3 - le film",
        //         "room": "9",
        //         "ban": "TP",
        //         "start": "14:00",
        //         "play": "14:20",
        //         "end": "16:10",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1f9",
        //         "id": 31
        //     },
        //     {
        //         "name": "En fanfare",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "14:15",
        //         "play": "14:35",
        //         "end": "16:18",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e81b",
        //         "id": 32
        //     },
        //     {
        //         "name": "En fanfare",
        //         "room": "12",
        //         "ban": "TP",
        //         "start": "14:15",
        //         "play": "14:35",
        //         "end": "16:18",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1fa",
        //         "id": 33
        //     },
        //     {
        //         "name": "Six jours",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "14:30",
        //         "play": "14:50",
        //         "end": "16:31",
        //         "validation": false,
        //         "_id": "6794d687b0987838cd39e81c",
        //         "id": 34
        //     },
        //     {
        //         "name": "Six jours",
        //         "room": "15",
        //         "ban": "TP",
        //         "start": "14:30",
        //         "play": "14:50",
        //         "end": "16:31",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1fb",
        //         "id": 35
        //     },
        //     {
        //         "name": "Conclave",
        //         "room": "5",
        //         "ban": "TP",
        //         "start": "14:15",
        //         "play": "14:35",
        //         "end": "16:35",
        //         "validation": false,
        //         "_id": "67950b2664b40e099ab1e1fc",
        //         "id": 36
        //     },
        //     {
        //         "name": "Vaiana 2",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "15:15",
        //         "play": "15:35",
        //         "end": "17:14",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e856",
        //         "id": 37
        //     },
        //     {
        //         "name": "Jamais sans mon psy",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "15:30",
        //         "play": "15:50",
        //         "end": "17:21",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e857",
        //         "id": 38
        //     },
        //     {
        //         "name": "La Fille d'un grand amour",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "16:15",
        //         "play": "16:35",
        //         "end": "18:09",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e858",
        //         "id": 39
        //     },
        //     {
        //         "name": "SONIC 3 - le film",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "16:30",
        //         "play": "16:50",
        //         "end": "18:40",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e85b",
        //         "id": 40
        //     },
        //     {
        //         "name": "Un ours dans le Jura",
        //         "room": "IMAX",
        //         "ban": "AVERT",
        //         "start": "16:45",
        //         "play": "17:05",
        //         "end": "18:58",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e85e",
        //         "id": 41
        //     },
        //     {
        //         "name": "En fanfare",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "17:00",
        //         "play": "17:20",
        //         "end": "19:03",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e860",
        //         "id": 42
        //     },
        //     {
        //         "name": "La chambre d'à côté",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "17:15",
        //         "play": "17:35",
        //         "end": "19:22",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e863",
        //         "id": 43
        //     },
        //     {
        //         "name": "Vaiana 2",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "17:30",
        //         "play": "17:50",
        //         "end": "19:29",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e864",
        //         "id": 44
        //     },
        //     {
        //         "name": "Six jours",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "17:40",
        //         "play": "18:00",
        //         "end": "19:41",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e866",
        //         "id": 45
        //     },
        //     {
        //         "name": "Mufasa : Le Roi Lion",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "17:45",
        //         "play": "18:05",
        //         "end": "20:05",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e867",
        //         "id": 46
        //     },
        //     {
        //         "name": "SONIC 3 - le film",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "18:30",
        //         "play": "18:50",
        //         "end": "20:40",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e868",
        //         "id": 47
        //     },
        //     {
        //         "name": "En fanfare",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "19:15",
        //         "play": "19:35",
        //         "end": "21:18",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e869",
        //         "id": 48
        //     },
        //     {
        //         "name": "Vingt Dieux",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "19:30",
        //         "play": "19:50",
        //         "end": "21:20",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e86a",
        //         "id": 49
        //     },
        //     {
        //         "name": "L'Amour au présent",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "19:20",
        //         "play": "19:40",
        //         "end": "21:27",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e86b",
        //         "id": 50
        //     },
        //     {
        //         "name": "La Fille d'un grand amour",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "19:45",
        //         "play": "20:05",
        //         "end": "21:39",
        //         "validation": false,
        //         "_id": "6794f0c4b0987838cd39e86d",
        //         "id": 51
        //     },
        //     {
        //         "name": "La chambre d'à côté",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "20:00",
        //         "play": "20:20",
        //         "end": "22:07",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f1c",
        //         "id": 52
        //     },
        //     {
        //         "name": "Mufasa : Le Roi Lion",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "19:50",
        //         "play": "20:10",
        //         "end": "22:10",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f1d",
        //         "id": 53
        //     },
        //     {
        //         "name": "Pirates des Caraïbes : la Malédiction",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "21:00",
        //         "play": "21:20",
        //         "end": "23:43",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f1f",
        //         "id": 54
        //     },
        //     {
        //         "name": "Wicked",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "20:45",
        //         "play": "21:05",
        //         "end": "23:46",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f20",
        //         "id": 55
        //     },
        //     {
        //         "name": "La chambre d'à côté",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "21:40",
        //         "play": "22:00",
        //         "end": "23:47",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f21",
        //         "id": 56
        //     },
        //     {
        //         "name": "SONIC 3 - le film",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "21:50",
        //         "play": "22:10",
        //         "end": "00:00",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f22",
        //         "id": 57
        //     },
        //     {
        //         "name": "Mufasa : Le Roi Lion",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "22:00",
        //         "play": "22:20",
        //         "end": "00:20",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f23",
        //         "id": 58
        //     },
        //     {
        //         "name": "La Fille d'un grand amour",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "22:30",
        //         "play": "22:50",
        //         "end": "00:24",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f24",
        //         "id": 59
        //     },
        //     {
        //         "name": "Sous écrous",
        //         "room": "IMAX",
        //         "ban": "TP",
        //         "start": "22:15",
        //         "play": "22:35",
        //         "end": "00:25",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f25",
        //         "id": 60
        //     },
        //     {
        //         "name": "L'Amour ouf",
        //         "room": "IMAX",
        //         "ban": "AVERT",
        //         "start": "21:30",
        //         "play": "21:50",
        //         "end": "00:30",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f26",
        //         "id": 61
        //     },
        //     {
        //         "name": "Gladiator II",
        //         "room": "IMAX",
        //         "ban": "-12",
        //         "start": "21:45",
        //         "play": "22:05",
        //         "end": "00:35",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f29",
        //         "id": 62
        //     },
        //     {
        //         "name": "Kraven le chasseur",
        //         "room": "IMAX",
        //         "ban": "AVERT",
        //         "start": "22:10",
        //         "play": "22:30",
        //         "end": "00:37",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f2a",
        //         "id": 63
        //     },
        //     {
        //         "name": "Nosferatu",
        //         "room": "IMAX",
        //         "ban": "-12 +Avt",
        //         "start": "22:20",
        //         "play": "22:40",
        //         "end": "00:52",
        //         "validation": false,
        //         "_id": "6794d5e65bed3a53ba546f2e",
        //         "id": 64
        //     }
        // ]
        const jsonResponse = await sendImageToGemini(base64Image, prompt);     

        if (jsonResponse) {
            const cinema = await Cinema.findOne({ id: req.cinemaId });
            const initialSessions = cinema.sessions;
            const data = extractJson(jsonResponse.response.text());
            // const data = jsonResponse;

            data.forEach(film => {
                initialSessions.push(film);
            });

            const sessions = await removeDuplicates(initialSessions);
            const finalSessions = [];

            let i = 0;
            await sessions.forEach(film => {
                film.id = i;
                finalSessions.push(film);
                i++;
            });

            const nextSessions = assignNextSession(finalSessions);
            cinema.sessions = nextSessions;

            await cinema.save();
            res.status(200).json(cinema);
        } else {
            res.status(500).json({ message: "erreur lors de l'ajout des sessions" });
        }
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Erreur lors de la suppression :", err);
            return;
        }
        console.log("Fichier supprimé avec succès !");
    });
};

const getCinemaSessions = async (req, res) => {
    try {
        const cinema = await Cinema.findOne({ id : req.cinemaId });
        if (!cinema) return res.status(404).json({ message: "Cinema not found." });

        res.status(200).json(cinema.sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const validateSession = async (req, res) => {
    try {
        const cinema = await Cinema.findOne({ id : req.cinemaId });
        const sessionIndex = req.params.sessionId;
        const status = req.body.validationStatus;

        cinema.sessions[sessionIndex].validation = status;

        await cinema.save();

        res.status(200).json({ message: cinema.sessions[sessionIndex] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addSession, getCinemaSessions, validateSession };
