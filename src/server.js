const { server } = require('./app'); // Importe le serveur HTTP partagé
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
