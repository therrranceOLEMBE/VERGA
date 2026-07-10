export type AgenceColisStatut = 'chez_client' | 'déposé' | 'en_transit' | 'arrivé' | 'récupéré';

export interface AgenceColisPhotoRaw {
  id?: string | number;
  chemin?: string;
  url?: string;
  ordre?: number;
}

export interface AgenceColisCommandeRaw {
  id?: string | number;
  code?: string;
  quantite?: number | string | null;
  quantite_label?: string | null;
}

export interface AgenceColisRaw {
  id?: string | number;
  reference?: string;
  ref?: string;
  code?: string;
  statut?: AgenceColisStatut | string;
  poids?: number | string | null;
  poids_kg?: number | string | null;
  poids_label?: string | null;
  quantite_label?: string | null;
  volume?: number | string | null;
  created_at?: string | null;
  commande?: AgenceColisCommandeRaw | string | null;
  commande_id?: string | number | null;
  description?: string | null;
  contenu?: string | null;
  libelle?: string | null;
  agence?: {
    id?: string | number;
    nom?: string;
    name?: string;
  } | string | null;
  photos?: AgenceColisPhotoRaw[] | null;
  next_statut?: AgenceColisStatut | string | null;
}

export interface AgenceColisPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceColisListPayload {
  data?: AgenceColisRaw[];
  meta?: AgenceColisPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceColisListResponse {
  data?: AgenceColisListPayload | AgenceColisRaw[];
  meta?: AgenceColisPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceColisQueryParams {
  search?: string;
  statut?: AgenceColisStatut;
  page?: number;
  per_page?: number;
}

export interface AgenceColisPhoto {
  id: string;
  url: string;
  ordre: number;
}

export interface AgenceColis {
  id: string;
  reference: string;
  commande: string;
  commandeId: string;
  commandeQuantite: string;
  description: string;
  agence: string;
  poids: string;
  volume: string;
  statut: string;
  createdAt: string;
  photos: AgenceColisPhoto[];
  nextStatut: string;
}

export interface AgenceColisPage {
  items: AgenceColis[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}

export interface AgenceColisHistoriqueRaw {
  id?: string | number;
  statut?: AgenceColisStatut | string;
  date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  commentaire?: string | null;
  comment?: string | null;
  note?: string | null;
}

export interface AgenceColisDetailRaw extends AgenceColisRaw {
  historique?: AgenceColisHistoriqueRaw[] | null;
  history?: AgenceColisHistoriqueRaw[] | null;
  historiques?: AgenceColisHistoriqueRaw[] | null;
}

export interface AgenceColisDetailResponse {
  data?: AgenceColisDetailRaw;
  next_statut?: AgenceColisStatut | string | null;
}

export interface AgenceColisStatutUpdateRequest {
  statut?: AgenceColisStatut;
  commentaire?: string;
}

export interface AgenceColisStatutUpdateResponse {
  data?: AgenceColisDetailRaw;
  next_statut?: AgenceColisStatut | string | null;
}

export interface AgenceColisHistoriqueItem {
  id: string;
  statut: string;
  date: string;
  commentaire: string;
}

export interface AgenceColisDetail extends AgenceColis {
  historique: AgenceColisHistoriqueItem[];
}
