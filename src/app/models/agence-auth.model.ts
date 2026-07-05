export interface AgenceLoginRequest {
  email: string;
  password: string;
  device_name: string;
}

export interface AgenceAuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  agence?: Record<string, unknown>;
}

export interface AgenceLoginResponse {
  token: string;
  token_type: string;
  user: AgenceAuthUser;
}

export interface AgenceLogoutResponse {
  message: string;
}
