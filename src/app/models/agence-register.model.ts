export interface AgenceRegisterRequest {
  nom: string;
  email: string;
  telephone: string;
  type_agence_id?: string;
  ville?: string;
  adresse?: string;
  pays?: string;
  gerant_name: string;
  gerant_email: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
}

export interface AgenceRegisterDocument {
  fichier: File;
  type_document: string;
}

export interface AgenceRegisterUser {
  id: number;
  name: string;
  email: string;
  role: string;
  agence?: Record<string, unknown>;
  telephone?: string;
}

export interface AgenceRegisterResponse {
  token: string;
  token_type: string;
  user: AgenceRegisterUser;
}
