import * as bcrypt from 'bcryptjs';

import User from '../../models/User';
import { SignupInput, LoginInput } from '../../types/auth';
import generateToken from '../../utils/generateToken';
import { AuthenticationError } from './../../utils/formatError';

export const auth = {
  async signup(_, { input }: { input: SignupInput }) {
    const password = await bcrypt.hash(input.password, 10);
    const exists = await User.exists({ email: input.email });

    if(exists) {
      throw new Error('User already exists')
    }

    const user = await User.create({ ...input, password });

    return {
      token: generateToken({ userId: user.id, email: user.email, role: 'user' }),
      user,
    }
  },

  async login(_, { input: { email, password } }: { input: LoginInput }) {
    const user = await User.findOne({ email }).exec();

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new AuthenticationError('Invalid credentials');
    }

    return {
      token: generateToken({ userId: user.id, email: user.email, role: 'user' }),
      user,
    }
  },
}
