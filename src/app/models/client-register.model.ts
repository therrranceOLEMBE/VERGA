import { ClientAuthTokenResponse } from './client-auth.model';

export interface ClientRegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  password_confirmation: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  type: 'particulier';
  device_name: string;
}

export interface ClientRegisterResponse extends ClientAuthTokenResponse {}
