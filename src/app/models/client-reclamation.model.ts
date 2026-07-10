export type ClientReclamationStatut = 'ouverte' | 'en_cours' | 'résolue' | 'fermée';

export interface ClientReclamationRaw {
  id?: string | number;
  objet?: string;
  description?: string | null;
  statut?: ClientReclamationStatut | string;
  date?: string | null;
  created_at?: string | null;
  client?: {
    id?: string | number;
    nom?: string;
    prenom?: string;
    name?: string;
    email?: string;
  } | string | null;
  agence?: {
    id?: string | number;
    nom?: string;
    name?: string;
  } | string | null;
  commande?: {
    id?: string | number;
    code?: string;
  } | string | null;
  commande_id?: string | number | null;
}

export interface ClientReclamationsPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientReclamationsListPayload {
  data?: ClientReclamationRaw[];
  meta?: ClientReclamationsPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientReclamationsListResponse {
  data?: ClientReclamationsListPayload | ClientReclamationRaw[];
}

export interface ClientReclamationsQueryParams {
  statut?: ClientReclamationStatut;
  page?: number;
  per_page?: number;
}

export interface ClientReclamation {
  id: string;
  client: string;
  objet: string;
  agence: string;
  statut: string;
  date: string;
  commandeCode: string;
}

export interface ClientReclamationsPage {
  items: ClientReclamation[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}

export interface ClientReclamationCreateRequest {
  commande_id: string;
  agence_id: string;
  objet: string;
  description: string;
}

export interface ClientReclamationCreateResponse {
  data?: ClientReclamationRaw;
  message?: string;
}
