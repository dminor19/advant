import jwt from 'jsonwebtoken';

export const createTokens = (user) => {
    const refreshToken = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            count: user.count,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    return { refreshToken, accessToken };
};
