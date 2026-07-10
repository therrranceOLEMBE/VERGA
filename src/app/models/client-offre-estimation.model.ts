export interface ClientOffreEstimationCommission {
  type?: string;
  valeur?: number | string;
  libelle?: string;
  montant?: number | string;
  montant_commission?: number | string;
  montant_commission_client?: number | string;
}

export interface ClientOffreEstimation {
  offre_id?: string;
  quantite?: number | string;
  prix_unitaire?: number | string;
  montant_sous_total?: number | string;
  montant_commission_client?: number | string;
  montant_total?: number | string;
  capacite_disponible?: number | string;
  stock_suffisant?: boolean;
  commission?: ClientOffreEstimationCommission;
}

export interface ClientOffreEstimationResponse {
  data?: ClientOffreEstimation;
}
