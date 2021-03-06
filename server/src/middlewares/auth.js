import jwt from 'jsonwebtoken';

import { User } from '../models/User';
import { createTokens } from '../utils/auth';

export const verifyToken = async (req, res, next) => {
    // check for refresh token
    const refreshToken = req.cookies['refresh-token'];
    const accessToken = req.cookies['access-token'];
    if (!refreshToken && !accessToken) {
        return next();
    }

    // verify valid access token
    try {
        const data = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.userId = data.userId;
        return next();
    } catch {}

    // verify refresh token exists and matches
    if (!refreshToken) {
        return next();
    }
    let data;
    try {
        data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        return next();
    }

    // check token hasn't been invalidated
    const user = await User.findById(data.userId);
    if (!user || user.count !== data.count) {
        res.clearCookie('refresh-token');
        res.clearCookie('access-token');
        return next();
    }

    // assign new tokens
    const tokens = createTokens(user);
    res.cookie('refresh-token', tokens.refreshToken);
    res.cookie('access-token', tokens.accessToken);
    req.userId = user.id;

    next();
};
