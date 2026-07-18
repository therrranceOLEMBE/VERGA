import { AgenceDocumentFields, AgenceLogoFields, AgenceTypeFields } from './agence-me.model';

export type AgenceUserStatut = 'actif' | 'inactif' | string;

export interface AgenceRole {
  id: string;
  slug: string;
  nom: string;
  description?: string | null;
  actif: boolean;
  est_systeme: boolean;
}

export interface AgenceRolesResponse {
  data: AgenceRole[];
}

export interface AgenceUserCreateRequest {
  name: string;
  email: string;
  telephone: string;
  password: string;
  password_confirmation: string;
  agence_role_id: string;
}

export interface AgenceUserUpdateRequest {
  name?: string;
  email?: string;
  telephone?: string;
  agence_role_id?: string;
  statut?: AgenceUserStatut;
}

export interface AgenceUserDeleteResponse {
  message?: string;
}

export interface AgenceUserAgency {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  statut: string;
  type?: AgenceTypeFields | null;
  logo?: AgenceLogoFields | null;
  documents?: AgenceDocumentFields[];
  created_at?: string;
}

export interface AgenceUser {
  id: number | string;
  name: string;
  email: string;
  telephone: string;
  statut: AgenceUserStatut;
  est_proprietaire: boolean;
  role: AgenceRole;
  agence: AgenceUserAgency;
}

export interface AgenceUsersListResponse {
  data: AgenceUser[];
}

export type AgenceUserCreateResponse = AgenceUser;
export type AgenceUserUpdateResponse = AgenceUser;
