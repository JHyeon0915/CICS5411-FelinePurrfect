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
  message: string;
  token: string;         // ID Token for user identification
  accessToken: string;   // Access Token for API operations
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}