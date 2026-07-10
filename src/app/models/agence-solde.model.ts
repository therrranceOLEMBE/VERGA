export interface AgenceSoldeRaw {
  montant_paiements_valides?: number | string | null;
  montant_reversements?: number | string | null;
  montant_solde?: number | string | null;
  montant_reversements_en_attente?: number | string | null;
  montant_disponible?: number | string | null;
}

export interface AgenceSoldeResponse {
  data?: AgenceSoldeRaw;
}

export interface AgenceSolde {
  paiementsValides: number;
  reversements: number;
  solde: number;
  reversementsEnAttente: number;
  disponible: number;
}

export interface AgenceSoldeView {
  paiementsValides: string;
  reversements: string;
  solde: string;
  reversementsEnAttente: string;
  disponible: string;
}
