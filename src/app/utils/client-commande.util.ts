import {
  ClientCommande,
  ClientCommandeCreateResponse,
  ClientCommandeRaw,
  ClientCommandesListPayload,
  ClientCommandesListResponse,
  ClientCommandesPage,
  ClientCommandesPaginationMeta,
} from '../models/client-commande.model';

function unwrapListPayload(response: ClientCommandesListResponse): ClientCommandesListPayload {
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
    return response.data as ClientCommandesListPayload;
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
    return `${new Intl.NumberFormat('fr-FR').format(numeric)} FCFA`;
  }
  return String(value);
}

function parseNumeric(value: number | string | null | undefined): number {
  if (value == null || value === '') {
    return 0;
  }
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return !Number.isNaN(numeric) && Number.isFinite(numeric) ? numeric : 0;
}

function resolveAgenceId(raw: ClientCommandeRaw): string {
  if (raw.agence_id != null && String(raw.agence_id).trim()) {
    return String(raw.agence_id).trim();
  }
  if (raw.agence && typeof raw.agence === 'object' && raw.agence.id != null) {
    return String(raw.agence.id).trim();
  }
  return '';
}

export function mapCommandeToRow(raw: ClientCommandeRaw): ClientCommande {
  const quantiteLabel = raw.quantite_label?.trim() || '';
  const quantiteRestante = parseNumeric(raw.quantite_restante);

  return {
    id: String(raw.id ?? raw.code ?? ''),
    code: raw.code?.trim() ?? '—',
    client: resolveLabel(raw.client),
    agence: resolveLabel(raw.agence),
    agenceId: resolveAgenceId(raw),
    quantite: quantiteLabel || String(raw.quantite ?? '—'),
    quantiteRestante,
    quantiteRestanteLabel: raw.quantite_restante_label?.trim() || (quantiteRestante > 0 ? String(quantiteRestante) : '—'),
    quantitePayeeLabel: raw.quantite_payee_label?.trim() || '—',
    montant: formatMontant(raw.montant_total ?? raw.montant),
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

export function unwrapCommandeCreateResponse(
  response: ClientCommandeCreateResponse & { data?: ClientCommandeCreateResponse },
): ClientCommandeCreateResponse {
  return response.data ?? response;
}

export function resolvePaymentRedirectUrl(response: ClientCommandeCreateResponse): string {
  const record = response as Record<string, unknown>;
  const nested = record['data'];
  const sources: Record<string, unknown>[] = [
    record,
    typeof nested === 'object' && nested != null ? (nested as Record<string, unknown>) : {},
  ];

  for (const source of sources) {
    const redirect = source['redirect_url'] ?? source['redirectUrl'];
    if (typeof redirect === 'string' && redirect.trim()) {
      return redirect.trim();
    }
  }

  return '';
}

export function isCommandeReservee(statut: string): boolean {
  const normalized = statut.trim().toLowerCase();
  return normalized === 'réservée' || normalized === 'reservee';
}
