import usersResolvers from './customerResolvers';
export default {
    Query: {
        ...usersResolvers.Query,
    },
    Mutation: {
        ...usersResolvers.Mutation,
    },
};
