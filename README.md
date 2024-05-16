# Microservices Documentation

This documentation provides an in-depth overview of the microservices implemented in the application, outlining their functionality, data schemas, entry points, and interaction methods. Each microservice utilizes a combination of RESTful APIs, gRPC,graphql, and Kafka messaging for communication.
## Microservice: TennisService

The TennisService microservice manages tennis matches within the application. It facilitates operations such as searching for matches, retrieving match details, and creating new matches.

### Data Schemas

The TennisService microservice employs the following data schema:

**TennisMatch**: Represents a tennis match in the application. The schema includes the following fields:
- `id` (string): Unique identifier of the tennis match.
- `tournament` (string): Name of the tournament.
- `player1` (string): Name of the first player.
- `player2` (string): Name of the second player.
- `date` (string): Date of the match.

### Entry Points

The TennisService microservice exposes the following entry points to interact with tennis matches:

- **RESTful API**:
  - `GET /tennis`: Retrieves a list of tennis matches.
  - `GET /tennis/:id`: Retrieves details of a specific tennis match.
  - `POST /tennis`: Creates a new tennis match.

- **gRPC**:
  - `SearchTennis`: Retrieves a list of tennis matches.
  - `GetTennis`: Retrieves the details of a specific tennis match by providing its identifier.
  - `CreateTennis`: Allows the creation of a new tennis match by providing match details.

- **GraphQL**:
  - Query `tennisMatches`: Retrieves a list of tennis matches.
  - Query `tennisMatch(id)`: Retrieves details of a specific tennis match by providing its identifier.
  - Mutation `createTennisMatch(input)`: Creates a new tennis match by providing match details.

### Interactions

- **REST API**: Interacts with the TennisService microservice via HTTP requests.
- **gRPC**: Interacts with the TennisService microservice using gRPC communication protocol.
- **GraphQL**: Interacts with the TennisService microservice using GraphQL queries and mutations.
- **Kafka Messaging**: Utilizes Kafka messaging for asynchronous communication for certain events related to tennis matches.
