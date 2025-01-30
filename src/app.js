const express = require('express');
const http = require('http');
const cors = require('cors');
const cinemaRoutes = require('./routes/cinemaRoutes');
const connectDB = require('./config/db');
const { createWebSocketServer } = require('./config/websocket');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Partage du serveur HTTP entre Express et WebSocket

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', cinemaRoutes);

// Database connection
connectDB();

// Configuration du serveur WebSocket
createWebSocketServer(server);

module.exports = { app, server };
