import {
  AgenceDashboardData,
  AgenceDashboardPeriode,
  AgenceDashboardResponse,
  AgenceDashboardStats,
} from '../models/agence-dashboard.model';

export interface AgenceDashboardStatusCount {
  key: string;
  label: string;
  count: number;
}

export interface AgenceDashboardOfferRow {
  id: string;
  label: string;
  statut: string;
  quantite: string;
  montant: string;
}

export interface AgenceDashboardCommandeRow {
  id: string;
  code: string;
  client: string;
  statut: string;
  montant: string;
  date: string;
}

export interface AgenceDashboardView {
  periode: AgenceDashboardPeriode;
  periodLabel: string;
  debut: string;
  fin: string;
  profilNom: string;
  profilVille: string;
  profilStatut: string;
  profilStatutKey: string;
  stats: AgenceDashboardStats;
  commandesParStatut: AgenceDashboardStatusCount[];
  colisParStatut: AgenceDashboardStatusCount[];
  topOffres: AgenceDashboardOfferRow[];
  dernieresCommandes: AgenceDashboardCommandeRow[];
}

function unwrapDashboardData(response: AgenceDashboardResponse): AgenceDashboardData {
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

export function formatDashboardMoney(value: number | null | undefined): string {
  return `${formatCount(value)} F CFA`;
}

export function formatDashboardKg(value: number | null | undefined): string {
  return `${formatCount(value)} kg`;
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

function mapStatusCounts(record: Record<string, number> | undefined): AgenceDashboardStatusCount[] {
  if (!record) {
    return [];
  }

  return Object.entries(record)
    .map(([key, count]) => ({
      key,
      label: key,
      count: count ?? 0,
    }))
    .filter((item) => item.count > 0 || item.key)
    .sort((a, b) => b.count - a.count);
}

function mapTopOffres(items: Array<Record<string, unknown>> | undefined): AgenceDashboardOfferRow[] {
  return (items ?? []).map((item, index) => ({
    id: resolveLabel(item['id']) || String(index),
    label:
      resolveLabel(item['titre']) ||
      resolveLabel(item['title']) ||
      resolveLabel(item['nom']) ||
      resolveLabel(item['code']) ||
      resolveLabel(item['reference']) ||
      '—',
    statut: resolveLabel(item['statut']) || resolveLabel(item['status']),
    quantite: formatCount(Number(item['quantite_vendue'] ?? item['quantite'] ?? item['sold_quantity'] ?? 0)),
    montant: formatDashboardMoney(Number(item['montant'] ?? item['revenu'] ?? item['amount'] ?? 0)),
  }));
}

function mapDernieresCommandes(items: Array<Record<string, unknown>> | undefined): AgenceDashboardCommandeRow[] {
  return (items ?? []).map((item, index) => ({
    id: resolveLabel(item['id']) || String(index),
    code: resolveLabel(item['code']) || resolveLabel(item['reference']) || '—',
    client:
      resolveLabel(item['client']) ||
      resolveLabel(item['client_nom']) ||
      resolveLabel(item['client_name']) ||
      resolveLabel(item['name']) ||
      '—',
    statut: resolveLabel(item['statut']) || resolveLabel(item['status']),
    montant: formatDashboardMoney(Number(item['montant'] ?? item['amount'] ?? item['total'] ?? 0)),
    date: formatDate(item['date'] ?? item['created_at']),
  }));
}

function resolveProfilStatutKey(statut: string): string {
  const value = statut.trim().toLowerCase();
  if (value === 'actif' || value === 'active') {
    return 'backoffice.profile.statusActive';
  }
  if (value === 'bloque' || value === 'blocked' || value === 'bloqué') {
    return 'backoffice.profile.statusBlocked';
  }
  if (value === 'suspendu' || value === 'suspended') {
    return 'backoffice.profile.statusSuspended';
  }
  if (value === 'inactif' || value === 'inactive') {
    return 'backoffice.profile.statusInactive';
  }
  return '';
}

const PERIOD_LABEL_KEYS: Record<AgenceDashboardPeriode, string> = {
  mois: 'backoffice.dashboard.periodeMonth',
  mois_dernier: 'backoffice.dashboard.periodeLastMonth',
  trimestre: 'backoffice.dashboard.periodeQuarter',
  semestre: 'backoffice.dashboard.periodeHalfYear',
  annee: 'backoffice.dashboard.periodeYear',
  tout: 'backoffice.dashboard.periodeAll',
};

export function parseAgenceDashboardResponse(response: AgenceDashboardResponse): AgenceDashboardView {
  const data = unwrapDashboardData(response);
  const periode = data.periode ?? 'mois';
  const profilStatut = data.profil?.statut?.trim() ?? '';

  return {
    periode,
    periodLabel: PERIOD_LABEL_KEYS[periode],
    debut: formatDate(data.debut),
    fin: formatDate(data.fin),
    profilNom: data.profil?.nom?.trim() ?? '',
    profilVille: data.profil?.ville?.trim() ?? '',
    profilStatut,
    profilStatutKey: resolveProfilStatutKey(profilStatut),
    stats: data.stats ?? {},
    commandesParStatut: mapStatusCounts(data.commandes_par_statut),
    colisParStatut: mapStatusCounts(data.colis_par_statut),
    topOffres: mapTopOffres(data.top_offres),
    dernieresCommandes: mapDernieresCommandes(data.dernieres_commandes),
  };
}
