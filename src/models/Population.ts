import * as mongoose from 'mongoose';

export const PopulationSchema = new mongoose.Schema({
  female: {
    type: Number,
    min: 0,
    default: 0
  },
  male: {
    type: Number,
    min: 0,
    default: 0
  }
});

export default { PopulationSchema };
