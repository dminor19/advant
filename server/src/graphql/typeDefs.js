import { gql } from 'apollo-server-express';

export default gql`
    type User {
        id: ID!
        email: String!
        createdAt: String!
        appointments: [Appointment]
        firstName: String
        lastName: String
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

    input RegisterInput {
        email: String!
        password: String!
        confirmPassword: String!
        firstName: String
        lastName: String
    }

    type Query {
        hello: String
        me: User!
        getAllAppointments: [Appointment]
        verifyEmail(tokenId: String!): Boolean!
    }

    type Mutation {
        # auth mutations
        register(registerInput: RegisterInput): User!
        login(email: String!, password: String!): User!
        logout: Boolean!
        deleteAccount(email: String!, password: String!): Boolean!
        resetPassword(password: String!, confirmPassword: String!): Boolean!
        requestResetPassword(email: String!): Boolean!
        resendEmailVerification(email: String!): Boolean!

        # User Mutation
        addProfilePic(picture: Upload!): Boolean!

        # Eventually this will go with Admin privileges
        invalidateTokens: Boolean!

        # Customer/Admin mutations
        createAppointment(appointmentInput: AppointmentInput!): Appointment!
        deleteAppointment(appointmentId: ID!): Appointment!

        # Servicer mutations
        upgradeToServicer: User!
        acceptAppointment(appointmentId: ID!): Appointment!
    }
`;
