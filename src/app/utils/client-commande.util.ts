import {
  ClientCommande,
  ClientCommandeRaw,
  ClientCommandesListPayload,
  ClientCommandesListResponse,
  ClientCommandesPage,
  ClientCommandesPaginationMeta,
} from '../models/client-commande.model';

function unwrapListPayload(response: ClientCommandesListResponse): ClientCommandesListPayload {
  const root = response.data ?? response;
  if (Array.isArray(root)) {
    return { data: root };
  }
  return root as ClientCommandesListPayload;
}

function resolveMeta(payload: ClientCommandesListPayload): ClientCommandesPaginationMeta {
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
    const name = record['name'];
    if (typeof name === 'string' && name.trim()) {
      return name.trim();
    }
    const nom = record['nom'];
    const prenom = record['prenom'];
    if (typeof nom === 'string' || typeof prenom === 'string') {
      return `${typeof prenom === 'string' ? prenom.trim() : ''} ${typeof nom === 'string' ? nom.trim() : ''}`.trim();
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

function formatMontant(value: number | string | null | undefined): string {
  if (value == null || value === '') {
    return '—';
  }
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/\s/g, '').replace(',', '.'));
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    return new Intl.NumberFormat('fr-FR').format(numeric);
  }
  return String(value);
}

function formatQuantite(value: number | string | null | undefined): string {
  if (value == null || value === '') {
    return '—';
  }
  return String(value);
}

export function mapCommandeToRow(raw: ClientCommandeRaw): ClientCommande {
  return {
    id: String(raw.id ?? raw.code ?? ''),
    code: raw.code?.trim() ?? '—',
    client: resolveLabel(raw.client),
    agence: resolveLabel(raw.agence),
    quantite: formatQuantite(raw.quantite),
    montant: formatMontant(raw.montant),
    statut: raw.statut?.trim() ?? '',
    date: formatDate(raw.date ?? raw.created_at),
  };
}

export function parseCommandesListResponse(response: ClientCommandesListResponse): ClientCommandesPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapCommandeToRow);
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
