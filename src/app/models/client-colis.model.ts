export type ClientColisStatut = 'chez_client' | 'déposé' | 'en_transit' | 'arrivé' | 'récupéré';

export interface ClientColisPhotoRaw {
  id?: string | number;
  chemin?: string;
  url?: string;
  ordre?: number;
}

export interface ClientColisCommandeRaw {
  id?: string | number;
  code?: string;
  quantite?: number | string | null;
  quantite_label?: string | null;
}

export interface ClientColisRaw {
  id?: string | number;
  reference?: string;
  ref?: string;
  code?: string;
  description?: string | null;
  contenu?: string | null;
  libelle?: string | null;
  statut?: ClientColisStatut | string;
  poids?: number | string | null;
  poids_kg?: number | string | null;
  poids_label?: string | null;
  quantite_label?: string | null;
  volume?: number | string | null;
  created_at?: string | null;
  commande?: ClientColisCommandeRaw | string | null;
  commande_id?: string | number | null;
  agence?: {
    id?: string | number;
    nom?: string;
    name?: string;
  } | string | null;
  photos?: ClientColisPhotoRaw[] | null;
}

export interface ClientColisHistoriqueRaw {
  id?: string | number;
  statut?: ClientColisStatut | string;
  date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  commentaire?: string | null;
  comment?: string | null;
  note?: string | null;
}

export interface ClientColisDetailRaw extends ClientColisRaw {
  historique?: ClientColisHistoriqueRaw[] | null;
  history?: ClientColisHistoriqueRaw[] | null;
  historiques?: ClientColisHistoriqueRaw[] | null;
}

export interface ClientColisPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientColisListPayload {
  data?: ClientColisRaw[];
  meta?: ClientColisPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientColisListResponse {
  data?: ClientColisListPayload | ClientColisRaw[];
}

export interface ClientColisDetailResponse {
  data?: ClientColisDetailRaw;
}

export interface ClientColisQueryParams {
  search?: string;
  statut?: ClientColisStatut;
  page?: number;
  per_page?: number;
}

export interface ClientColisPhoto {
  id: string;
  url: string;
  ordre: number;
}

export interface ClientColisHistoriqueItem {
  id: string;
  statut: string;
  date: string;
  commentaire: string;
}

export interface ClientColis {
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
  photos: ClientColisPhoto[];
}

export interface ClientColisDetail extends ClientColis {
  historique: ClientColisHistoriqueItem[];
}

export interface ClientColisPage {
  items: ClientColis[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}
