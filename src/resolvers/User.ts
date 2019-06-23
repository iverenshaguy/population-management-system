import Location from '../models/Location';
import { mongooseIDResolver } from './id';

export const User = {
  id: mongooseIDResolver,
  locations({ id }) {
    return Location.find({ author: id }).exec();
  },
}
