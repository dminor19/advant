import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { verifyToken } from './middlewares/auth';
import { userLoader } from './graphql/dataloaders/serviceLoader';
import { appointmentLoader } from './graphql/dataloaders/appointmentLoader';

dotenv.config();

export const startServer = async () => {
    const app = express();

    // graphql server definition
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, res }) => ({
            req,
            res,
            userLoader: userLoader(),
        }),
    });

    // Middlewares
    app.use(
        helmet({
            contentSecurityPolicy:
                process.env.NODE_ENV === 'production' ? true : false,
        })
    );
    app.use(cookieParser());
    app.use(
        cors({
            credentials: true,
            origin:
                process.env.NODE_ENV === 'production'
                    ? process.env.FRONTEND_HOST
                    : '*',
        })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(verifyToken);

    server.applyMiddleware({ app });

    // connect to server in prod or dev
    let serverAddress;
    switch (process.env.NODE_ENV) {
        case 'production':
            serverAddress = process.env.MONGODB_ATLAS;
            break;
        case 'test':
            serverAddress = 'mongodb://127.0.0.1/advant-test';
            break;
        default:
            serverAddress = 'mongodb://127.0.0.1/advant';
    }

    await mongoose
        .connect(serverAddress, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
        .then(() => {
            console.log('MongoDB database connected');
        });

    // start server
    const port = process.env.PORT || 4000;
    app.listen({ port }, () =>
        console.log(
            `Server running at http://localhost:${port}${server.graphqlPath}`
        )
    );

    return app;
};
