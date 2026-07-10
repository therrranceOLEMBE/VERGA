export type ClientCommandeStatut = 'en_attente' | 'confirmée' | 'annulée' | 'réservée';

export interface ClientCommandeRaw {
  id?: string | number;
  code?: string;
  statut?: ClientCommandeStatut | string;
  quantite?: number | string | null;
  quantite_label?: string | null;
  quantite_payee?: number | string | null;
  quantite_payee_label?: string | null;
  quantite_restante?: number | string | null;
  quantite_restante_label?: string | null;
  montant?: number | string | null;
  montant_sous_total?: number | string | null;
  montant_commission_client?: number | string | null;
  montant_total?: number | string | null;
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
  agence_id?: string | number | null;
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
  meta?: ClientCommandesPaginationMeta;
  links?: unknown;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
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
  agenceId: string;
  quantite: string;
  quantiteRestante: number;
  quantiteRestanteLabel: string;
  quantitePayeeLabel: string;
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

export interface ClientCommandeCreateResponse {
  commande_id?: string;
  code?: string;
  commande_statut?: string;
  quantite_reservee?: number;
  quantite_reservee_label?: string;
  quantite_payee?: number;
  quantite_payee_label?: string;
  quantite_a_payer?: number;
  quantite_a_payer_label?: string;
  quantite_restante?: number;
  quantite_restante_label?: string;
  montant_sous_total?: number;
  montant_commission_client?: number;
  montant_total?: number;
  paiement_code?: string;
  retour_url?: string;
  redirect_url?: string;
  verification_url?: string;
  mode?: string;
}

export interface ClientCommandeSoldePaiementRequest {
  quantite: number;
}
