import * as bcrypt from 'bcryptjs';

const users = {
  model: 'User',
  documents: [
    {
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
        role: 'admin'
    }
  ]
};

export default users;
