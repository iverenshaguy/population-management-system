import { GraphQLNonNull, GraphQLString } from 'graphql';
import { Types } from 'mongoose';

export const mongooseIDResolver = {
  type: GraphQLNonNull(GraphQLString),
  description: 'mongoose _id',
  resolve: ({ _id }: { _id: Types.ObjectId}) => _id.toString(),
};
