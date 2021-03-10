import { UserInputError, AuthenticationError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import * as fetch from 'node-fetch';

import { User } from '../../models/User';
import { Token, tokenType } from '../../models/Token';
import {
    validateLoginInput,
    validateRegisterInput,
    validateResetPassword,
    validateIncomingEmail,
} from '../../utils/validators';
import { createTokens, generateVerificationToken } from '../../utils/auth';
import {
    sendEmail,
    sendDummyEmail,
    sendRegistationConfirmationEmail,
    sendRequestResetPasswordEmail,
} from '../../utils/sendEmail';

export default {
    Query: {
        verifyEmail: async (_, { tokenId }) => {
            const token = await Token.findOne({ token: tokenId });
            if (!token || token.type !== 'EMAIL') {
                return false;
            }

            await User.updateOne({ _id: token.userId }, { isVerified: true });
            await Token.findByIdAndDelete(token._id);

            // TODO: Send User and email saying there account is now verified

            return true;
        },
    },
    Mutation: {
        login: async (_, { email, password }, { res }) => {
            // confirm login valid input
            const { errors, valid } = validateLoginInput(email, password);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            // confirm user exists and is verified
            const user = await User.findOne({ email });
            if (!user) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('User not found', { errors });
            } else if (!user.isVerified) {
                throw new AuthenticationError(
                    'Email must be verified to login'
                );
            }

            // confirm password match
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            // Generate and assign refresh and access tokens
            if (process.env.NODE_ENV !== 'test') {
                const { refreshToken, accessToken } = createTokens(user);
                res.cookie('refresh-token', refreshToken);
                res.cookie('access-token', accessToken);
            }

            return {
                ...user._doc,
                id: user._id,
            };
        },
        register: async (
            _,
            {
                registerInput: {
                    email,
                    password,
                    confirmPassword,
                    firstName,
                    lastName,
                },
            },
            { req }
        ) => {
            // Validate user data
            const { valid, errors } = validateRegisterInput(
                email,
                password,
                confirmPassword
            );
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            // Get user and make sure user doesn't already exist
            const user = await User.findOne({ email });
            if (user) {
                throw new UserInputError('email is already in use', {
                    errors: {
                        email: 'This email is already in use',
                    },
                });
            }

            // Validate the given user email actually exists
            if (process.env.NODE_ENV === 'production') {
                // set to production only so it doesn't waste keys
                const response = await fetch(
                    `http://apilayer.net/api/check?access_key=${process.env.EMAIL_VERIFICATION_API_KEY}&email=${email}`
                );
                const jsonResponse = await response.json();
                if (
                    !jsonResponse.disposable ||
                    !jsonResponse.role ||
                    !jsonResponse.smtp_check ||
                    !jsonResponse.mx_found
                ) {
                    throw new Error('Email provided does not exist');
                }
            }

            // hash password, create and save user
            password = await bcrypt.hash(password, 12);
            const newUser = new User({
                email,
                password,
                createdAt: Date.now(),
                firstName,
                lastName,
            });
            const res = await newUser.save();

            // Generate verification token which will be used to verify user
            const token = await generateVerificationToken(
                newUser,
                tokenType.EMAIL
            );

            // Send email with verification token
            await sendRegistationConfirmationEmail(req, token, email);

            return {
                ...res._doc,
                id: res._id,
            };
        },
        logout: async (_, __, { req, res }) => {
            if (!req.userId) {
                throw new AuthenticationError(
                    'User must must authenticated to logout'
                );
            }

            const user = await User.findOneAndUpdate(
                req.userId,
                { $inc: { count: 1 } },
                { new: true }
            );

            if (!user) {
                throw new AuthenticationError('User does not exist');
            }

            res.clearCookie('access-token');
            res.clearCookie('refresh-token');

            return true;
        },
        deleteAccount: async (_, { email, password }, { req, res }) => {
            if (!req.userId) {
                throw new AuthenticationError(
                    'Must be logged in to delete account'
                );
            }

            const { errors, valid } = validateLoginInput(email, password);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findById(req.userId);
            if (!user) {
                throw new AuthenticationError('User does not exist');
            }

            if (user.email !== email) {
                throw new UserInputError('Username or password does not match');
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw new UserInputError('Username of password does not match');
            }

            res.clearCookie('refresh-token');
            res.clearCookie('access-token');
            await User.deleteOne({ email });

            return true;
        },
        resetPassword: async (_, { password, confirmPassword }) => {
            const { valid, errors } = validateResetPassword(
                password,
                confirmPassword
            );

            // TODO: make sure that user is properly authenticated
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            // TODO: check that token is valid
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('User does not exist');
            }

            // hash password and save user
            password = await bcrypt.hash(password, 12);
            user.password = password;
            await user.save();

            // let user know their credentials have been updated
            const subject = 'Advant Password Reset';
            const text =
                'Your advant password was just reset. If this was not authorized, please respond to this email immediately.';
            const html = `<p>Hi there!<p><br><p>Your account password has just updated at advant.herokuapp.com.</p><br><p>If this was not authorized, please respond to this email immediately.</p>`;
            if (process.env.NODE_ENV === 'production') {
                sendEmail(user.email, subject, text, html);
            } else {
                sendDummyEmail(user.email, subject, text, html);
            }

            return true;
        },
        requestResetPassword: async (_, { email }, { req }) => {
            // make sure user is logged out
            if (req.userId) {
                throw new AuthenticationError(
                    'Cannot perform password reset of this manner while logged in'
                );
            }

            // confirm valid email format
            const { valid, errors } = validateIncomingEmail(email);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            // check email exists
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError(
                    'User with that email does not exist'
                );
            }

            // generate password token
            try {
                const token = await generateVerificationToken(
                    user,
                    tokenType.PASSWORD
                );
            } catch {
                throw new Error(
                    'Cannot create additional password reset request'
                );
            }

            await sendRequestResetPasswordEmail(req, token, email);

            return true;
        },
        resendEmailVerification: async (_, { email }) => {
            // validate email address if of correct type
            const { valid, errors } = validateIncomingEmail(email);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            // get the user
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('User does not exist');
            }

            // create new token
            try {
                const token = await generateVerificationToken(
                    user,
                    tokenType.EMAIL
                );
            } catch {
                throw new Error(
                    'New registration token could not be created. Please check your inbox and spam for an existing email or contact support.'
                );
            }

            // send email with new token
            await sendRegistationConfirmationEmail(req, token, email);

            return true;
        },
    },
};
