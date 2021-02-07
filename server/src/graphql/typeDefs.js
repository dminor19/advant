import { gql } from 'apollo-server-express';

export default gql`
    type User {
        id: ID!
        email: String!
        createdAt: String!
    }

    type Query {
        hello: String!
        # getServices: [Service!]!
    }

    type Mutation {
        register(email: String!, password: String!): User!
        login(email: String!, password: String!): User!
        invalidateTokens: Boolean!
    }
`;
