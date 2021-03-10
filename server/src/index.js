import { configureServer } from './server';

const startServer = async () => {
    // setup graphql server and middleware
    const { app, server } = await configureServer();

    // start server
    const port = process.env.PORT || 4000;
    app.listen({ port }, () => {
        console.log(
            `Server running at http://localhost:${port}${server.graphqlPath}`
        );
    });
};

startServer();
