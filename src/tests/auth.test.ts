import startServer from '../server';
import request from './helpers/setup';
import * as mongoose from 'mongoose';
import User from '../models/User';
import { userToken, expiredToken, fakeToken, unexistingUserToken } from './helpers/fixtures';
jest.setTimeout(500000)

describe('Auth', () => {
  let server;
  let db;

  beforeAll( async() => {
    server = await startServer();
  });

  afterAll(() => {
    mongoose.disconnect();
    server.close();
  });

  describe('Signin', () => {
    it('signs in a existing user', async() => {
      const loginMutation = `
        mutation {
          login(input: { email: "${process.env.ADMIN_EMAIL}", password: "${process.env.ADMIN_PASSWORD}" }) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `;

      const data = await request(loginMutation);
      const response = data['login'];
      const user = await User.findOne({ email: response.user.email });

      expect(response).toEqual(expect.objectContaining({
        token: expect.any(String),
        user: expect.any(Object),
      }));
      expect(response.user).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      }));
      expect(response.user.name).toEqual('Admin');
      expect(response.user.email).toEqual(process.env.ADMIN_EMAIL);
      expect(response.user.password).toEqual(undefined);
      expect(user.role).toEqual('admin');
    });

    it('does not sign in a user with wrong password', async() => {
      const loginMutation = `
        mutation {
          login(input: { email: "${process.env.ADMIN_EMAIL}", password: "a password" }) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `;

      try {
        await request(loginMutation);
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Invalid credentials');
        expect(error.name).toEqual('AuthenticationError');
      }
    });

    it('does not sign in an unexisting user', async() => {
      const loginMutation = `
        mutation {
          login(input: { email: "admin@test.com", password: "a password" }) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `;

      try {
        await request(loginMutation);
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Invalid credentials');
        expect(error.name).toEqual('AuthenticationError');
      }
    });

    it('does not sign in a user with invalid data', async() => {
      const loginMutation = `
        mutation {
          login(input: { email: "admin@test" }) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `;

      try {
        await request(loginMutation);
      } catch(err) {
        const emailError = err.response.errors[1];
        const passwordError = err.response.errors[0];

        expect(emailError).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(passwordError).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(emailError.message).toEqual('Must be in email format');
        expect(passwordError.message).toEqual('Field LoginInput.password of required type ConstraintString! was not provided.');
        expect(emailError.name).toEqual('ValidationError');
        expect(passwordError.name).toEqual('ValidationError');
        expect(emailError.data.field).toEqual('email');
      }
    });
  });

  describe('Signup', () => {
    it('signs up a new user', async() => {
      const signupMutation = `
        mutation {
          signup(input: { name: "test", email: "user@test.com", password: "password" }) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `;

      const data = await request(signupMutation);
      const response = data['signup'];
      const newUser = await User.findOne({ email: response.user.email });

      expect(response).toEqual(expect.objectContaining({
        token: expect.any(String),
        user: expect.any(Object),
      }));
      expect(response.user).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      }));
      expect(response.user.name).toEqual('test');
      expect(response.user.email).toEqual('user@test.com');
      expect(response.user.password).toEqual(undefined);
      expect(newUser.role).toEqual('user');
    });

    it('does not sign up a user with an existing email', async() => {
      const signupMutation = `
        mutation {
          signup(input: { name: "test", email: "user@test.com", password: "password" }) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `;

      try {
        await request(signupMutation);
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('User already exists');
        expect(error.name).toEqual('Error');
      }
    });

    it('does not sign up a user with invalid data', async() => {
      const signupMutation = `
        mutation {
          signup(input: { name: "%^&*&(", email: "user@test" }) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `;

      try {
        await request(signupMutation);
      } catch(err) {
        const emailError = err.response.errors[2];
        const nameError = err.response.errors[1];
        const passwordError = err.response.errors[0];

        expect(emailError).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(nameError).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(passwordError).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(emailError.message).toEqual('Must be in email format');
        expect(nameError.message).toEqual('Must match ^[a-zA-Z ]*$');
        expect(passwordError.message).toEqual('Field SignupInput.password of required type ConstraintString! was not provided.');
        expect(emailError.name).toEqual('ValidationError');
        expect(nameError.name).toEqual('ValidationError');
        expect(passwordError.name).toEqual('ValidationError');
        expect(nameError.data.field).toEqual('name');
        expect(emailError.data.field).toEqual('email');
      }
    });
  });

  describe('Me', () => {
    it('returns the signed in user\'s details', async () => {
      const query = `
        query {
          me {
            id
            name
            email
            locations {
              name
            }
          }
        }
      `;

      const data = await request(query, userToken);
      const response = data['me'];

      expect(response.name).toEqual('test');
      expect(response.email).toEqual('user@test.com');
      expect(response.locations).toEqual([]);
    });

    it('does not return user\'s details for an expired token', async () => {
      const query = `
        query {
          me {
            id
            name
            email
            locations {
              name
            }
          }
        }
      `;

      try {
        await request(query, expiredToken);
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('User authorization token is expired');
        expect(error.name).toEqual('AuthenticationError');
      }
    });

    it('does not return user\'s details for a fake token', async () => {
      const query = `
        query {
          me {
            id
            name
            email
            locations {
              name
            }
          }
        }
      `;

      try {
        await request(query, fakeToken);
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Failed to authenticate token');
        expect(error.name).toEqual('AuthenticationError');
      }
    });

    it('does not return user\'s details for an unexisting user token', async () => {
      const query = `
        query {
          me {
            id
            name
            email
            locations {
              name
            }
          }
        }
      `;

      try {
        await request(query, unexistingUserToken);
      } catch(err) {
        const error = err.response.errors[0];

        expect(error).toEqual(expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
          time_thrown: expect.any(String),
        }));
        expect(error.message).toEqual('Not authorized');
        expect(error.name).toEqual('AuthenticationError');
      }
    });
  })
})
