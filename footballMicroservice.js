const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql');

// Charger le fichier football.proto
const footballProtoPath = 'football.proto';
const footballProtoDefinition = protoLoader.loadSync(footballProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const footballProto = grpc.loadPackageDefinition(footballProtoDefinition).football;
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'football',
});

const footballService = {
  getFootball: (call, callback) => {
    const { id } = call.request;
    const query = `SELECT * FROM football WHERE id = ${id}`;
    pool.query(query, (error, results) => {
      if (error) {
        callback(error);
      } else {
        const footballMatch = results[0];
        callback(null, { football: footballMatch });
      }
    });
  },
  searchFootball: (call, callback) => {
    const { query } = call.request;
    const searchFootball = `SELECT * FROM football WHERE team1 LIKE '%${query}%' OR team2 LIKE '%${query}%' OR stadium LIKE '%${query}%' OR date LIKE '%${query}%'`;
    pool.query(searchFootball, (error, results) => {
      if (error) {
        callback(error);
      } else {
        const footballMatches = results;
        callback(null, { football_matches: footballMatches });
      }
    });
  },
  createFootball: (call, callback) => {
    const { team1, team2, stadium, date } = call.request;
    const query = 'INSERT INTO football (team1, team2, stadium, date) VALUES (?, ?, ?, ?)';
    const values = [team1, team2, stadium, date];
    pool.query(query, values, (error, results) => {
      if (error) {
        callback(error);
      } else {
        const id = results.insertId;
        callback(null, { id });
      }
    });
  },
};

// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(footballProto.FootballService.service, footballService);
const port = 50053; // Modifier le port si nécessaire
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
  if (err) {
    console.error('Échec de la liaison du serveur:', err);
    return;
  }
  console.log(`Le serveur s'exécute sur le port ${boundPort}`);
  server.start();
});


console.log(`Microservice de football en cours d'exécution sur le port ${port}`);
