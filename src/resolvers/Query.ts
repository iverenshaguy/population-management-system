import Location from '../models/Location';
import User from '../models/User';
import { Context } from '../types/type';
import getCredentials from '../utils/getCredentials';
import { AuthenticationError } from '../utils/formatError';

export const Query = {
  locations() {
    return Location.find({}).exec();
  },

  location(_, { id }) {
    return Location.findById(id).exec();
  },

  async me(_, __, ctx: Context) {
    const { user: { email }, error } = await getCredentials(ctx);

    if (error) {
      throw new AuthenticationError(error);
    }

    return User.findOne({ email }).exec();
  },
}
