import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserInputError } from 'apollo-server-express';

import User from '../../models/User';
import { validateRegisterInput, validateLoginInput } from '../../util/validators';

const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, process.env.SECRET_TOKEN, { expiresIn: '1h' });
}

export default {
    Mutation: {
        async login(_, { username, password }) {
            const {errors, valid} = validateLoginInput(username, password);

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ username });

            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
        async register(_, {
           registerInput: { username, password, confirmPassword, email } 
        })  {
           // Validate user data
           const { valid, errors } = validateRegisterInput( username, email, password, confirmPassword);
           if (!valid) {
               throw new UserInputError('Errors', { errors });
           }

           // Make sure user doesn't already exist
           const user = await User.findOne({ username });
           if (user) {
               throw new UserInputError('Username is already taken', {
                   errors: {
                       username: 'This username is already taken'
                   }
               })
           }

           // hash password, create and save user, create an auth token
           password = await bcrypt.hash(password, 12);

           const newUser = new User({
               email,
               username,
               password,
               createdAt: new Date().toISOString()
           })

           const res = await newUser.save();

           const token = generateToken(res);

           return {
               ...res._doc,
               id: res._id,
               token
           }
       }
    }
}
