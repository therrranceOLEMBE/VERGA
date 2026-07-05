import { ClientMeResponse } from './client-me.model';

export interface ClientProfileUpdateRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  type: 'particulier';
}

export type ClientProfileUpdateResponse = ClientMeResponse;
