export type AgenceReversementStatut = 'en_attente' | 'effectué';

export interface AgenceReversementRaw {
  id?: string | number;
  montant?: number | string | null;
  periode?: string | null;
  statut?: AgenceReversementStatut | string;
  effectue_le?: string | null;
  created_at?: string | null;
}

export interface AgenceReversementsPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceReversementsListPayload {
  data?: AgenceReversementRaw[];
  meta?: AgenceReversementsPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceReversementsListResponse {
  data?: AgenceReversementsListPayload | AgenceReversementRaw[];
  meta?: AgenceReversementsPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceReversementsQueryParams {
  statut?: AgenceReversementStatut;
  periode?: string;
  page?: number;
  per_page?: number;
}

export interface AgenceReversement {
  id: string;
  montant: string;
  periode: string;
  statut: string;
  effectueLe: string;
  createdAt: string;
}

export interface AgenceReversementsPage {
  items: AgenceReversement[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}
