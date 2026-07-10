import {
  ClientPaiement,
  ClientPaiementRaw,
  ClientPaiementsListPayload,
  ClientPaiementsListResponse,
  ClientPaiementsPage,
  ClientPaiementsPaginationMeta,
} from '../models/client-paiement.model';

function unwrapListPayload(response: ClientPaiementsListResponse): ClientPaiementsListPayload {
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: response.meta ?? {
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
        from: response.from,
        to: response.to,
      },
    };
  }

  if (response.data && typeof response.data === 'object') {
    return response.data as ClientPaiementsListPayload;
  }

  return {
    data: [],
    meta: response.meta,
    current_page: response.current_page,
    last_page: response.last_page,
    per_page: response.per_page,
    total: response.total,
    from: response.from,
    to: response.to,
  };
}

function resolveMeta(payload: ClientPaiementsListPayload): ClientPaiementsPaginationMeta {
  return payload.meta ?? payload;
}

function readString(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }
  return '';
}

function resolveCommande(raw: ClientPaiementRaw): string {
  const direct = readString(raw.commande_code);
  if (direct) {
    return direct;
  }
  if (typeof raw.commande === 'string') {
    return raw.commande.trim();
  }
  if (raw.commande && typeof raw.commande === 'object') {
    return readString(raw.commande.code);
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
    return `${new Intl.NumberFormat('fr-FR').format(numeric)} FCFA`;
  }
  return String(value);
}

export function mapClientPaiementToRow(raw: ClientPaiementRaw): ClientPaiement {
  const code = readString(raw.code);
  const bambooReference = readString(raw.bamboo_reference) || readString(raw.bamboo_ref);
  const quantiteLabel = readString(raw.quantite_label) || readString(raw.quantite);

  return {
    id: String(raw.id ?? code ?? bambooReference ?? ''),
    code: code || '—',
    commande: resolveCommande(raw) || '—',
    bambooReference: bambooReference || '—',
    quantiteLabel: quantiteLabel || '—',
    montant: formatMontant(raw.montant),
    statut: readString(raw.statut),
    date: formatDate(raw.date ?? raw.created_at),
  };
}

export function parseClientPaiementsListResponse(response: ClientPaiementsListResponse): ClientPaiementsPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapClientPaiementToRow);
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
