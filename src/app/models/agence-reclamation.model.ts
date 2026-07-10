export type AgenceReclamationStatut = 'ouverte' | 'en_cours' | 'résolue' | 'fermée';

export type AgenceReclamationTargetStatut = 'en_cours' | 'résolue' | 'fermée';

export interface AgenceReclamationRaw {
  id?: string | number;
  objet?: string;
  description?: string | null;
  statut?: AgenceReclamationStatut | string;
  date?: string | null;
  created_at?: string | null;
  client?: {
    id?: string | number;
    nom?: string;
    prenom?: string;
    name?: string;
    email?: string;
    telephone?: string;
    phone?: string;
  } | string | null;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  phone?: string | null;
  commande?: {
    id?: string | number;
    code?: string;
  } | string | null;
  commande_id?: string | number | null;
}

export interface AgenceReclamationsPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceReclamationsListPayload {
  data?: AgenceReclamationRaw[];
  meta?: AgenceReclamationsPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceReclamationsListResponse {
  data?: AgenceReclamationsListPayload | AgenceReclamationRaw[];
  meta?: AgenceReclamationsPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceReclamationsQueryParams {
  search?: string;
  statut?: AgenceReclamationStatut;
  page?: number;
  per_page?: number;
}

export interface AgenceReclamation {
  id: string;
  client: string;
  objet: string;
  commande: string;
  statut: string;
  date: string;
}

export interface AgenceReclamationsPage {
  items: AgenceReclamation[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}

export interface AgenceReclamationDetailResponse {
  data?: AgenceReclamationRaw;
}

export interface AgenceReclamationDetail {
  id: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  objet: string;
  description: string;
  commande: string;
  statut: string;
  date: string;
}

export interface AgenceReclamationStatutUpdateRequest {
  statut: AgenceReclamationTargetStatut;
}

export interface AgenceReclamationStatutUpdateResponse {
  data?: AgenceReclamationRaw;
}

export interface AgenceReclamationCreateRequest {
  commande_id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  objet: string;
  description: string;
}

export interface AgenceReclamationCreateResponse {
  data?: AgenceReclamationRaw;
  message?: string;
}
