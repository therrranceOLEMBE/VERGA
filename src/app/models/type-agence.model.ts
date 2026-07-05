export interface TypeAgence {
  id: string;
  label: string;
}

export interface TypeAgenceListResponse {
  data?: Array<{ id?: string; nom?: string; name?: string; label?: string }>;
}
