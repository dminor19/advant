import usersResolvers from './userResolvers';
export default {
    Query: {
        sayHi: () => 'Hello!'
    },
    Mutation: {
        ...usersResolvers.Mutation
    }
}