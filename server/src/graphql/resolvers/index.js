import usersResolvers from './userResolvers';
export default {
    Query: {
        hello: (_, __, { req }) => {
            if (!req.userId) {
                return 'Cannot say hi to unauthenticated user';
            }

            return 'Saying hi to an authenticated user';
        },
    },
    Mutation: {
        ...usersResolvers.Mutation,
    },
};
