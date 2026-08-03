import { Offer } from './offer.model';

export type ClientOffreLegacyType = 'particulier' | 'metre_cube' | 'conteneur';

export interface ClientOffreTypeOffreRaw {
  id?: string;
  agence_id?: string | null;
  is_platform?: boolean;
  slug?: string;
  nom?: string;
  description?: string | null;
  unite?: string;
  unite_label?: string;
  quantite_entier?: boolean;
  quantite_min?: number;
  actif?: boolean;
}

export interface ClientOffreDestinationRaw {
  id?: string;
  depart?: string;
  arrivee?: string;
  montant?: number | string | null;
  commission_pourcentage?: number | string | null;
  appliquer_configuration?: boolean;
  actif?: boolean;
  rattachee?: boolean;
}

export interface ClientOffreAgenceLogoRaw {
  id?: string;
  chemin?: string;
  url?: string;
  nom_original?: string;
}

export interface ClientOffreAgenceRaw {
  id?: string;
  nom?: string;
  ville?: string;
  logo?: ClientOffreAgenceLogoRaw | null;
}

export interface ClientOffreRaw {
  id?: string;
  titre?: string;
  description?: string | null;
  type?: ClientOffreLegacyType | string;
  type_offre_id?: string;
  type_offre?: ClientOffreTypeOffreRaw | null;
  prix?: number | string | null;
  capacite_illimitee?: boolean;
  capacite_totale?: number | string | null;
  capacite_disponible?: number | string | null;
  destination_id?: string | null;
  destination?: string | ClientOffreDestinationRaw | null;
  origine?: string | null;
  date_depart?: string | null;
  date_depot_colis?: string | null;
  statut?: string;
  created_at?: string | null;
  agence?: ClientOffreAgenceRaw | null;
}

export interface ClientOffresPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientOffresListResponse {
  data?: ClientOffreRaw[];
  meta?: ClientOffresPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientOffreDetailResponse {
  data?: ClientOffreRaw;
}

export interface ClientOffresQueryParams {
  search?: string;
  destination?: string;
  type?: ClientOffreLegacyType;
  type_offre_id?: string;
  date_debut?: string;
  date_fin?: string;
  page?: number;
  per_page?: number;
}

export interface ClientOffresPage {
  items: Offer[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}
