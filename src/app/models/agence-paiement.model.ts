export type AgencePaiementStatut = 'en_attente' | 'validé' | 'remboursé' | 'échec';

export interface AgencePaiementRaw {
  id?: string | number;
  reference?: string;
  ref?: string;
  code?: string;
  code_verga?: string | null;
  verga_code?: string | null;
  bamboo_ref?: string | null;
  ref_bamboo?: string | null;
  bamboo_billing_id?: string | null;
  billing_id?: string | null;
  statut?: AgencePaiementStatut | string;
  montant?: number | string | null;
  amount?: number | string | null;
  date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  methode?: string | null;
  method?: string | null;
  message?: string | null;
  client?: {
    id?: string | number;
    nom?: string;
    name?: string;
    prenom?: string;
    email?: string;
  } | string | null;
  commande?: {
    id?: string | number;
    code?: string;
  } | string | null;
  commande_id?: string | number | null;
}

export interface AgencePaiementsPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgencePaiementsListPayload {
  data?: AgencePaiementRaw[];
  meta?: AgencePaiementsPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgencePaiementsListResponse {
  data?: AgencePaiementsListPayload | AgencePaiementRaw[];
  meta?: AgencePaiementsPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgencePaiementsQueryParams {
  search?: string;
  statut?: AgencePaiementStatut;
  page?: number;
  per_page?: number;
}

export interface AgencePaiement {
  id: string;
  codeVerga: string;
  refBamboo: string;
  commande: string;
  montant: string;
  methode: string;
  statut: string;
  date: string;
}

export interface AgencePaiementsPage {
  items: AgencePaiement[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}
