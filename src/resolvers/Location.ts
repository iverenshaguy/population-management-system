import { Context } from '../types/type';
import { mongooseIDResolver } from './id';
import getCredentials from '../utils/getCredentials';

export const Location = {
  id: mongooseIDResolver,
  author: async ({ author }, _, ctx: Context) => {
    const { user: { role } } = await getCredentials(ctx);

    if (role !== 'admin') {
      author.email = undefined;
    }

    author.password = undefined;

    return author;
  },
  population: async ({ population }) => {
    population.total = population.male + population.female;

    return population;
  },
}
