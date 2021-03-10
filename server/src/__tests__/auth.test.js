import { gql } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import { configureServer } from '../server';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Token } from '../models/Token';

let global = {};
const TEST_USER = {
    email: 'test@test.com',
    password: 'password',
    confirmPassword: 'password',
    firstName: 'Test',
    lastName: 'Test',
};
beforeAll(async (done) => {
    const { app, server } = await configureServer();
    global.app = app.listen(5000);
    const { query, mutate } = createTestClient(server);
    global.query = query;
    global.mutate = mutate;
    done();
});

test('TEST HELLO QUERY', async () => {
    const TEST_HELLO_QUERY = gql`
        query {
            hello
        }
    `;

    const {
        data: { hello },
    } = await global.query({ query: TEST_HELLO_QUERY });

    expect(hello).toEqual('Hello World');
});

test('REGISTER TEST USER', async () => {
    const REGISTER_USER = gql`
        mutation($registerInput: RegisterInput!) {
            register(registerInput: $registerInput) {
                id
                createdAt
                email
                firstName
                lastName
            }
        }
    `;

    const { data, errors } = await global.mutate({
        mutation: REGISTER_USER,
        variables: {
            registerInput: TEST_USER,
        },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.register.email).toEqual(TEST_USER.email);
    expect(data.register.firstName).toEqual(TEST_USER.firstName);
    expect(data.register.lastName).toEqual(TEST_USER.lastName);

    await User.updateOne({ _id: data.register.id }, { isVerified: true });
    await Token.deleteOne({ userId: data.register.id });
});

test('LOGIN TEST USER', async () => {
    const TEST_LOGIN = gql`
        mutation($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                id
                email
                createdAt
                firstName
                lastName
            }
        }
    `;

    const { data, errors } = await global.mutate({
        mutation: TEST_LOGIN,
        variables: {
            email: TEST_USER.email,
            password: TEST_USER.password,
        },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.login.email).toEqual(TEST_USER.email);
    expect(data.login.firstName).toEqual(TEST_USER.firstName);
    expect(data.login.lastName).toEqual(TEST_USER.lastName);
});

afterAll(async (done) => {
    await global.app.close();
    await dropAllCollections();
    await mongoose.connection.close();
    done();
});

const dropAllCollections = async () => {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        try {
            await collection.drop();
        } catch (error) {
            if (error.message === 'ns not found') return;
            if (
                error.message.includes(
                    'a background operation is currently running'
                )
            )
                return;

            console.log(error.message);
        }
    }
};
