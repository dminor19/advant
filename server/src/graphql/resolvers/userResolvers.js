import { UserInputError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';

import User from '../../models/User';
import {
    validateLoginInput,
    validateRegisterInput,
} from '../../utils/validators';
import { createTokens } from '../../auth';

export default {
    Mutation: {
        login: async (_, { email, password }, { res }) => {
            const { errors, valid } = validateLoginInput(email, password);

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ email });

            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            const { refreshToken, accessToken } = createTokens(user);

            res.cookie('refresh-token', refreshToken);
            res.cookie('access-token', accessToken);

            return {
                ...user._doc,
                id: user._id,
            };
        },
        register: async (_, { email, password }) => {
            // Validate user data
            const { valid, errors } = validateRegisterInput(email, password);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            // Make sure user doesn't already exist
            const user = await User.findOne({ email });
            if (user) {
                throw new UserInputError('email is already taken', {
                    errors: {
                        email: 'This email is already taken',
                    },
                });
            }

            // hash password, create and save user, create an auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                password,
                createdAt: new Date().toISOString(),
            });

            const res = await newUser.save();

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
            const user = await User.findById(req.userId);

            if (!user) {
                console.log(`no user with id ${req.userId}`);
                return false;
            }

            user.count += 1;
            await user.save();

            return true;
        },
    },
};
