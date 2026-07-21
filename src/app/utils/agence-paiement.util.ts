import {
  AgencePaiement,
  AgencePaiementRaw,
  AgencePaiementsListPayload,
  AgencePaiementsListResponse,
  AgencePaiementsPage,
  AgencePaiementsPaginationMeta,
} from '../models/agence-paiement.model';

function unwrapListPayload(response: AgencePaiementsListResponse): AgencePaiementsListPayload {
  const root = response.data ?? response;
  if (Array.isArray(root)) {
    return { data: root };
  }
  return root as AgencePaiementsListPayload;
}

function resolveMeta(payload: AgencePaiementsListPayload): AgencePaiementsPaginationMeta {
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

function formatMontant(value: number | string | null | undefined, fallback?: number | string | null): string {
  const raw = value ?? fallback;
  if (raw == null || raw === '') {
    return '—';
  }
  const numeric = typeof raw === 'number' ? raw : Number(String(raw).replace(/\s/g, '').replace(',', '.'));
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    return `${new Intl.NumberFormat('fr-FR').format(numeric)} FCFA`;
  }
  return String(raw);
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

function resolveCodeVerga(raw: AgencePaiementRaw): string {
  return (
    readString(raw.code) ||
    readString(raw.code_verga) ||
    readString(raw.verga_code) ||
    ''
  );
}

function resolveRefBamboo(raw: AgencePaiementRaw): string {
  return (
    readString(raw.bamboo_reference) ||
    readString(raw.reference) ||
    readString(raw.ref) ||
    readString(raw.bamboo_ref) ||
    readString(raw.ref_bamboo) ||
    readString(raw.bamboo_billing_id) ||
    readString(raw.billing_id) ||
    ''
  );
}

function resolveMethode(raw: AgencePaiementRaw): string {
  return readString(raw.operateur) || readString(raw.methode) || readString(raw.method) || '—';
}

export function mapAgencePaiementToRow(raw: AgencePaiementRaw): AgencePaiement {
  const commande =
    readString(raw.commande_code) ||
    resolveLabel(raw.commande) ||
    (raw.commande_id != null ? String(raw.commande_id) : '');
  const codeVerga = resolveCodeVerga(raw);
  const refBamboo = resolveRefBamboo(raw);

  return {
    id: String(raw.id ?? codeVerga ?? refBamboo ?? ''),
    codeVerga: codeVerga || '—',
    refBamboo: refBamboo || '—',
    commande: commande || '—',
    montant: formatMontant(raw.montant, raw.amount),
    methode: resolveMethode(raw),
    statut: raw.statut?.trim() ?? '',
    date: formatDate(raw.date ?? raw.created_at ?? raw.updated_at),
  };
}

export function parseAgencePaiementsListResponse(response: AgencePaiementsListResponse): AgencePaiementsPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapAgencePaiementToRow);
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
