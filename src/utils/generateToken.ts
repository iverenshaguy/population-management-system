import * as jwt from 'jsonwebtoken';

export async function generateToken(user) {
  const token = await jwt.sign(
    user,
    process.env.APP_SECRET,
    {
      expiresIn: '48h',
    }
  );

  return token;
}

export default generateToken;
