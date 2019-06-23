import * as seeder from 'mongoose-seed';

import users from './users';

const DATABASE_URL = process.env.NODE_ENV !== 'production'
  ? process.env.DATABASE_TEST_URL
  : process.env.DATABASE_URL;

function seed() {
  // Connect to MongoDB via Mongoose
  seeder.connect(DATABASE_URL, function() {
    seeder.loadModels(['./src/models/User.ts', './src/models/Location.ts']);
    seeder.clearModels(['User', 'Location'], function() {
      seeder.populateModels([users], function() {
        seeder.disconnect();
      });
    });
  });
}

seed();
