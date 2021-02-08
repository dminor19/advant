import { gql } from 'apollo-server-express';

export default gql`
    type Customer {
        id: ID!
        email: String!
        createdAt: String!
    }

    type Appointment {
        id: ID!
        start_time: String!
        end_time: String!
        customer: ID!
        createdAt: String!
    }

    input AppointmentInput {
        start_time: String!
        end_time: String!
    }

    type Query {
        hello: String!
        getAllAppointments: [Appointment]
    }

    type Mutation {
        # Customer mutations
        register(email: String!, password: String!): Customer!
        login(email: String!, password: String!): Customer!
        invalidateTokens: Boolean!
        createAppointment(appointmentInput: AppointmentInput!): Appointment!
    }
`;
