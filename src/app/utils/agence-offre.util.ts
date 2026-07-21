import {
  AgenceOffre,
  AgenceOffreDetailResponse,
  AgenceOffreRaw,
  AgenceOffreStatut,
  AgenceOffresListPayload,
  AgenceOffresListResponse,
  AgenceOffresPage,
  AgenceOffresPaginationMeta,
} from '../models/agence-offre.model';

export interface AgenceOffreEditForm {
  id: string;
  titre: string;
  typeOffreId: string;
  type: string;
  prix: number | null;
  capaciteIllimitee: boolean;
  capaciteTotale: number | null;
  capaciteDisponible: number | null;
  origine: string;
  destination: string;
  dateDepart: string;
  dateDepotColis: string;
  description: string;
  statut: AgenceOffreStatut;
}

function unwrapOffreRaw(response: AgenceOffreDetailResponse | AgenceOffreRaw): AgenceOffreRaw {
  if ('data' in response && response.data) {
    return flattenOffreRaw(response.data);
  }
  return flattenOffreRaw(response as AgenceOffreRaw);
}

function resolveMeta(payload: AgenceOffresListPayload): AgenceOffresPaginationMeta {
  return payload.meta ?? payload;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function flattenOffreRaw(raw: AgenceOffreRaw): AgenceOffreRaw {
  const record = { ...(raw as Record<string, unknown>) };

  for (const key of ['offre', 'data', 'attributes']) {
    const nested = asRecord(record[key]);
    if (nested) {
      Object.assign(record, nested);
    }
  }

  const capacite = asRecord(record['capacite']);
  if (capacite) {
    Object.assign(record, capacite);
  }

  return record as AgenceOffreRaw;
}

function resolveLabel(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nom = record['nom'] ?? record['name'];
    if (typeof nom === 'string' && nom.trim()) {
      return nom.trim();
    }
  }
  return '';
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : null;
}

function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function toDateInputValue(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? '';
}

function readNumberField(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = toNumber(record[key] as number | string | null | undefined);
    if (value != null) {
      return value;
    }
  }
  return null;
}

function formatCount(value: number | null): string {
  if (value == null) {
    return '—';
  }
  return new Intl.NumberFormat('fr-FR').format(value);
}

function formatPrix(value: number | string | null | undefined): string {
  const numeric = toNumber(value);
  if (numeric == null) {
    return '—';
  }
  return `${new Intl.NumberFormat('fr-FR').format(numeric)} FCFA`;
}

function resolveStockValues(raw: AgenceOffreRaw): { disponible: number | null; total: number | null } {
  const record = flattenOffreRaw(raw) as Record<string, unknown>;

  const disponible = readNumberField(record, [
    'capacite_disponible',
    'capaciteDisponible',
    'capacite_disponible_kg',
  ]);

  const total = readNumberField(record, ['capacite_totale', 'capaciteTotale', 'capacite_totale_kg']);

  return { disponible, total };
}

function resolveStockDisplay(disponible: number | null, total: number | null): string {
  if (disponible != null && total != null) {
    return `${formatCount(disponible)} / ${formatCount(total)}`;
  }
  if (disponible != null) {
    return formatCount(disponible);
  }
  if (total != null) {
    return formatCount(total);
  }
  return '—';
}

function resolveTypeLabelKey(type: string): string {
  const normalized = type.trim().toLowerCase();

  if (normalized === 'particulier' || normalized === 'au_kg' || normalized === 'kilo') {
    return 'backoffice.createOffer.offerTypeKilo';
  }
  if (normalized === 'metre_cube' || normalized === 'metrecube' || normalized === 'metre cube') {
    return 'backoffice.createOffer.offerTypeCubicMeter';
  }
  if (normalized === 'conteneur' || normalized === 'container') {
    return 'backoffice.createOffer.offerTypeContainer';
  }

  return '';
}

function normalizeStatut(value: string | undefined): AgenceOffreStatut {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'inactive' || normalized === 'inactif') {
    return 'inactive';
  }
  if (normalized === 'archivée' || normalized === 'archivee' || normalized === 'archived') {
    return 'archivée';
  }
  return 'active';
}

function resolveTypeOffreId(record: Record<string, unknown>): string {
  const direct = record['type_offre_id'] ?? record['typeOffreId'];
  if (typeof direct === 'string' || typeof direct === 'number') {
    return String(direct).trim();
  }

  const nested = asRecord(record['type_offre']);
  if (nested?.['id'] != null) {
    return String(nested['id']).trim();
  }

  return '';
}

