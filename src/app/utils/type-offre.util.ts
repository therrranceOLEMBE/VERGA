import { TypeOffre, TypeOffreListResponse } from '../models/type-offre.model';

function slugifyTypeOffre(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function parseTypeOffreListResponse(response: TypeOffreListResponse): TypeOffre[] {
  const items = response.data ?? [];
  return items
    .map((item) => {
      const label = (item.nom ?? item.name ?? item.label ?? '').trim();
      const code = (item.code ?? item.slug ?? item.type ?? slugifyTypeOffre(label)).trim();
      return {
        id: item.id?.trim() ?? '',
        label,
        code,
        description: item.description?.trim() ?? '',
      };
    })
    .filter((item) => item.id && item.label);
}
