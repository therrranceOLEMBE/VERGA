import {
  ClientOffreEstimation,
  ClientOffreEstimationResponse,
} from '../models/client-offre-estimation.model';
import { formatDashboardMoney } from './agence-dashboard.util';

export interface ClientOffreEstimationView {
  subtotal: string;
  commission: string;
  commissionLabel: string;
  commissionRate: string;
  total: string;
  unitPrice: string;
  stockSufficient: boolean;
  availableCapacity: string;
}

export function unwrapOffreEstimation(
  response: ClientOffreEstimationResponse & ClientOffreEstimation,
): ClientOffreEstimation {
  const root = response.data ?? response;
  if (typeof root === 'object' && root != null && 'data' in (root as Record<string, unknown>)) {
    const nested = (root as Record<string, unknown>)['data'];
    if (typeof nested === 'object' && nested != null) {
      return nested as ClientOffreEstimation;
    }
  }
  return root as ClientOffreEstimation;
}

export function mapOffreEstimationToView(estimation: ClientOffreEstimation): ClientOffreEstimationView {
  const amounts = resolveEstimationAmounts(estimation);

  return {
    subtotal: formatDashboardMoney(amounts.subtotal),
    commission: formatDashboardMoney(amounts.commission),
    commissionLabel: amounts.commissionLabel,
    commissionRate: amounts.commissionRate,
    total: formatDashboardMoney(amounts.total),
    unitPrice: formatDashboardMoney(amounts.unitPrice),
    stockSufficient: estimation.stock_suffisant !== false,
    availableCapacity: formatQuantity(amounts.availableCapacity),
  };
}

interface EstimationAmounts {
  unitPrice: number;
  subtotal: number;
  commission: number;
  total: number;
  commissionLabel: string;
  commissionRate: string;
  availableCapacity: number | null;
}

function resolveEstimationAmounts(estimation: ClientOffreEstimation): EstimationAmounts {
  const record = estimation as Record<string, unknown>;
  const commissionRecord = readRecord(record['commission']);

  const unitPrice = readAmount(record['prix_unitaire']) ?? readAmount(record['prixUnitaire']) ?? 0;
  const subtotal =
    readAmount(record['montant_sous_total']) ??
    readAmount(record['montantSousTotal']) ??
    readAmount(record['sous_total']) ??
    0;

  let commission =
    readAmount(record['montant_commission_client']) ??
    readAmount(record['montantCommissionClient']) ??
    readAmount(record['montant_commission']) ??
    readAmount(record['montantCommission']) ??
    readAmount(commissionRecord?.['montant']) ??
    readAmount(commissionRecord?.['montant_commission']) ??
    readAmount(commissionRecord?.['montant_commission_client']) ??
    readAmount(commissionRecord?.['amount']);

  const commissionType = readString(commissionRecord?.['type']).toLowerCase();
  const commissionValeur = readAmount(commissionRecord?.['valeur']);
  const commissionLabel = readString(commissionRecord?.['libelle']);

  if ((commission == null || commission === 0) && commissionType === 'pourcentage' && commissionValeur != null && subtotal > 0) {
    commission = roundMoney(subtotal * commissionValeur / 100);
  }

  let total =
    readAmount(record['montant_total']) ??
    readAmount(record['montantTotal']) ??
    readAmount(record['total']) ??
    0;

  if (commission != null && commission > 0 && total <= subtotal) {
    total = roundMoney(subtotal + commission);
  }

  if (commission == null || commission === 0) {
    commission = total > subtotal ? roundMoney(total - subtotal) : 0;
  }

  const commissionRate =
    commissionType === 'pourcentage' && commissionValeur != null
      ? `${formatRate(commissionValeur)} %`
      : '';

  return {
    unitPrice,
    subtotal,
    commission: commission ?? 0,
    total: total > 0 ? total : roundMoney(subtotal + (commission ?? 0)),
    commissionLabel,
    commissionRate,
    availableCapacity: readAmount(record['capacite_disponible']),
  };
}

function readRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'object' && value != null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function readString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

function readAmount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const normalized = value.trim().replace(/\s/g, '').replace(',', '.');
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatRate(value: number): string {
  return value.toLocaleString('fr-FR', {
    maximumFractionDigits: 3,
  });
}

function formatQuantity(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return value.toLocaleString('fr-FR');
}
