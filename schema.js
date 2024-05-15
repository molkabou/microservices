const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  type TennisMatch {
    id: String!
    tournament: String!
    player1: String!
    player2: String!
    date: String!
  }

  type FootballMatch {
    id: String!
    team1: String!
    team2: String!
    stadium: String!
    date: String!
  }

  input FootballMatchInput {
    team1: String!
    team2: String!
    stadium: String!
    date: String!
  }

  input TennisMatchInput {
    tournament: String!
    player1: String!
    player2: String!
    date: String!
  }

  type Query {
    tennis(id: String!): TennisMatch
    tennisMatches: [TennisMatch]
    football(id: String!): FootballMatch
    footballMatches: [FootballMatch]
  }

  type Mutation {
    createFootballMatch(input: FootballMatchInput!): FootballMatch!
    createTennisMatch(input: TennisMatchInput!): TennisMatch!
  }
`;

module.exports = typeDefs;
