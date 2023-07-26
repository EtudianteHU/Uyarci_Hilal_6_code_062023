// Importation du package HTTP de Node
const http = require('http');

// Importer l'application app.js
const app = require('./app');


// Sur quel port va tourner l'application,la fonction NormalizePort() va renvoyer un port valide
const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};
const port = normalizePort(process.env.PORT || '3000'); // Par défaut en développement, sauf si pas dispo => process.env.PORT
app.set('port', port);

// Error handler recherche les différentes erreurs et les gère de manière appropriée
const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// createServer() prends en argument la fonction appelé à chaque requête reçu par le serveur
// ici les fonctions seront dans app
const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

// Le serveur écoute les requêtes sur le port
server.listen(port);