function resolveStatutLabelKey(statut: string): string {
  const normalized = statut.trim().toLowerCase();

  if (normalized === 'active' || normalized === 'actif') {
    return 'backoffice.offerHistory.status.active';
  }
  if (normalized === 'inactive' || normalized === 'inactif') {
    return 'backoffice.offerHistory.status.inactive';
  }
  if (normalized === 'archivée' || normalized === 'archivee' || normalized === 'archived') {
    return 'backoffice.offerHistory.status.archived';
  }

  return '';
}

export function mapOffreToRow(raw: AgenceOffreRaw): AgenceOffre {
  const source = flattenOffreRaw(raw);
  const type = source.type?.trim() ?? '';
  const statut = source.statut?.trim() ?? '';
  const { disponible, total } = resolveStockValues(source);

  return {
    id: String(source.id ?? ''),
    titre: (source.titre ?? source.title)?.trim() || '—',
    agence: resolveLabel(source.agence) || '—',
    type,
    typeLabelKey: resolveTypeLabelKey(type),
    prix: formatPrix(source.prix),
    stockDisponible: formatCount(disponible),
    stockTotal: formatCount(total),
    stock: resolveStockDisplay(disponible, total),
    origine: source.origine?.trim() || '—',
    destination: source.destination?.trim() || '—',
    statut,
    statutLabelKey: resolveStatutLabelKey(statut),
    description: source.description?.trim() ?? '',
  };
}

export function parseOffreDetailResponse(response: AgenceOffreDetailResponse): AgenceOffre {
  return mapOffreToRow(unwrapOffreRaw(response));
}

export function parseOffreEditForm(response: AgenceOffreDetailResponse): AgenceOffreEditForm {
  const source = flattenOffreRaw(unwrapOffreRaw(response));
  const record = source as Record<string, unknown>;
  const type = source.type?.trim() ?? '';

  return {
    id: String(source.id ?? ''),
    titre: (source.titre ?? source.title)?.trim() ?? '',
    typeOffreId: resolveTypeOffreId(record),
    type,
    prix: toNumber(source.prix),
    capaciteIllimitee: toBoolean(record['capacite_illimitee']),
    capaciteTotale: readNumberField(record, ['capacite_totale', 'capaciteTotale', 'capacite_totale_kg']),
    capaciteDisponible: readNumberField(record, [
      'capacite_disponible',
      'capaciteDisponible',
      'capacite_disponible_kg',
      'disponible',
      'stock_disponible',
      'stock_restant',
    ]),
    origine: source.origine?.trim() ?? '',
    destination: source.destination?.trim() ?? '',
    dateDepart: toDateInputValue(record['date_depart'] ?? record['dateDepart']),
    dateDepotColis: toDateInputValue(record['date_depot_colis'] ?? record['dateDepotColis']),
    description: source.description?.trim() ?? '',
    statut: normalizeStatut(source.statut),
  };
}

function extractOffreItems(response: AgenceOffresListResponse): AgenceOffreRaw[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data?.data) {
    return response.data.data;
  }

  return [];
}

export function parseOffresListResponse(response: AgenceOffresListResponse): AgenceOffresPage {
  const items = extractOffreItems(response);
  const payload = Array.isArray(response.data) ? response : response.data;
  const meta = resolveMeta((payload ?? {}) as AgenceOffresListPayload);
  const responseMeta: AgenceOffresPaginationMeta = {
    current_page: response.current_page ?? response.meta?.current_page ?? meta.current_page,
    last_page: response.last_page ?? response.meta?.last_page ?? meta.last_page,
    per_page: response.per_page ?? response.meta?.per_page ?? meta.per_page,
    total: response.total ?? response.meta?.total ?? meta.total,
    from: response.from ?? response.meta?.from ?? meta.from,
    to: response.to ?? response.meta?.to ?? meta.to,
  };
  const mapped = items.map((item) => mapOffreToRow(item));
  const total = responseMeta.total ?? mapped.length;
  const currentPage = responseMeta.current_page ?? 1;
  const lastPage = Math.max(1, responseMeta.last_page ?? 1);
  const from = responseMeta.from ?? (mapped.length > 0 ? (currentPage - 1) * (responseMeta.per_page ?? mapped.length) + 1 : 0);
  const to = responseMeta.to ?? (mapped.length > 0 ? from + mapped.length - 1 : 0);

  return {
    items: mapped,
    currentPage,
    lastPage,
    total,
    from,
    to,
  };
}
