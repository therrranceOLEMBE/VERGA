export type AgenceCommandeStatut = 'en_attente' | 'réservée' | 'confirmée' | 'annulée';

export interface AgenceCommandeRaw {
  id?: string | number;
  code?: string;
  statut?: AgenceCommandeStatut | string;
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
    telephone?: string;
    phone?: string;
  } | string | null;
  offre?: {
    id?: string | number;
    titre?: string;
    title?: string;
    origine?: string;
    destination?: string;
    prix?: number | string | null;
    statut?: string;
  } | string | null;
  paiement?: {
    id?: string | number;
    montant?: number | string | null;
    statut?: string;
    methode?: string;
    method?: string;
    reference?: string;
    date?: string | null;
    created_at?: string | null;
  } | null;
  colis?: Array<{
    id?: string | number;
    code?: string;
    statut?: string;
    tracking?: string;
  }> | null;
  agence?: {
    id?: string | number;
    nom?: string;
    name?: string;
  } | string | null;
}

export interface AgenceCommandesPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceCommandesListPayload {
  data?: AgenceCommandeRaw[];
  meta?: AgenceCommandesPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceCommandesListResponse {
  data?: AgenceCommandesListPayload | AgenceCommandeRaw[];
  meta?: AgenceCommandesPaginationMeta;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

export interface AgenceCommandesQueryParams {
  search?: string;
  statut?: AgenceCommandeStatut;
  page?: number;
  per_page?: number;
}

export interface AgenceCommande {
  id: string;
  code: string;
  client: string;
  quantite: string;
  montant: string;
  statut: string;
  date: string;
}

export interface AgenceCommandeColisItem {
  id: string;
  code: string;
  statut: string;
}

export interface AgenceCommandeDetail {
  id: string;
  code: string;
  statut: string;
  quantite: string;
  montant: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  offreTitre: string;
  offreOrigine: string;
  offreDestination: string;
  offrePrix: string;
  paiementMontant: string;
  paiementStatut: string;
  paiementMethode: string;
  paiementReference: string;
  paiementDate: string;
  colis: AgenceCommandeColisItem[];
}

export interface AgenceCommandeDetailResponse {
  data?: AgenceCommandeRaw;
}

export interface AgenceCommandesPage {
  items: AgenceCommande[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
}
