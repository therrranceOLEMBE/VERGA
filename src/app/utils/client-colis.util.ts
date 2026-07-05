import {
  ClientColis,
  ClientColisListPayload,
  ClientColisListResponse,
  ClientColisPage,
  ClientColisPaginationMeta,
  ClientColisRaw,
} from '../models/client-colis.model';

function unwrapListPayload(response: ClientColisListResponse): ClientColisListPayload {
  const root = response.data ?? response;
  if (Array.isArray(root)) {
    return { data: root };
  }
  return root as ClientColisListPayload;
}

function resolveMeta(payload: ClientColisListPayload): ClientColisPaginationMeta {
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

export function mapColisToRow(raw: ClientColisRaw): ClientColis {
  const commande =
    resolveLabel(raw.commande) ||
    (raw.commande_id != null ? String(raw.commande_id) : '');

  return {
    id: String(raw.id ?? raw.reference ?? raw.ref ?? raw.code ?? ''),
    reference: (raw.reference ?? raw.ref ?? raw.code)?.trim() ?? '—',
    commande: commande || '—',
    agence: resolveLabel(raw.agence) || '—',
    poids: formatPoids(raw.poids, raw.poids_kg),
    statut: raw.statut?.trim() ?? '',
  };
}

export function parseColisListResponse(response: ClientColisListResponse): ClientColisPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapColisToRow);
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
