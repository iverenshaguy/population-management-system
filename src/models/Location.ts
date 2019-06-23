import * as mongoose from 'mongoose';

import { PopulationSchema } from './Population';

const Schema = mongoose.Schema;

const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true
    },
    population: PopulationSchema,
    author: { type: Schema.Types.ObjectId, ref: 'User', autopopulate: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Location', autopopulate: true },
    children: [{ type: Schema.Types.ObjectId, ref: 'Location', autopopulate: true }]
  },
  {
    timestamps: true,
    paranoid: true
  }
);

LocationSchema.plugin(require('mongoose-autopopulate'));

const Location = mongoose.model('Location', LocationSchema);

export default Location;
