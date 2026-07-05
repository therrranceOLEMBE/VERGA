export interface TypeOffre {
  id: string;
  label: string;
  code: string;
  description?: string;
}

export interface TypeOffreListResponse {
  data?: Array<{
    id?: string;
    nom?: string;
    name?: string;
    label?: string;
    code?: string;
    slug?: string;
    type?: string;
    description?: string;
  }>;
}
