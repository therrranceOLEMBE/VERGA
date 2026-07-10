export type ClientDashboardPeriode = 'mois' | 'mois_dernier' | 'trimestre' | 'semestre' | 'annee' | 'tout';

export interface ClientDashboardProfil {
  type?: string;
  nom?: string;
  prenom?: string;
}

export interface ClientDashboardStats {
  nb_commandes?: number;
  nb_commandes_en_attente?: number;
  nb_commandes_confirmees?: number;
  nb_colis?: number;
  nb_colis_en_transit?: number;
  nb_colis_arrives?: number;
  total_depense?: number;
  nb_reclamations?: number;
  nb_reclamations_ouvertes?: number;
}

export interface ClientDashboardData {
  periode?: ClientDashboardPeriode;
  debut?: string;
  fin?: string;
  profil?: ClientDashboardProfil;
  stats?: ClientDashboardStats;
  commandes_par_statut?: Record<string, number>;
  colis_par_statut?: Record<string, number>;
  dernieres_commandes?: Array<Record<string, unknown>>;
}

export interface ClientDashboardResponse {
  data?: ClientDashboardData;
}
