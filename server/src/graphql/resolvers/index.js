import usersResolvers from './customerResolvers';

//remove this import later
import Customer from '../../models/Customer';
import Appointment from '../../models/Appointment';

export default {
    Appointment: {
        customer: async (parent) => {
            const customer = await Customer.findById(parent.customer);
            if (!customer) {
                throw new Error('Customer does not exist');
            }
            return customer;
        },
    },
    Customer: {
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
