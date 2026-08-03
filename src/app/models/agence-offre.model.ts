export type AgenceOffreStatut = 'active' | 'inactive' | 'archivée';

export interface AgenceOffreRaw {
  id?: string | number;
  code?: string;
  titre?: string;
  title?: string;
  type?: string;
  type_offre_id?: string;
  type_offre?: {
    id?: string | number;
    nom?: string;
    name?: string;
    code?: string;
  } | null;
  prix?: number | string | null;
  origine?: string | Record<string, unknown> | null;
  destination?: string | Record<string, unknown> | null;
  destination_id?: string | null;
  statut?: string;
  description?: string | null;
  stock?: number | string | Record<string, unknown> | null;
  disponible?: number | string | null;
  stock_disponible?: number | string | null;
  stock_total?: number | string | null;
  stock_vendu?: number | string | null;
  stock_restant?: number | string | null;
  quantite?: number | string | null;
  quantite_disponible?: number | string | null;
  quantite_totale?: number | string | null;
  quantite_vendue?: number | string | null;
  capacite_disponible?: number | string | null;
  capacite_totale?: number | string | null;
  capacite_illimitee?: boolean;
  capacite?: {
    capacite_disponible?: number | string | null;
    capacite_totale?: number | string | null;
    disponible?: number | string | null;
    totale?: number | string | null;
  } | null;
  agence?: {
    id?: string | number;
    nom?: string;
    name?: string;
  } | string | null;
}

export interface AgenceOffresPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceOffresListPayload {
  data?: AgenceOffreRaw[];
  meta?: AgenceOffresPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceOffresListResponse {
  data?: AgenceOffresListPayload | AgenceOffreRaw[];
  meta?: AgenceOffresPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceOffreDetailResponse {
  data?: AgenceOffreRaw;
}

export interface AgenceOffresQueryParams {
  search?: string;
  statut?: AgenceOffreStatut;
  page?: number;
  per_page?: number;
}

export interface AgenceOffre {
  id: string;
  titre: string;
  agence: string;
  type: string;
  typeLabelKey: string;
  prix: string;
  stockDisponible: string;
  stockTotal: string;
  stock: string;
  origine: string;
  destination: string;
  statut: string;
  statutLabelKey: string;
  description: string;
}

export interface AgenceOffresPage {
  items: AgenceOffre[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}
