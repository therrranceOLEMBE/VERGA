export type ClientColisStatut = 'déposé' | 'en_transit' | 'arrivé' | 'récupéré';

export interface ClientColisRaw {
  id?: string | number;
  reference?: string;
  ref?: string;
  code?: string;
  statut?: ClientColisStatut | string;
  poids?: number | string | null;
  poids_kg?: number | string | null;
  commande?: {
    id?: string | number;
    code?: string;
  } | string | null;
  commande_id?: string | number | null;
  agence?: {
    id?: string | number;
    nom?: string;
    name?: string;
  } | string | null;
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

export interface ClientColisQueryParams {
  search?: string;
  statut?: ClientColisStatut;
  page?: number;
  per_page?: number;
}

export interface ClientColis {
  id: string;
  reference: string;
  commande: string;
  agence: string;
  poids: string;
  statut: string;
}

export interface ClientColisPage {
  items: ClientColis[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}
