import { request, GraphQLClient } from 'graphql-request';

export default async (query, token = null, variables = null) => {
  let response;
  const endpoint = `http://127.0.0.1:${process.env.PORT}/graphql`;

  if (token) {
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    response = await graphQLClient.request(query, variables);
  } else {
    response = await request(endpoint, query, variables);
  }

  return response;
}


