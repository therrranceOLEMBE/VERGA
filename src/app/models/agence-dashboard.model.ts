export type AgenceDashboardPeriode = 'mois' | 'mois_dernier' | 'trimestre' | 'semestre' | 'annee' | 'tout';

export interface AgenceDashboardProfil {
  nom?: string;
  ville?: string;
  statut?: string;
}

export interface AgenceDashboardStats {
  nb_offres?: number;
  nb_offres_actives?: number;
  capacite_disponible_totale?: number;
  nb_commandes?: number;
  nb_commandes_en_attente?: number;
  nb_commandes_confirmees?: number;
  total_paiements?: number;
  total_commissions?: number;
  revenu_net_estime?: number;
  reversements_en_attente?: number;
  nb_colis?: number;
  nb_colis_en_transit?: number;
  nb_reclamations_ouvertes?: number;
}

export interface AgenceDashboardData {
  periode?: AgenceDashboardPeriode;
  debut?: string;
  fin?: string;
  profil?: AgenceDashboardProfil;
  stats?: AgenceDashboardStats;
  commandes_par_statut?: Record<string, number>;
  colis_par_statut?: Record<string, number>;
  top_offres?: Array<Record<string, unknown>>;
  dernieres_commandes?: Array<Record<string, unknown>>;
}

export interface AgenceDashboardResponse {
  data?: AgenceDashboardData;
}
