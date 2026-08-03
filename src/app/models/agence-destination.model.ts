export interface AgenceDestinationRaw {
  id?: string;
  depart?: string;
  arrivee?: string;
  montant?: number | string | null;
  commission_pourcentage?: number | string | null;
  appliquer_configuration?: boolean;
  actif?: boolean;
  rattachee?: boolean;
}

export interface AgenceDestination {
  id: string;
  depart: string;
  arrivee: string;
  montant: number;
  commissionPourcentage: number | null;
  appliquerConfiguration: boolean;
  actif: boolean;
  rattachee: boolean;
  label: string;
}

export interface AgenceDestinationsListResponse {
  data?: AgenceDestinationRaw[];
}

export interface AgenceDestinationCreateRequest {
  depart: string;
  arrivee: string;
  montant: number;
}

export interface AgenceDestinationCreateResponse {
  data?: AgenceDestinationRaw;
  id?: string;
  message?: string;
}
