import { AgenceSolde, AgenceSoldeRaw, AgenceSoldeResponse, AgenceSoldeView } from '../models/agence-solde.model';
import { formatDashboardMoney } from './agence-dashboard.util';

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

function unwrapSoldeRaw(response: AgenceSoldeResponse): AgenceSoldeRaw {
  return response.data ?? {};
}

export function mapAgenceSolde(raw: AgenceSoldeRaw): AgenceSolde {
  return {
    paiementsValides: toNumber(raw.montant_paiements_valides),
    reversements: toNumber(raw.montant_reversements),
    solde: toNumber(raw.montant_solde),
    reversementsEnAttente: toNumber(raw.montant_reversements_en_attente),
    disponible: toNumber(raw.montant_disponible),
  };
}

export function mapAgenceSoldeToView(solde: AgenceSolde): AgenceSoldeView {
  return {
    paiementsValides: formatDashboardMoney(solde.paiementsValides),
    reversements: formatDashboardMoney(solde.reversements),
    solde: formatDashboardMoney(solde.solde),
    reversementsEnAttente: formatDashboardMoney(solde.reversementsEnAttente),
    disponible: formatDashboardMoney(solde.disponible),
  };
}

export function parseAgenceSoldeResponse(response: AgenceSoldeResponse): AgenceSoldeView {
  return mapAgenceSoldeToView(mapAgenceSolde(unwrapSoldeRaw(response)));
}
