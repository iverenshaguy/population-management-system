import * as jwt from 'jsonwebtoken';

export const message = {
  sender: '2348055555123',
  receiver: '2348055555124',
  message: `Contrary to popular belief, Lorem Ipsum is not simply random text.
  It has roots in a piece of classical Latin literature from 45 BC, making it
  over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
  College in Virginia, looked up one of the more obscure Latin words, consectetur,
  from a Lorem Ipsum passage, and going through the cites of the word in classical
  literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32
  and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
  written in 45 BC. This book is a treatise on the theory of ethics, very popular during the
  Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line
  in section 1.10.32.`,
};

export const badMessage = {
  receiver: '%8HKNGJ',
  message: `Contrary to popular belief, Lorem Ipsum is not simply random text.
  It has roots in a piece of classical Latin literature from 45 BC, making it
  over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
  College in Virginia, looked up one of the more obscure Latin words, consectetur,
  from a Lorem Ipsum passage, and going through the cites of the word in classical
  literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32
  and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
  written in 45 BC. This book is a treatise on the theory of ethics, very popular during the
  Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line
  in section 1.10.32. There are many variations of passages of Lorem Ipsum available, but the
  majority have suffered alteration in some form, by injected humour, or randomised words which
  don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need
  to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum
  generators on the Internet tend to repeat predefined chunks as necessary, making this the
  first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined
  with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable.
  The generated Lorem Ipsum is therefore always free from repetition, injected humour, or
  non-characteristic words etc.`,
};

const adminPayload = {
  name: 'Admin',
  email: process.env.ADMIN_EMAIL,
  role: 'admin'
};

const userPayload = {
  name: 'test',
  email: 'user@test.com',
  role: 'user'
};

export const userToken = jwt.sign(userPayload, process.env.APP_SECRET, { expiresIn: '24h' });
export const adminToken = jwt.sign(adminPayload, process.env.APP_SECRET, { expiresIn: '24h' });
export const expiredToken = jwt.sign(userPayload, process.env.APP_SECRET, { expiresIn: '1' });
export const unexistingUserToken = jwt.sign(
  { ...userPayload, email: 'test2@test.com' },
  process.env.APP_SECRET,
  { expiresIn: '24h' }
);
export const fakeToken = 'uh2ygy34758357t.njidvfhvbrubbjb';

export const newLocation = {
  name: "lagos",
  female: 46578,
  male: 234567,
}

export const newLocation2 = {
  name: "sanjose",
  female: 578,
  male: 23,
}

export const newLocationWithParent = {
  name: "mojave",
  female: 1234,
  male: 2567,
}

export const badLocation = {
  name: "m",
  female: -12,
}

export default {
  userToken,
  adminToken,
  expiredToken,
  fakeToken,
  unexistingUserToken,
  newLocation,
  newLocationWithParent,
  badLocation,
  newLocation2
};
