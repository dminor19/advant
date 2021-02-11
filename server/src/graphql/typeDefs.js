import { gql } from 'apollo-server-express';

export default gql`
    type User {
        id: ID!
        email: String!
        createdAt: String!
        appointments: [Appointment]
    }

    type Appointment {
        id: ID!
        start_time: String!
        end_time: String!
        customer: User!
        servicer: User
        createdAt: String!
        customer_notes: String
        servicer_notes: String
    }

    input AppointmentInput {
        start_time: String!
        end_time: String!
        customer_notes: String
    }

    type Query {
        getAllAppointments: [Appointment]
    }

    type Mutation {
        # User mutations
        register(email: String!, password: String!): User!
        login(email: String!, password: String!): User!
        invalidateTokens: Boolean!

        # Customer/Admin mutations
        createAppointment(appointmentInput: AppointmentInput!): Appointment!
        deleteAppointment(appointmentId: ID!): Appointment!

        # Servicer mutations
        upgradeToServicer: User!
        acceptAppointment(appointmentId: ID!): Appointment!
    }
`;
