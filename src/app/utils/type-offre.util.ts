import {
  TypeOffre,
  TypeOffreCreateResponse,
  TypeOffreDetailResponse,
  TypeOffreListResponse,
  TypeOffreRaw,
} from '../models/type-offre.model';

export function slugifyTypeOffre(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function parseTypeOffre(raw: TypeOffreRaw | null | undefined): TypeOffre | null {
  if (!raw) {
    return null;
  }

  const nom = (raw.nom ?? raw.name ?? raw.label ?? '').trim();
  const slug = (raw.slug ?? raw.code ?? raw.type ?? slugifyTypeOffre(nom)).trim();
  const id = raw.id?.trim() ?? '';

  if (!id || !nom) {
    return null;
  }

  return {
    id,
    label: nom,
    code: slug,
    slug,
    nom,
    description: (raw.description ?? '').trim(),
    unite: (raw.unite ?? '').trim(),
    uniteLabel: (raw.unite_label ?? '').trim(),
    quantiteEntier: raw.quantite_entier === true,
    quantiteMin: toNumber(raw.quantite_min, 0),
    actif: raw.actif !== false,
    agenceId: raw.agence_id?.trim() || null,
    isPlatform: raw.is_platform === true,
  };
}

export function parseTypeOffreListResponse(response: TypeOffreListResponse): TypeOffre[] {
  return (response.data ?? [])
    .map((item) => parseTypeOffre(item))
    .filter((item): item is TypeOffre => item != null);
}

export function parseTypeOffreDetailResponse(response: TypeOffreDetailResponse): TypeOffre | null {
  return parseTypeOffre(response.data);
}

export function parseTypeOffreCreateResponse(response: TypeOffreCreateResponse): TypeOffre | null {
  return parseTypeOffre(response.data);
}
