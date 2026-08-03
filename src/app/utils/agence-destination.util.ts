import {
  AgenceDestination,
  AgenceDestinationCreateResponse,
  AgenceDestinationRaw,
  AgenceDestinationsListResponse,
} from '../models/agence-destination.model';

function toNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }
  const numeric =
    typeof value === 'number' ? value : Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : null;
}

function capitalizeLabel(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Normalise un lieu pour comparer départ/arrivée (accents, casse, espaces). */
export function normalizeDestinationPlace(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function mapAgenceDestination(raw: AgenceDestinationRaw): AgenceDestination | null {
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  const depart = typeof raw.depart === 'string' ? raw.depart.trim() : '';
  const arrivee = typeof raw.arrivee === 'string' ? raw.arrivee.trim() : '';
  const montant = toNumber(raw.montant);

  if (!id || !depart || !arrivee || montant == null) {
    return null;
  }

  return {
    id,
    depart,
    arrivee,
    montant,
    commissionPourcentage: toNumber(raw.commission_pourcentage),
    appliquerConfiguration: raw.appliquer_configuration === true,
    actif: raw.actif !== false,
    rattachee: raw.rattachee === true,
    label: `${capitalizeLabel(depart)} → ${capitalizeLabel(arrivee)}`,
  };
}

export function mapAgenceDestinationsResponse(
  response: AgenceDestinationsListResponse | AgenceDestinationRaw[] | null | undefined,
): AgenceDestination[] {
  const list = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  return list
    .map((item) => mapAgenceDestination(item))
    .filter((item): item is AgenceDestination => item != null && item.actif);
}

export function findMatchingDestination(
  destinations: AgenceDestination[],
  depart: string,
  arrivee: string,
): AgenceDestination | undefined {
  const departKey = normalizeDestinationPlace(depart);
  const arriveeKey = normalizeDestinationPlace(arrivee);
  if (!departKey || !arriveeKey) {
    return undefined;
  }

  return destinations.find(
    (destination) =>
      normalizeDestinationPlace(destination.depart) === departKey &&
      normalizeDestinationPlace(destination.arrivee) === arriveeKey,
  );
}

export function extractCreatedDestinationId(
  response: AgenceDestinationCreateResponse | AgenceDestinationRaw | null | undefined,
): string {
  if (!response) {
    return '';
  }

  if (typeof (response as AgenceDestinationRaw).id === 'string') {
    return String((response as AgenceDestinationRaw).id).trim();
  }

  const nested = (response as AgenceDestinationCreateResponse).data;
  if (nested && typeof nested.id === 'string') {
    return nested.id.trim();
  }

  return '';
}
