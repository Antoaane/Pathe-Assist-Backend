const WebSocket = require('ws');
const { watchChanges } = require('../services/changeWatcher');

function createWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

        // console.log("serveur créé: ", wss)

        wss.on('connection', (ws) => {
            console.log('Client connecté.');

            // Envoie un message au client connecté
            ws.send(JSON.stringify({ message: 'Bienvenue !' }));

            // Événement de déconnexion du client
            ws.on('close', () => {
                console.log('Client déconnecté.');
            });
        });

    // Watch des changements MongoDB et broadcast aux clients
    watchChanges(wss);
}

module.exports = { createWebSocketServer };
