import { GraphQLServer } from 'graphql-yoga';
import * as ConstraintDirective from 'graphql-constraint-directive';

import resolvers from './resolvers';
import { connectDb } from './models';
import formatError from './utils/formatError';


const startServer = async () => {
  const server = new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers,
    context: request => ({
      ...request,
    }),
    schemaDirectives: { constraint: ConstraintDirective }
  });

  const options = {
    formatError,
    endpoint: '/graphql',
    port: process.env.PORT || 4000,
    playground: '/playground',
  };

  await connectDb();

  const app = await server.start(options, ({ port }) => console.log(`Server is running on http://localhost:${port}`))

  return app;
};

export default startServer;
