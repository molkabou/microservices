const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql');

const tennisProtoPath = 'tennis.proto';
const tennisProtoDefinition = protoLoader.loadSync(tennisProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const tennisProto = grpc.loadPackageDefinition(tennisProtoDefinition).tennis;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_imd',
});

const tennisService = {
  GetTennis: (call, callback) => {
    const { tennis_id } = call.request;
    const query = `SELECT * FROM tennis WHERE id = ?`;
    const values = [tennis_id];
    pool.query(query, values, (error, results) => {
      if (error) {
        callback(error);
      } else {
        const tennisMatch = results[0];
        callback(null, { tennis: tennisMatch });
      }
    });
  },
  SearchTennis: (call, callback) => {
    const { query } = call.request;
    const searchTennis = `SELECT * FROM tennis WHERE tournament LIKE ? OR player1 LIKE ? OR player2 LIKE ? OR date LIKE ?`;
    const values = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
    pool.query(searchTennis, values, (error, results) => {
      if (error) {
        callback(error);
      } else {
        const tennisMatches = results;
        callback(null, { tennis_matches: tennisMatches });
      }
    });
  },
  CreateTennis: (call, callback) => {
    const { tournament, player1, player2, date } = call.request;
    const query = 'INSERT INTO tennis (tournament, player1, player2, date) VALUES (?, ?, ?, ?)';
    const values = [tournament, player1, player2, date];
    pool.query(query, values, (error, results) => {
      if (error) {
        callback(error);
      } else {
        const id = results.insertId;
        callback(null, { tennis_id: id });
      }
    });
  }
};

const server = new grpc.Server();
server.addService(tennisProto.TennisService.service, tennisService);

const port = 50053;
server.bindAsync(`localhost:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }
  console.log(`Server running on port ${port}`);
  server.start();
});

console.log(`Tennis microservice running on port ${port}`);
