export interface ClientDocumentFields {
  id?: string;
  type_document?: string;
  chemin?: string;
  url?: string;
  nom_original?: string;
}

export interface ClientMeFields {
  id?: number | string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  type?: string;
  statut?: string;
  documents?: ClientDocumentFields[];
  created_at?: string;
}

export interface ClientMeData {
  id?: number | string;
  email?: string;
  name?: string;
  role?: string;
  client?: ClientMeFields;
  user?: ClientMeFields;
  nom?: string;
  prenom?: string;
  telephone?: string;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  type?: string;
}

export interface ClientMeResponse {
  data?: ClientMeData;
  user?: ClientMeFields;
  client?: ClientMeFields;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  type?: string;
}
