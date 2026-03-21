export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}