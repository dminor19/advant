import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import User from './models/User';
import { createTokens } from './auth';

dotenv.config();

const startServer = async () => {
    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, res }) => ({ req, res }),

        // remove below before production
        introspection: true,
        playground: {
            endpoint: '/graphql',
        },
    });

    app.use(cookieParser());

    app.use(async (req, res, next) => {
        const refreshToken = req.cookies['refresh-token'];
        const accessToken = req.cookies['access-token'];

        if (!refreshToken && !accessToken) {
            return next();
        }

        try {
            const data = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );
            req.userId = data.userId;
            return next();
        } catch {}

        if (!refreshToken) {
            return next();
        }

        let data;

        try {
            data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch {
            return next();
        }

        const user = await User.findById(data.userId);

        // token has been invalidated
        if (!user || user.count !== data.count) {
            return next();
        }

        const tokens = createTokens(user);

        res.cookie('refresh-token', tokens.refreshToken);
        res.cookie('access-token', tokens.accessToken);
        req.userId = user.id;

        next();
    });

    server.applyMiddleware({ app });

    await mongoose
        .connect(process.env.MONGODB_ATLAS, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('MongoDB connected');
        });

    const port = process.env.PORT || 4000;

    app.get('/', (req, res) => {
        res.send('hello');
    });

    app.listen({ port }, () =>
        console.log(
            `Server running at http://localhost:${port}${server.graphqlPath}`
        )
    );
};

startServer();
