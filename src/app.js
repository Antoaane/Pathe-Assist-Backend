const express = require('express');
const cors = require('cors');
const cinemaRoutes = require('./routes/cinemaRoutes');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cinemas', cinemaRoutes);

// Database connection
connectDB();

module.exports = app;
