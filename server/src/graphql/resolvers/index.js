import usersResolvers from './userResolvers';

//remove this import later
import User from '../../models/User';
import Appointment from '../../models/Appointment';

export default {
    Appointment: {
        customer: async (parent) => {
            const user = await User.findById(parent.customer);
            if (!user) {
                throw new Error('User does not exist');
            }
            return user;
        },
    },
    User: {
        appointments: async (parent) => {
            const appointments = await Appointment.find()
                .where('_id')
                .in(parent.appointments)
                .exec();
            return appointments;
        },
    },
    Query: {
        ...usersResolvers.Query,
    },
    Mutation: {
        ...usersResolvers.Mutation,
    },
};
