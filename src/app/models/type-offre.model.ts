export interface TypeOffre {
  id: string;
  /** Affichage (nom) — rétrocompatibilité formulaires offres */
  label: string;
  /** Slug / code — rétrocompatibilité formulaires offres */
  code: string;
  slug: string;
  nom: string;
  description: string;
  unite: string;
  uniteLabel: string;
  quantiteEntier: boolean;
  quantiteMin: number;
  actif: boolean;
  agenceId: string | null;
  isPlatform: boolean;
}

export interface TypeOffreRaw {
  id?: string;
  agence_id?: string | null;
  is_platform?: boolean;
  slug?: string;
  nom?: string;
  name?: string;
  label?: string;
  code?: string;
  type?: string;
  description?: string | null;
  unite?: string;
  unite_label?: string;
  quantite_entier?: boolean;
  quantite_min?: number | string;
  actif?: boolean;
}

export interface TypeOffreListResponse {
  data?: TypeOffreRaw[];
}

export interface TypeOffreDetailResponse {
  data?: TypeOffreRaw;
}

export interface TypeOffreCreateRequest {
  slug: string;
  nom: string;
  description?: string;
  unite: string;
  unite_label: string;
  quantite_entier: boolean;
  quantite_min: number;
  actif: boolean;
}

export interface TypeOffreCreateResponse {
  data?: TypeOffreRaw;
}

export interface TypeOffreUpdateRequest {
  nom?: string;
  description?: string;
  unite?: string;
  unite_label?: string;
  quantite_entier?: boolean;
  quantite_min?: number;
  actif?: boolean;
}

export interface TypeOffreUpdateResponse {
  data?: TypeOffreRaw;
}

export interface TypeOffreDeleteResponse {
  message?: string;
}
