import { formatError as formatApolloError, createError } from 'apollo-errors';

export class AuthenticationError extends Error {
  constructor(...params) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }

    this.name = 'AuthenticationError';
  }
}

export function formatError(error) {
  const { originalError } = error;

  if (originalError && originalError.code === 'ERR_GRAPHQL_CONSTRAINT_VALIDATION') {
    const errorObject = new (createError('ValidationError', {
      "message": originalError.message,
      "data": {
        "field": originalError.fieldName
      }
    }))();
    return formatApolloError(errorObject);
  }

  if (originalError) {
    const errorObject = new (createError(originalError.name, {
      "message": error.message
    }))();
    return formatApolloError(errorObject);
  }

  if (error.message.includes('Constraint')) {
    const errorObject = new (createError('ValidationError', {
      "message": error.message
    }))();
    return formatApolloError(errorObject);
  }

  const errorObject = new (createError(error.name, {
    "message": error.message
  }))();

  return formatApolloError(errorObject);
}

export default formatError;
