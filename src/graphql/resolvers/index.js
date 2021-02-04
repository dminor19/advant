import usersResolvers from './userResolvers';
module.exports = {
    Query: {
        sayHi: () => 'Hello!'
    },
    Mutation: {
        ...usersResolvers.Mutation
    }
}