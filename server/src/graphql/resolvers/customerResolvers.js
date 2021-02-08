import { UserInputError, AuthenticationError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';

import Customer from '../../models/Customer';
import Appointment from '../../models/Appointment';
import {
    validateLoginInput,
    validateRegisterInput,
} from '../../utils/validators';
import { createTokens } from '../../auth';
import mongoose from 'mongoose';

export default {
    Query: {
        getAllAppointments: async (_, __, { req }) => {
            if (!req.userId) {
                throw new AuthenticationError(
                    'Must be authenticated to view appointments'
                );
            }

            const customer = await Customer.findById(req.userId);
            if (!customer) {
                throw new AuthenticationError('Customer does not exist');
            }

            const appointments = await Appointment.find({
                customer: mongoose.Types.ObjectId(customer._id),
            }).sort({ createdAt: -1 });

            console.log(`appointments: ${appointments}`);

            return appointments;
        },
    },
    Mutation: {
        login: async (_, { email, password }, { res }) => {
            const { errors, valid } = validateLoginInput(email, password);

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const customer = await Customer.findOne({ email });

            if (!customer) {
                errors.general = 'Customer not found';
                throw new UserInputError('Customer not found', { errors });
            }

            const match = await bcrypt.compare(password, customer.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            const { refreshToken, accessToken } = createTokens(customer);

            res.cookie('refresh-token', refreshToken);
            res.cookie('access-token', accessToken);

            return {
                ...customer._doc,
                id: customer._id,
            };
        },
        register: async (_, { email, password }) => {
            // Validate customer data
            const { valid, errors } = validateRegisterInput(email, password);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            // Make sure user doesn't already exist
            const customer = await Customer.findOne({ email });
            if (customer) {
                throw new UserInputError('email is already taken', {
                    errors: {
                        email: 'This email is already taken',
                    },
                });
            }

            // hash password, create and save user, create an auth token
            password = await bcrypt.hash(password, 12);

            const newCustomer = new Customer({
                email,
                password,
                createdAt: new Date().toISOString(),
            });

            const res = await newCustomer.save();

            return {
                ...res._doc,
                id: res._id,
            };
        },
        invalidateTokens: async (_, __, { req }) => {
            if (!req.userId) {
                console.log('no userId');
                return false;
            }

            // TODO: Change this to a single mongo stayment that updates the field
            const customer = await Customer.findById(req.userId);

            if (!user) {
                return false;
            }

            customer.count += 1;
            await customer.save();

            return true;
        },
        createAppointment: async (
            _,
            { appointmentInput: { start_time, end_time } },
            { req }
        ) => {
            if (!req.userId) {
                throw new AuthenticationError('Customer must be authenticated');
            }

            const user = await Customer.findById(req.userId);
            if (!user) {
                throw new AuthenticationError('Customer does not exist');
            }

            const newAppointment = new Appointment({
                start_time,
                end_time,
                customer: user.id,
                createdAt: new Date().toISOString(),
            });

            const res = await newAppointment.save();

            return {
                ...res._doc,
                id: res._id,
            };
        },
    },
};
