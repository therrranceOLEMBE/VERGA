export interface ClientAuthTokenResponse {
  token: string;
  token_type: string;
}

export interface ClientLoginRequest {
  email: string;
  password: string;
  device_name: string;
}

export interface ClientLoginResponse extends ClientAuthTokenResponse {}

export interface ClientLogoutResponse {
  message: string;
}
