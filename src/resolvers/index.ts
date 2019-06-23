import { Query } from './Query';
import { auth } from './Mutation/auth';
import { location } from './Mutation/location';
import { User } from './User';
import { Location } from './Location';

export default {
  Query,
  Mutation: {
    ...auth,
    ...location,
  },
  User,
  Location,
}
