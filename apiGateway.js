const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Import MongoDB connection
const { connectMongoDB } = require('./mongoDB');

const { connectProducer } = require('./kafkaProducer');
const { consumeMessages } = require('./kafkaConsumer');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Load proto files for tennis and football
const tennisProtoPath = 'tennis.proto';
const footballProtoPath = 'football.proto';

// Load proto definitions
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

// Connect Kafka producer
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

// Initialize ApolloServer
const server = new ApolloServer({ typeDefs, resolvers });

// Initialize Express application
const app = express();
const port = 3000;

// Connect to MongoDB
connectMongoDB();


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply ApolloServer middleware to the Express application
server.start().then(() => {
  app.use(expressMiddleware(server));
});

// Connect Kafka producer
connectProducer().then(() => {
  console.log('Kafka producer connected');
}).catch((error) => {
  console.error('Error connecting Kafka producer:', error);
});

// Connect Kafka consumer
consumeMessages('product-molka').then(() => { 
  console.log('Kafka consumer connected');
}).catch((error) => {
  console.error('Error connecting Kafka consumer:', error);
});

// Define RESTful endpoints for tennis matches
app.get('/tennis', (req, res) => {
  tennisMatches.SearchTennis({}, (err, response) => {
    if (err) {
      console.error('Error searching tennis matches:', err);
      res.status(500).send('Error searching tennis matches');
    } else {
      res.json(response.tennis_matches);
    }
  });
});

app.get('/tennis/:id', (req, res) => {
  const tennis_id = req.params.id;
  try {
    tennisMatches.GetTennis({ tennis_id }, (err, response) => {
      if (err) {
        console.error('Error getting tennis match by ID:', err);
        res.status(500).send('Error getting tennis match by ID');
      }
      res.json(response.tennis);
    });
  } catch (error) {
    console.error('Error getting tennis match by ID:', error);
    res.status(500).send('Error getting tennis match by ID');
  }
});

app.post('/tennis', (req, res) => {
  const { tournament, player1, player2, date } = req.body;
  tennisMatches.CreateTennis({ tournament, player1, player2, date }, (err, response) => {
    if (err) {
      console.error('Error creating tennis match:', err);
      res.status(500).send('Error creating tennis match');
    } else {
      res.json(response);
    }
  });
});

// Define RESTful endpoints for football matches
app.get('/football', (req, res) => {
  footballMatches.SearchFootball({ query: req.query.query }, (err, response) => {
    if (err) {
      console.error('Error searching football matches:', err);
      res.status(500).send('Error searching football matches');
    } else {
      res.json(response.football_matches);
    }
  });
});

app.get('/football/:id', (req, res) => {
  const id = req.params.id;
  footballMatches.GetFootball({ id }, (err, response) => {
    if (err) {
      console.error('Error getting football match by ID:', err);
      res.status(500).send('Error getting football match by ID');
    } else {
      res.json(response.football);
    }
  });
});

app.post('/football', (req, res) => {
  const { team1, team2, stadium, date } = req.body;
  footballMatches.CreateFootball({ team1, team2, stadium, date }, (err, response) => {
    if (err) {
      console.error('Error creating football match:', err);
      res.status(500).send('Error creating football match');
    } else {
      res.json(response);
    }
  });
});

// Define RESTful endpoint to send message to Kafka 
app.post('/send-message', async (req, res) => {
  const { topic, message } = req.body;
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    });
    res.send('Message sent to Kafka');
  } catch (error) {
    console.error('Error sending message to Kafka:', error);
    res.status(500).send('Failed to send message to Kafka');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`API Gateway server running on port ${port}`);
});
