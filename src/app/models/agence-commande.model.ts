export type AgenceCommandeStatut = 'en_attente' | 'réservée' | 'confirmée' | 'annulée';

export interface AgenceCommandeTypeOffreRaw {
  id?: string;
  agence_id?: string | null;
  is_platform?: boolean;
  slug?: string;
  nom?: string;
  description?: string;
  unite?: string;
  unite_label?: string;
  quantite_entier?: boolean;
  quantite_min?: number;
  actif?: boolean;
}

export interface AgenceCommandeRaw {
  id?: string | number;
  code?: string;
  statut?: AgenceCommandeStatut | string;
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
    id?: string | number | null;
    nom?: string;
    prenom?: string;
    name?: string;
    email?: string | null;
    telephone?: string;
    phone?: string;
  } | string | null;
  offre?: {
    id?: string | number;
    titre?: string;
    title?: string;
    description?: string | null;
    type?: string;
    type_offre_id?: string;
    type_offre?: AgenceCommandeTypeOffreRaw | null;
    prix?: number | string | null;
    capacite_totale?: number | string | null;
    capacite_disponible?: number | string | null;
    origine?: string;
    destination?: string;
    statut?: string;
    created_at?: string | null;
    updated_at?: string | null;
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
    reference?: string;
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
  quantitePayee: string;
  quantiteRestante: string;
  montantSousTotal: string;
  date: string;
  clientName: string;
  clientNom: string;
  clientPrenom: string;
  clientEmail: string;
  clientPhone: string;
  offreTitre: string;
  offreDescription: string;
  offreType: string;
  offreTypeNom: string;
  offreTypeUnite: string;
  offreOrigine: string;
  offreDestination: string;
  offrePrix: string;
  offreCapaciteTotale: string;
  offreCapaciteDisponible: string;
  offreStatut: string;
  offreCreatedAt: string;
  offreUpdatedAt: string;
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
