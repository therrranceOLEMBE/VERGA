export type ClientCommandeStatut = 'en_attente' | 'confirmée' | 'annulée';

export interface ClientCommandeRaw {
  id?: string | number;
  code?: string;
  statut?: ClientCommandeStatut | string;
  quantite?: number | string | null;
  montant?: number | string | null;
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
}

export interface ClientCommandesPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientCommandesListPayload {
  data?: ClientCommandeRaw[];
  meta?: ClientCommandesPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientCommandesListResponse {
  data?: ClientCommandesListPayload | ClientCommandeRaw[];
}

export interface ClientCommandesQueryParams {
  search?: string;
  statut?: ClientCommandeStatut;
  page?: number;
  per_page?: number;
}

export interface ClientCommande {
  id: string;
  code: string;
  client: string;
  agence: string;
  quantite: string;
  montant: string;
  statut: string;
  date: string;
}

export interface ClientCommandesPage {
  items: ClientCommande[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}
