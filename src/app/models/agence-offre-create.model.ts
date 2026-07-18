import { AgenceOffreStatut } from './agence-offre.model';

export type AgenceOffreClientType = 'particulier' | 'entreprise' | 'conteneur' | 'metre_cube' | 'au_kg';

export interface AgenceOffreCreateRequest {
  titre: string;
  type_offre_id: string;
  type: string;
  prix: number;
  capacite_illimitee: boolean;
  capacite_totale: number | null;
  origine: string;
  destination: string;
  description: string;
  statut: AgenceOffreStatut;
}

export interface AgenceOffreCreateResponse {
  data?: Record<string, unknown>;
  message?: string;
}

export type AgenceOffreUpdateRequest = AgenceOffreCreateRequest;

export interface AgenceOffreUpdateResponse {
  data?: Record<string, unknown>;
  message?: string;
}

export interface AgenceOffreDeleteResponse {
  message?: string;
}
