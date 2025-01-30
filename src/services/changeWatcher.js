const mongoose = require('mongoose');
const Cinema = require('../models/Cinema');
const WebSocket = require('ws');

function watchChanges(wss) {
    const changeStream = Cinema.watch(); // Utilise le Change Stream du modèle
  
    changeStream.on('change', (change) => {
      console.log('Changement détecté :', change);
  
      // Broadcast aux clients WebSocket
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(change));
        }
      });
    });
  
    changeStream.on('error', (error) => {
      console.error('Erreur dans le Change Stream :', error);
    });
  }

module.exports = { watchChanges };
