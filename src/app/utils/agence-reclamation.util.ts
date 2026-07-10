import {
  AgenceReclamation,
  AgenceReclamationDetail,
  AgenceReclamationDetailResponse,
  AgenceReclamationRaw,
  AgenceReclamationStatut,
  AgenceReclamationStatutUpdateResponse,
  AgenceReclamationTargetStatut,
  AgenceReclamationsListPayload,
  AgenceReclamationsListResponse,
  AgenceReclamationsPage,
  AgenceReclamationsPaginationMeta,
} from '../models/agence-reclamation.model';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function flattenReclamationRaw(raw: AgenceReclamationRaw): AgenceReclamationRaw {
  const record = { ...(raw as Record<string, unknown>) };

  for (const key of ['reclamation', 'data', 'attributes']) {
    const nested = asRecord(record[key]);
    if (nested) {
      Object.assign(record, nested);
    }
  }

  return record as AgenceReclamationRaw;
}

function unwrapReclamationRaw(
  response: AgenceReclamationDetailResponse | AgenceReclamationStatutUpdateResponse | AgenceReclamationRaw,
): AgenceReclamationRaw {
  if ('data' in response && response.data) {
    return flattenReclamationRaw(response.data);
  }
  return flattenReclamationRaw(response as AgenceReclamationRaw);
}

function unwrapListPayload(response: AgenceReclamationsListResponse): AgenceReclamationsListPayload {
  const root = response.data ?? response;
  if (Array.isArray(root)) {
    return { data: root };
  }
  return root as AgenceReclamationsListPayload;
}

function resolveMeta(payload: AgenceReclamationsListPayload): AgenceReclamationsPaginationMeta {
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

function resolveClientName(raw: AgenceReclamationRaw): string {
  const fromClient = resolveLabel(raw.client);
  if (fromClient) {
    return fromClient;
  }
  const fullName = `${raw.prenom?.trim() ?? ''} ${raw.nom?.trim() ?? ''}`.trim();
  return fullName;
}

function resolveClientEmail(raw: AgenceReclamationRaw): string {
  if (typeof raw.email === 'string' && raw.email.trim()) {
    return raw.email.trim();
  }
  if (raw.client && typeof raw.client === 'object') {
    const email = raw.client.email;
    if (typeof email === 'string' && email.trim()) {
      return email.trim();
    }
  }
  return '';
}

function resolveClientPhone(raw: AgenceReclamationRaw): string {
  const phone = raw.telephone ?? raw.phone;
  if (typeof phone === 'string' && phone.trim()) {
    return phone.trim();
  }
  if (raw.client && typeof raw.client === 'object') {
    const clientPhone = raw.client.telephone ?? raw.client.phone;
    if (typeof clientPhone === 'string' && clientPhone.trim()) {
      return clientPhone.trim();
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

export function mapAgenceReclamationToRow(raw: AgenceReclamationRaw): AgenceReclamation {
  const commande =
    resolveLabel(raw.commande) ||
    (raw.commande_id != null ? String(raw.commande_id) : '');

  return {
    id: String(raw.id ?? ''),
    client: resolveClientName(raw) || '—',
    objet: raw.objet?.trim() ?? '—',
    commande: commande || '—',
    statut: raw.statut?.trim() ?? '',
    date: formatDate(raw.date ?? raw.created_at),
  };
}

export function parseAgenceReclamationsListResponse(response: AgenceReclamationsListResponse): AgenceReclamationsPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapAgenceReclamationToRow);
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

export function parseAgenceReclamationDetailResponse(
  response: AgenceReclamationDetailResponse | AgenceReclamationStatutUpdateResponse,
): AgenceReclamationDetail {
  const raw = unwrapReclamationRaw(response);
  const base = mapAgenceReclamationToRow(raw);
  const description = raw.description?.trim();

  return {
    id: base.id,
    client: resolveClientName(raw) || base.client,
    clientEmail: resolveClientEmail(raw) || '—',
    clientPhone: resolveClientPhone(raw) || '—',
    objet: base.objet,
    description: description || '—',
    commande: base.commande,
    statut: base.statut,
    date: base.date,
  };
}

const RECLAMATION_TRANSITIONS: Record<AgenceReclamationStatut, AgenceReclamationTargetStatut[]> = {
  ouverte: ['en_cours', 'fermée'],
  en_cours: ['résolue', 'fermée'],
  résolue: [],
  fermée: [],
};

export function getAllowedReclamationTransitions(statut: string): AgenceReclamationTargetStatut[] {
  if (statut === 'ouverte' || statut === 'en_cours' || statut === 'résolue' || statut === 'fermée') {
    return RECLAMATION_TRANSITIONS[statut];
  }
  return [];
}

export function isAgenceReclamationTargetStatut(value: string): value is AgenceReclamationTargetStatut {
  return value === 'en_cours' || value === 'résolue' || value === 'fermée';
}
