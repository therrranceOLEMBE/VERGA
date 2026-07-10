export type ClientPaiementStatut = 'en_attente' | 'validé' | 'remboursé' | 'échec';

export interface ClientPaiementRaw {
  id?: string | number;
  code?: string;
  montant?: number | string | null;
  created_at?: string | null;
  date?: string | null;
  bamboo_reference?: string | null;
  bamboo_ref?: string | null;
  commande_code?: string | null;
  commande?: {
    id?: string | number;
    code?: string;
  } | string | null;
  statut?: ClientPaiementStatut | string | null;
  quantite_label?: string | null;
  quantite?: number | string | null;
}

export interface ClientPaiementsPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientPaiementsListPayload {
  data?: ClientPaiementRaw[];
  meta?: ClientPaiementsPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientPaiementsListResponse {
  data?: ClientPaiementsListPayload | ClientPaiementRaw[];
  meta?: ClientPaiementsPaginationMeta;
  links?: unknown;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface ClientPaiementsQueryParams {
  search?: string;
  statut?: ClientPaiementStatut;
  page?: number;
  per_page?: number;
}

export interface ClientPaiement {
  id: string;
  code: string;
  commande: string;
  bambooReference: string;
  quantiteLabel: string;
  montant: string;
  statut: string;
  date: string;
}

export interface ClientPaiementsPage {
  items: ClientPaiement[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}
