import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      lowercase: true
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin']
    },
    password: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', UserSchema);

export default User;
