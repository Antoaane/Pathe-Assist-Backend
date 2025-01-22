const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token manquant." });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.cinemaId = payload.cinemaId;
        
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token invalide.", err });
    }
}

module.exports = authenticateToken;
