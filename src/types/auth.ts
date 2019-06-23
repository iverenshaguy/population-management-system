export type SignupInput = {
  name: string,
  email: string,
  password: string
}

export type LoginInput = {
  name: string,
  email: string,
  password: string
}

export type Credentials = {
  userId: string,
  role: 'admin' | 'user'
}
