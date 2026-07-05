export interface AgencePasswordUpdateRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AgencePasswordUpdateResponse {
  message: string;
}
