const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const tennisProtoPath = 'tennis.proto';
const footballProtoPath = 'football.proto';

const tennisProtoDefinition = protoLoader.loadSync(tennisProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const footballProtoDefinition = protoLoader.loadSync(footballProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tennisProto = grpc.loadPackageDefinition(tennisProtoDefinition).tennis;
const footballProto = grpc.loadPackageDefinition(footballProtoDefinition).football;
const tennisMatches = new tennisProto.TennisService('localhost:50053', grpc.credentials.createInsecure());
const footballMatches = new footballProto.FootballService('localhost:50052', grpc.credentials.createInsecure());

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
  Query: {
    tennis: (_, { id }) => {
      return new Promise((resolve, reject) => {
        tennisMatches.getTennis({ tennisId: id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.tennis);
          }
        });
      });
    },
    tennisMatches: () => {
      return new Promise((resolve, reject) => {
        tennisMatches.searchTennis({}, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.tennisMatches);
          }
        });
      });
    },
    football: (_, { id }) => {
      return new Promise((resolve, reject) => {
        footballMatches.getFootball({ football_id: id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.football);
          }
        });
      });
    },
    footballMatches: () => {
      return new Promise((resolve, reject) => {
        footballMatches.searchFootball({}, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.footballs);
          }
        });
      });
    },
  },
  Mutation: {
    createTennisMatch: (_, { input }) => {
      const { tournament, player1, player2, date } = input;
      return new Promise((resolve, reject) => {
        tennisMatches.createTennisMatch({ tournament, player1, player2, date }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    },
    createFootballMatch: (_, { input }) => {
      const { team1, team2, stadium, date } = input;
      return new Promise((resolve, reject) => {
        footballMatches.createFootballMatch({ team1, team2, stadium, date }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      });
    },
  },
};

module.exports = resolvers;
