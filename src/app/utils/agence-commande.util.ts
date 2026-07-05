import {
  AgenceCommande,
  AgenceCommandeColisItem,
  AgenceCommandeDetail,
  AgenceCommandeDetailResponse,
  AgenceCommandeRaw,
  AgenceCommandesListPayload,
  AgenceCommandesListResponse,
  AgenceCommandesPage,
  AgenceCommandesPaginationMeta,
} from '../models/agence-commande.model';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function flattenCommandeRaw(raw: AgenceCommandeRaw): AgenceCommandeRaw {
  const record = { ...(raw as Record<string, unknown>) };

  for (const key of ['commande', 'data', 'attributes']) {
    const nested = asRecord(record[key]);
    if (nested) {
      Object.assign(record, nested);
    }
  }

  return record as AgenceCommandeRaw;
}

function unwrapCommandeRaw(response: AgenceCommandeDetailResponse | AgenceCommandeRaw): AgenceCommandeRaw {
  if ('data' in response && response.data) {
    return flattenCommandeRaw(response.data);
  }
  return flattenCommandeRaw(response as AgenceCommandeRaw);
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return '';
}

function unwrapListPayload(response: AgenceCommandesListResponse): AgenceCommandesListPayload {
  const root = response.data ?? response;
  if (Array.isArray(root)) {
    return { data: root };
  }
  return root as AgenceCommandesListPayload;
}

function resolveMeta(payload: AgenceCommandesListPayload): AgenceCommandesPaginationMeta {
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
    return `${new Intl.NumberFormat('fr-FR').format(numeric)} FCFA`;
  }
  return String(value);
}

function formatQuantite(value: number | string | null | undefined): string {
  if (value == null || value === '') {
    return '—';
  }
  return String(value);
}

export function mapAgenceCommandeToRow(raw: AgenceCommandeRaw): AgenceCommande {
  return {
    id: String(raw.id ?? raw.code ?? ''),
    code: raw.code?.trim() ?? '—',
    client: resolveLabel(raw.client),
    quantite: formatQuantite(raw.quantite),
    montant: formatMontant(raw.montant),
    statut: raw.statut?.trim() ?? '',
    date: formatDate(raw.date ?? raw.created_at),
  };
}

function mapColisItems(items: AgenceCommandeRaw['colis']): AgenceCommandeColisItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      id: String(item.id ?? item.code ?? ''),
      code: item.code?.trim() ?? '—',
      statut: item.statut?.trim() ?? item.tracking?.trim() ?? '',
    }))
    .filter((item) => item.id || item.code !== '—');
}

export function parseAgenceCommandeDetailResponse(response: AgenceCommandeDetailResponse): AgenceCommandeDetail {
  const source = unwrapCommandeRaw(response);
  const client = asRecord(source.client);
  const offre = asRecord(source.offre);
  const paiement = asRecord(source.paiement);

  return {
    id: String(source.id ?? source.code ?? ''),
    code: source.code?.trim() ?? '—',
    statut: source.statut?.trim() ?? '',
    quantite: formatQuantite(source.quantite),
    montant: formatMontant(source.montant),
    date: formatDate(source.date ?? source.created_at),
    clientName: client ? resolveLabel(client) : resolveLabel(source.client),
    clientEmail: client ? readString(client, ['email']) : '',
    clientPhone: client ? readString(client, ['telephone', 'phone']) : '',
    offreTitre: offre ? readString(offre, ['titre', 'title']) : resolveLabel(source.offre),
    offreOrigine: offre ? readString(offre, ['origine']) : '',
    offreDestination: offre ? readString(offre, ['destination']) : '',
    offrePrix: offre ? formatMontant(offre['prix'] as number | string | null) : '—',
    paiementMontant: paiement ? formatMontant(paiement['montant'] as number | string | null) : '—',
    paiementStatut: paiement ? readString(paiement, ['statut']) : '',
    paiementMethode: paiement ? readString(paiement, ['methode', 'method']) : '',
    paiementReference: paiement ? readString(paiement, ['reference']) : '',
    paiementDate: paiement ? formatDate(readString(paiement, ['date', 'created_at']) || null) : '—',
    colis: mapColisItems(source.colis),
  };
}

export function parseAgenceCommandesListResponse(response: AgenceCommandesListResponse): AgenceCommandesPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapAgenceCommandeToRow);
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
