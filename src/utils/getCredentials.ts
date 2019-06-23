import * as jwt from 'jsonwebtoken';

import User from '../models/User';
import { Context } from '../types/type';

export function getCredentials(ctx: Context) {
  const Authorization = ctx.request.get('Authorization');

  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');

    return jwt.verify(token, process.env.APP_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return { user: { userId: undefined, email: undefined, role: undefined }, error: 'User authorization token is expired' };
        }

        return { user: { userId: undefined, email: undefined, role: undefined }, error: 'Failed to authenticate token' };
      }

      const { email, role } = decoded;
      const foundUser = await User.findOne({ email }).exec();

      if (!foundUser) {
        return { user: { userId: undefined, email: undefined, role: undefined }, error: 'Not authorized' };
      }

      return { user: { userId: foundUser.id, email, role }, error: null };
    });
  }

  return { user: { userId: undefined, email: undefined, role: undefined }, error: 'Not authorized' };
}

export default getCredentials;
