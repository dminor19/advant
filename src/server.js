import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

dotenv.config()

const startServer = async () => {
    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        // remove below before production
        introspection: true,
        playground: true
    });

    server.applyMiddleware({ app });

    await mongoose.connect(process.env.MONGODB_ATLAS,
        { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected')
    });

    const port = process.env.PORT || 4000;

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    });
    
    // allow for posts to graphql
    app.use(
        '/graphql',
        graphqlExpress(req => ({
          schema,
          context: {
            user: req.user
          }
        })),
    );

    app.get('/', (req, res) => {
        res.send('hello');
    });

    app.listen({ port },
        () => console.log(`Server running at http://localhost:${port}${server.graphqlPath}`));
}

startServer()