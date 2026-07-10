import {
  AgenceReversement,
  AgenceReversementRaw,
  AgenceReversementStatut,
  AgenceReversementsListPayload,
  AgenceReversementsListResponse,
  AgenceReversementsPage,
  AgenceReversementsPaginationMeta,
} from '../models/agence-reversement.model';
import { formatDashboardMoney } from './agence-dashboard.util';

function unwrapListPayload(response: AgenceReversementsListResponse): AgenceReversementsListPayload {
  const root = response.data ?? response;
  if (Array.isArray(root)) {
    return { data: root, meta: response.meta };
  }
  return root as AgenceReversementsListPayload;
}

function resolveMeta(
  payload: AgenceReversementsListPayload,
  response: AgenceReversementsListResponse,
): AgenceReversementsPaginationMeta {
  return payload.meta ?? response.meta ?? payload;
}

function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const parsed = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatutKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeAgenceReversementStatut(statut: string | undefined): string {
  if (!statut?.trim()) {
    return '';
  }

  const key = normalizeStatutKey(statut);
  if (key === 'en_attente') {
    return 'en_attente';
  }
  if (key === 'effectue') {
    return 'effectué';
  }

  const trimmed = statut.trim();
  if (trimmed === 'en_attente' || trimmed === 'effectué') {
    return trimmed;
  }

  return trimmed;
}

export function isAgenceReversementStatut(value: string): value is AgenceReversementStatut {
  return value === 'en_attente' || value === 'effectué';
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

function formatPeriode(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '—';
  }
  const [year, month] = value.trim().split('-');
  if (year && month) {
    const parsed = new Date(Number(year), Number(month) - 1, 1);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  }
  return value.trim();
}

export function mapAgenceReversementToRow(raw: AgenceReversementRaw): AgenceReversement {
  return {
    id: String(raw.id ?? ''),
    montant: formatDashboardMoney(toNumber(raw.montant)),
    periode: formatPeriode(raw.periode),
    statut: normalizeAgenceReversementStatut(raw.statut),
    effectueLe: formatDate(raw.effectue_le),
    createdAt: formatDate(raw.created_at),
  };
}

export function parseAgenceReversementsListResponse(response: AgenceReversementsListResponse): AgenceReversementsPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapAgenceReversementToRow);
  const meta = resolveMeta(payload, response);
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
