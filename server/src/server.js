import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import helmet from 'helmet';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { verifyToken } from './middlewares/auth';

dotenv.config();

const startServer = async () => {
    const app = express();

    // graphql server definition
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, res }) => ({ req, res }),
    });

    app.use(express.static(path.resolve(__dirname, '../../web/build')));

    // Middlewares
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(verifyToken);

    server.applyMiddleware({ app });

    // connect to server in prod or dev
    const serverAddress =
        process.env.NODE_ENV == 'production'
            ? process.env.MONGODB_ATLAS
            : 'mongodb://127.0.0.1/advant';
    await mongoose
        .connect(serverAddress, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
        .then(() => {
            console.log('MongoDB database connected');
        });

    // serve the routes from the web
    app.get('*', (_, res) => {
        res.sendFile(path.resolve(__dirname, '../../web/build', 'index.html'));
    });

    // start server
    const port = process.env.PORT || 4000;
    app.listen({ port }, () =>
        console.log(
            `Server running at http://localhost:${port}${server.graphqlPath}`
        )
    );
};

startServer();
