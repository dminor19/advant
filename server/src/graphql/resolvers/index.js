import usersResolvers from './userResolvers';
import authResolvers from './authResolvers';

//remove this import later
import { Appointment } from '../../models/Appointment';

export default {
    Appointment: {
        customer: async ({ customer }, __, { userLoader }) => {
            if (!customer) return null;
            return await userLoader.load(customer);
        },
        servicer: async ({ servicer }, __, { userLoader }) => {
            if (!servicer) return null;
            return await userLoader.load(servicer);
        },
    },
    User: {
        appointments: async ({ appointments }) => {
            if (!appointments) return null;
            return await Appointment.find({ _id: { $in: appointments } });
        },
    },
    Query: {
        ...usersResolvers.Query,
        ...authResolvers.Query,
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...authResolvers.Mutation,
    },
};
