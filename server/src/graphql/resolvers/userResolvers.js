import { AuthenticationError } from 'apollo-server-express';

import { User, roles } from '../../models/User';
import Appointment from '../../models/Appointment';
import mongoose from 'mongoose';

export default {
    Query: {
        me: async (_, __, { req }) => {
            if (!req.userId) {
                throw new AuthenticationError(
                    'Must be logged in to view profile'
                );
            }

            const user = await User.findById(req.userId);
            if (!user) {
                throw new AuthenticationError('User does not exist');
            }

            return {
                ...user._doc,
                id: user._doc._id,
            };
        },
        getAllAppointments: async (_, __, { req }) => {
            if (!req.userId) {
                throw new AuthenticationError(
                    'Must be authenticated to view appointments'
                );
            }

            const user = await User.findById(req.userId);
            if (!user) {
                throw new AuthenticationError('User does not exist');
            }

            const appointments = await Appointment.find({
                customer: mongoose.Types.ObjectId(user._id),
            }).sort({ createdAt: -1 });

            return appointments.map((appointment) => ({
                ...appointment._doc,
                id: appointment._id,
            }));
        },
    },
    Mutation: {
        invalidateTokens: async (_, __, { req }) => {
            if (!req.userId) {
                console.log('no userId');
                return false;
            }

            const user = await User.findOneAndUpdate(
                req.userId,
                { $inc: { count: 1 } },
                { new: true }
            );

            if (!user) {
                return false;
            }

            return true;
        },
        createAppointment: async (
            _,
            { appointmentInput: { start_time, end_time, customer_notes } },
            { req }
        ) => {
            if (!req.userId) {
                throw new AuthenticationError('User must be authenticated');
            }

            const user = await User.findById(req.userId);
            if (!user) {
                throw new AuthenticationError('User does not exist');
            }

            if (
                !user.roles.some((role) =>
                    [roles.CUSTOMER, roles.ADMIN].includes(role)
                )
            ) {
                throw new AuthenticationError(
                    'User does not have necessary permissions'
                );
            }

            const newAppointment = new Appointment({
                start_time,
                end_time,
                customer: user.id,
                createdAt: new Date().toISOString(),
            });

            if (customer_notes) {
                newAppointment.customer_notes = customer_notes;
            }

            const res = await newAppointment.save();

            user.appointments.push(res._id);
            user.save();

            return {
                ...res._doc,
                id: res._id,
            };
        },
        deleteAppointment: async (_, { appointmentId }, { req }) => {
            if (!req.userId) {
                throw new AuthenticationError('User must be authenticated');
            }

            if (!appointmentId) {
                throw new Error('No Appointment Provided');
            }

            const deletedAppointment = await Appointment.findByIdAndDelete(
                appointmentId
            );

            if (!deletedAppointment) {
                throw new Error('No Appointment with that ID found');
            }

            return {
                ...deletedAppointment._doc,
                id: deletedAppointment._doc._id,
            };
        },
        upgradeToServicer: async (_, __, { req }) => {
            if (!req.userId) {
                throw new AuthenticationError('User must be authenticated');
            }

            let user = await User.findById(req.userId);

            if (!user) {
                throw new Error('No User with that ID found');
            }

            if (!user.roles.includes(roles.SERVICER)) {
                user.roles.push(roles.SERVICER);
                user = await user.save();
            }

            return {
                ...user._doc,
                id: user._doc._id,
            };
        },
        acceptAppointment: async (_, { appointmentId }, { req }) => {
            if (!req.userId) {
                throw new AuthenticationError('User must be authenticated');
            }

            let user = await User.findById(req.userId);

            if (!user) {
                throw new Error('No User with that ID found');
            } else if (
                !user.roles.some((role) =>
                    [roles.SERVICER, roles.ADMIN].includes(role)
                )
            ) {
                throw new AuthenticationError(
                    'Must be a registered servicer to accept appointment'
                );
            }

            let appointment = await Appointment.findById(appointmentId);

            if (!appointment) {
                throw new Error('No Appointment with that ID found');
            }

            // Put this into validator later
            if (
                appointment.servicer &&
                appointment.servicer._id != req.userId
            ) {
                throw new Error(
                    'Appointment has already been accepted by another Servicer'
                );
            } else if (appointment.customer == user._id) {
                throw new Error("Cannot service one's own appointment");
            } else if (
                appointment.server &&
                appointment.servicer._id == req.userId
            ) {
                return {
                    ...appointment,
                    id: appointment._id,
                };
            }

            // At this point, we can now match the two
            if (!user.appointments.includes(appointment._id)) {
                user.appointments.push(appointment._id);
                await user.save();
            }

            appointment.servicer = user._id;
            appointment = await appointment.save();

            if (!appointment) {
                throw new Error(
                    'Error occurred while trying to update appointment'
                );
            }

            return {
                ...appointment._doc,
                id: appointment._doc._id,
            };
        },
    },
};
