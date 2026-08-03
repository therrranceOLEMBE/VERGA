import { AgenceOffreStatut } from './agence-offre.model';

export type AgenceOffreClientType = 'particulier' | 'entreprise' | 'conteneur' | 'metre_cube' | 'au_kg';

export interface AgenceOffreCreateRequest {
  titre: string;
  type_offre_id: string;
  type: string;
  prix: number;
  capacite_illimitee: boolean;
  capacite_totale: number | null;
  destination_id: string;
  date_depart: string;
  date_depot_colis?: string | null;
  description: string;
  statut: AgenceOffreStatut;
}

export interface AgenceOffreCreateResponse {
  data?: Record<string, unknown>;
  message?: string;
}

/** Mise à jour : conserve origine/destination pour compatibilité historique. */
export interface AgenceOffreUpdateRequest {
  titre: string;
  type_offre_id: string;
  type: string;
  prix: number;
  capacite_illimitee: boolean;
  capacite_totale: number | null;
  origine: string;
  destination: string;
  destination_id?: string;
  date_depart: string;
  date_depot_colis?: string | null;
  description: string;
  statut: AgenceOffreStatut;
}

export interface AgenceOffreUpdateResponse {
  data?: Record<string, unknown>;
  message?: string;
}

export interface AgenceOffreDeleteResponse {
  message?: string;
}
