import * as mongoose from 'mongoose';

import User from './User';
import Location from './Location';

const DATABASE_URL = process.env.NODE_ENV !== 'test'
  ? process.env.DATABASE_URL
  : process.env.DATABASE_TEST_URL;

const connectDb = () => {
  return mongoose.connect(DATABASE_URL, {
    useCreateIndex: true,
    useNewUrlParser: true
  });
};

const models = { User, Location };

export { connectDb };

export default models;
