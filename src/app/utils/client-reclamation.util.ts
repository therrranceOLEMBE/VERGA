import {
  ClientReclamation,
  ClientReclamationRaw,
  ClientReclamationsListPayload,
  ClientReclamationsListResponse,
  ClientReclamationsPage,
  ClientReclamationsPaginationMeta,
} from '../models/client-reclamation.model';

function unwrapListPayload(response: ClientReclamationsListResponse): ClientReclamationsListPayload {
  const root = response.data ?? response;
  if (Array.isArray(root)) {
    return { data: root };
  }
  return root as ClientReclamationsListPayload;
}

function resolveMeta(payload: ClientReclamationsListPayload): ClientReclamationsPaginationMeta {
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
    const prenom = record['prenom'];
    if (typeof nom === 'string' || typeof prenom === 'string') {
      return `${typeof prenom === 'string' ? prenom.trim() : ''} ${typeof nom === 'string' ? nom.trim() : ''}`.trim();
    }
    const email = record['email'];
    if (typeof email === 'string' && email.trim()) {
      return email.trim();
    }
  }
  return '';
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('fr-FR');
}

export function mapReclamationToRow(raw: ClientReclamationRaw): ClientReclamation {
  const commandeCode =
    resolveLabel(raw.commande) ||
    (raw.commande_id != null ? String(raw.commande_id) : '');

  return {
    id: String(raw.id ?? ''),
    client: resolveLabel(raw.client) || '—',
    objet: raw.objet?.trim() ?? '—',
    agence: resolveLabel(raw.agence) || '—',
    statut: raw.statut?.trim() ?? '',
    date: formatDate(raw.date ?? raw.created_at),
    commandeCode,
  };
}

export function parseReclamationsListResponse(response: ClientReclamationsListResponse): ClientReclamationsPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapReclamationToRow);
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
