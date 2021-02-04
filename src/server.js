import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

dotenv.config()

const startServer = async () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    })

    await mongoose.connect(process.env.MONGODB_ATLAS,
        { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected')
    })

    server.listen({ port: process.env.PORT || 5000 })
        .then(res => {
            console.log(`Server running at ${res.url}`)
        })
}

startServer()