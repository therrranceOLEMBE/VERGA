import {
  AgenceColis,
  AgenceColisDetail,
  AgenceColisDetailRaw,
  AgenceColisDetailResponse,
  AgenceColisHistoriqueItem,
  AgenceColisHistoriqueRaw,
  AgenceColisListPayload,
  AgenceColisListResponse,
  AgenceColisPage,
  AgenceColisPaginationMeta,
  AgenceColisRaw,
  AgenceColisStatut,
  AgenceColisStatutUpdateResponse,
} from '../models/agence-colis.model';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function flattenColisRaw(raw: AgenceColisDetailRaw): AgenceColisDetailRaw {
  const record = { ...(raw as Record<string, unknown>) };

  for (const key of ['colis', 'data', 'attributes']) {
    const nested = asRecord(record[key]);
    if (nested) {
      Object.assign(record, nested);
    }
  }

  return record as AgenceColisDetailRaw;
}

function unwrapColisRaw(response: AgenceColisDetailResponse | AgenceColisDetailRaw): AgenceColisDetailRaw {
  if ('data' in response && response.data) {
    return flattenColisRaw(response.data);
  }
  return flattenColisRaw(response as AgenceColisDetailRaw);
}

function unwrapListPayload(response: AgenceColisListResponse): AgenceColisListPayload {
  const root = response.data ?? response;
  if (Array.isArray(root)) {
    return { data: root };
  }
  return root as AgenceColisListPayload;
}

function resolveMeta(payload: AgenceColisListPayload): AgenceColisPaginationMeta {
  return payload.meta ?? payload;
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
    const code = record['code'];
    if (typeof code === 'string' && code.trim()) {
      return code.trim();
    }
    const name = record['name'];
    if (typeof name === 'string' && name.trim()) {
      return name.trim();
    }
    const nom = record['nom'];
    if (typeof nom === 'string' && nom.trim()) {
      return nom.trim();
    }
  }
  return '';
}

function formatPoids(value: number | string | null | undefined, fallback?: number | string | null): string {
  const raw = value ?? fallback;
  if (raw == null || raw === '') {
    return '—';
  }
  const numeric = typeof raw === 'number' ? raw : Number(String(raw).replace(/\s/g, '').replace(',', '.'));
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    return `${new Intl.NumberFormat('fr-FR').format(numeric)} kg`;
  }
  const text = String(raw).trim();
  return text.toLowerCase().includes('kg') ? text : `${text} kg`;
}

function resolveDescription(raw: AgenceColisRaw): string {
  const value = raw.description ?? raw.contenu ?? raw.libelle;
  if (value == null || String(value).trim() === '') {
    return '—';
  }
  return String(value).trim();
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resolveHistorique(raw: AgenceColisDetailRaw): AgenceColisHistoriqueRaw[] {
  const items = raw.historique ?? raw.history ?? raw.historiques ?? [];
  return Array.isArray(items) ? items : [];
}

function mapHistoriqueItem(raw: AgenceColisHistoriqueRaw, index: number): AgenceColisHistoriqueItem {
  const commentaire = raw.commentaire ?? raw.comment ?? raw.note;
  return {
    id: String(raw.id ?? `${raw.statut ?? 'step'}-${index}`),
    statut: raw.statut?.trim() ?? '',
    date: formatDate(raw.date ?? raw.created_at ?? raw.updated_at),
    commentaire: commentaire?.trim() ? String(commentaire).trim() : '—',
  };
}

export function resolveNextStatutFromCurrent(statut: string | undefined): string {
  const normalized = statut?.trim() ?? '';
  if (normalized === 'déposé') {
    return 'en_transit';
  }
  if (normalized === 'en_transit') {
    return 'arrivé';
  }
  if (normalized === 'arrivé') {
    return 'récupéré';
  }
  return '';
}

function resolveNextStatut(raw: AgenceColisRaw, fallbackStatut?: string): string {
  const explicit = raw.next_statut;
  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim();
  }
  return resolveNextStatutFromCurrent(fallbackStatut ?? raw.statut);
}

function resolveResponseNextStatut(
  response: AgenceColisDetailResponse | AgenceColisStatutUpdateResponse,
  raw: AgenceColisDetailRaw,
): string {
  const rootNext = response.next_statut;
  if (typeof rootNext === 'string' && rootNext.trim()) {
    return rootNext.trim();
  }
  if (rootNext === null) {
    return '';
  }
  return resolveNextStatut(raw, raw.statut);
}

export function mapAgenceColisToRow(raw: AgenceColisRaw): AgenceColis {
  const commande =
    resolveLabel(raw.commande) ||
    (raw.commande_id != null ? String(raw.commande_id) : '');

  return {
    id: String(raw.id ?? raw.reference ?? raw.ref ?? raw.code ?? ''),
    reference: (raw.reference ?? raw.ref ?? raw.code)?.trim() ?? '—',
    commande: commande || '—',
    description: resolveDescription(raw),
    agence: resolveLabel(raw.agence) || '—',
    poids: formatPoids(raw.poids, raw.poids_kg),
    statut: raw.statut?.trim() ?? '',
    nextStatut: resolveNextStatut(raw),
  };
}

export function parseAgenceColisListResponse(response: AgenceColisListResponse): AgenceColisPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapAgenceColisToRow);
  const meta = resolveMeta(payload);
  const total = meta.total ?? items.length;
  const currentPage = meta.current_page ?? 1;
  const lastPage = Math.max(1, meta.last_page ?? 1);
  const from = meta.from ?? (items.length > 0 ? (currentPage - 1) * (meta.per_page ?? items.length) + 1 : 0);
  const to = meta.to ?? (items.length > 0 ? from + items.length - 1 : 0);

  return {
    items,
    currentPage,
    lastPage,
    total,
    from,
    to,
  };
}

export function parseAgenceColisDetailResponse(
  response: AgenceColisDetailResponse | AgenceColisStatutUpdateResponse,
): AgenceColisDetail {
  const raw = unwrapColisRaw(response);
  const base = mapAgenceColisToRow(raw);
  const nextStatut = resolveResponseNextStatut(response, raw);

  return {
    ...base,
    nextStatut,
    historique: resolveHistorique(raw).map(mapHistoriqueItem),
  };
}

export function isAgenceColisStatut(value: string): value is AgenceColisStatut {
  return value === 'déposé' || value === 'en_transit' || value === 'arrivé' || value === 'récupéré';
}
