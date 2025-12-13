export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  user: AuthUser;
}