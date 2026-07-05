export interface AgenceTypeFields {
  id?: string;
  nom?: string;
  name?: string;
  label?: string;
}

export interface AgenceMeFields {
  id?: string | number;
  nom?: string;
  email?: string;
  telephone?: string;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  statut?: string;
  is_active?: boolean;
  created_at?: string;
  gerant_name?: string;
  gerant_email?: string;
  type_agence?: AgenceTypeFields;
  type_agence_nom?: string;
}

export interface AgenceMeUserFields {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  agence?: AgenceMeFields;
}

export interface AgenceMeData {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  user?: AgenceMeUserFields;
  agence?: AgenceMeFields;
}

export interface AgenceMeResponse {
  data?: AgenceMeData;
  user?: AgenceMeUserFields;
  agence?: AgenceMeFields;
  name?: string;
  email?: string;
  role?: string;
}
