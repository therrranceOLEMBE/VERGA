import {
  ClientDashboardData,
  ClientDashboardPeriode,
  ClientDashboardResponse,
  ClientDashboardStats,
} from '../models/client-dashboard.model';
import { formatDashboardMoney } from './agence-dashboard.util';

export interface ClientDashboardStatusCount {
  key: string;
  labelKey: string;
  count: number;
}

export interface ClientDashboardCommandeRow {
  id: string;
  code: string;
  agence: string;
  quantite: string;
  montant: string;
  statut: string;
  statutKey: string;
  date: string;
}

export interface ClientDashboardView {
  periode: ClientDashboardPeriode;
  periodLabel: string;
  debut: string;
  fin: string;
  profilName: string;
  profilType: string;
  profilTypeKey: string;
  stats: ClientDashboardStats;
  commandesParStatut: ClientDashboardStatusCount[];
  colisParStatut: ClientDashboardStatusCount[];
  dernieresCommandes: ClientDashboardCommandeRow[];
}

const PERIOD_LABEL_KEYS: Record<ClientDashboardPeriode, string> = {
  mois: 'backoffice.dashboard.periodeMonth',
  mois_dernier: 'backoffice.dashboard.periodeLastMonth',
  trimestre: 'backoffice.dashboard.periodeQuarter',
  semestre: 'backoffice.dashboard.periodeHalfYear',
  annee: 'backoffice.dashboard.periodeYear',
  tout: 'backoffice.dashboard.periodeAll',
};

function unwrapDashboardData(response: ClientDashboardResponse): ClientDashboardData {
  return response.data ?? {};
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
    for (const key of ['nom', 'name', 'label', 'titre', 'title']) {
      const candidate = record[key];
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
  }
  return '';
}

function formatCount(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString('fr-FR');
}

function formatDate(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.trim();
  }
  return parsed.toLocaleDateString('fr-FR');
}

function normalizeStatusKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, '_');
}

function resolveCommandeStatusKey(statut: string): string {
  const key = normalizeStatusKey(statut);
  if (key === 'confirmee' || key === 'confirmée') {
    return 'clientBackoffice.commandes.status.confirmee';
  }
  if (key === 'annulee' || key === 'annulée') {
    return 'clientBackoffice.commandes.status.annulee';
  }
  if (key === 'en_attente') {
    return 'clientBackoffice.commandes.status.en_attente';
  }
  return 'clientBackoffice.commandes.status.unknown';
}

function resolveColisStatusKey(statut: string): string {
  const key = normalizeStatusKey(statut);
  if (key === 'depose' || key === 'déposé') {
    return 'clientBackoffice.colis.status.depose';
  }
  if (key === 'en_transit') {
    return 'clientBackoffice.colis.status.en_transit';
  }
  if (key === 'arrive' || key === 'arrivé') {
    return 'clientBackoffice.colis.status.arrive';
  }
  if (key === 'recupere' || key === 'récupéré') {
    return 'clientBackoffice.colis.status.recupere';
  }
  return 'clientBackoffice.colis.status.unknown';
}

function mapStatusCounts(
  record: Record<string, number> | undefined,
  resolveKey: (statut: string) => string,
): ClientDashboardStatusCount[] {
  if (!record) {
    return [];
  }

  return Object.entries(record)
    .map(([key, count]) => ({
      key,
      labelKey: resolveKey(key),
      count: count ?? 0,
    }))
    .filter((item) => item.count > 0 || item.key)
    .sort((a, b) => b.count - a.count);
}

function mapDernieresCommandes(items: Array<Record<string, unknown>> | undefined): ClientDashboardCommandeRow[] {
  return (items ?? []).map((item, index) => {
    const statut = resolveLabel(item['statut']) || resolveLabel(item['status']);
    return {
      id: resolveLabel(item['id']) || String(index),
      code: resolveLabel(item['code']) || resolveLabel(item['reference']) || '—',
      agence:
        resolveLabel(item['agence']) ||
        resolveLabel(item['agence_nom']) ||
        resolveLabel(item['agency']) ||
        '—',
      quantite: formatCount(Number(item['quantite'] ?? item['quantity'] ?? 0)),
      montant: formatDashboardMoney(Number(item['montant'] ?? item['amount'] ?? item['total'] ?? 0)),
      statut,
      statutKey: resolveCommandeStatusKey(statut),
      date: formatDate(item['date'] ?? item['created_at']),
    };
  });
}

function resolveProfilTypeKey(type: string): string {
  const value = type.trim().toLowerCase();
  if (value === 'particulier' || value === 'individual') {
    return 'clientBackoffice.dashboard.profileIndividual';
  }
  if (value === 'entreprise' || value === 'company') {
    return 'clientBackoffice.dashboard.profileCompany';
  }
  if (value === 'boutique' || value === 'shop') {
    return 'clientBackoffice.dashboard.profileShop';
  }
  return '';
}

export function parseClientDashboardResponse(response: ClientDashboardResponse): ClientDashboardView {
  const data = unwrapDashboardData(response);
  const periode = data.periode ?? 'mois';
  const prenom = data.profil?.prenom?.trim() ?? '';
  const nom = data.profil?.nom?.trim() ?? '';
  const profilType = data.profil?.type?.trim() ?? '';

  return {
    periode,
    periodLabel: PERIOD_LABEL_KEYS[periode],
    debut: formatDate(data.debut),
    fin: formatDate(data.fin),
    profilName: `${prenom} ${nom}`.trim(),
    profilType,
    profilTypeKey: resolveProfilTypeKey(profilType),
    stats: data.stats ?? {},
    commandesParStatut: mapStatusCounts(data.commandes_par_statut, resolveCommandeStatusKey),
    colisParStatut: mapStatusCounts(data.colis_par_statut, resolveColisStatusKey),
    dernieresCommandes: mapDernieresCommandes(data.dernieres_commandes),
  };
}
