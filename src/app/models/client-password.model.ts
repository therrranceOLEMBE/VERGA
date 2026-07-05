export interface ClientPasswordUpdateRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ClientPasswordUpdateResponse {
  message: string;
}
