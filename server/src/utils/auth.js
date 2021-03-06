import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Token } from '../models/Token';

export const createTokens = (user) => {
    const refreshToken = jwt.sign(
        {
            userId: user.id,
            count: user.count,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
        { userId: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m' }
    );

    return { refreshToken, accessToken };
};

export const generateVerificationToken = async (user, type) => {
    const tokenString = crypto.randomBytes(64).toString('hex');
    const token = new Token({
        userId: user._id,
        token: tokenString,
        type,
    });
    await token.save();
    return token;
};
