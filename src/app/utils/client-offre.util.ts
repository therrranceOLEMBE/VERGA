import { Offer, OfferPricingType } from '../models/offer.model';
import {
  ClientOffreDetailResponse,
  ClientOffreDestinationRaw,
  ClientOffreRaw,
  ClientOffresListResponse,
  ClientOffresPage,
  ClientOffresPaginationMeta,
  ClientOffreTypeOffreRaw,
} from '../models/client-offre.model';
import { resolveMediaUrl } from './media-url.util';

const LOGO_GRADIENTS = [
  'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  'linear-gradient(135deg, #1c1917 0%, #44403c 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
  'linear-gradient(135deg, #14532d 0%, #166534 100%)',
  'linear-gradient(135deg, #78350f 0%, #d97706 100%)',
  'linear-gradient(135deg, #9a3412 0%, #ff6b35 100%)',
  'linear-gradient(135deg, #334155 0%, #64748b 100%)',
  'linear-gradient(135deg, #3f3f46 0%, #71717a 100%)',
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function unwrapOffreRaw(response: ClientOffreDetailResponse | ClientOffreRaw): ClientOffreRaw {
  if ('data' in response && response.data) {
    return flattenOffreRaw(response.data);
  }
  return flattenOffreRaw(response as ClientOffreRaw);
}

function flattenOffreRaw(raw: ClientOffreRaw): ClientOffreRaw {
  const record = { ...(raw as Record<string, unknown>) };

  for (const key of ['offre', 'data', 'attributes']) {
    const nested = asRecord(record[key]);
    if (nested) {
      Object.assign(record, nested);
    }
  }

  return record as ClientOffreRaw;
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : null;
}

function capitalizePlace(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCreatedAt(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  const date = parsed.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = parsed.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  return `${date} | ${time}`;
}

function formatPlainDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  const iso = match?.[1] ?? value.trim();
  const parsed = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value.trim();
  }
  return parsed.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCount(value: number | null): string {
  if (value == null) {
    return '';
  }
  return new Intl.NumberFormat('fr-FR').format(value);
}

function resolveDestinationObject(raw: ClientOffreRaw): ClientOffreDestinationRaw | null {
  return asRecord(raw.destination) as ClientOffreDestinationRaw | null;
}

function resolvePlaceString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function resolveRoute(raw: ClientOffreRaw): { depart: string; arrivee: string } {
  const destinationObj = resolveDestinationObject(raw);
  const depart =
    resolvePlaceString(destinationObj?.depart) ||
    resolvePlaceString(raw.origine) ||
    '';
  const arrivee =
    resolvePlaceString(destinationObj?.arrivee) ||
    (typeof raw.destination === 'string' ? raw.destination.trim() : '') ||
    '';

  return {
    depart: capitalizePlace(depart),
    arrivee: capitalizePlace(arrivee),
  };
}

function resolvePricingType(raw: ClientOffreRaw, typeOffre?: ClientOffreTypeOffreRaw | null): OfferPricingType {
  const slug = (typeOffre?.slug ?? raw.type ?? '').toLowerCase();
  if (slug.includes('conteneur') || slug === 'container') {
    return 'container';
  }
  if (slug.includes('metre') || slug.includes('cube') || slug.includes('m3')) {
    return 'metreCube';
  }
  return 'kilo';
}

function formatPrice(raw: ClientOffreRaw): string {
  const destinationObj = resolveDestinationObject(raw);
  const prix = toNumber(raw.prix) ?? toNumber(destinationObj?.montant);
  if (prix == null) {
    return '—';
  }
  const formatted = new Intl.NumberFormat('fr-FR').format(prix);
  const typeOffre = raw.type_offre;
  const uniteLabel = typeOffre?.unite_label?.trim();
  if (uniteLabel) {
    return `${formatted} F CFA ${uniteLabel}`;
  }
  const unite = typeOffre?.unite?.toLowerCase();
  if (unite === 'kg') {
    return `${formatted} F CFA / kg`;
  }
  if (unite?.includes('m')) {
    return `${formatted} F CFA / m³`;
  }
  const pricingType = resolvePricingType(raw, typeOffre);
  if (pricingType === 'container') {
    return `${formatted} F CFA`;
  }
  if (pricingType === 'metreCube') {
    return `${formatted} F CFA / m³`;
  }
  return `${formatted} F CFA / kg`;
}

function resolveCategory(raw: ClientOffreRaw): string {
  const typeOffre = raw.type_offre;
  if (typeOffre?.nom?.trim()) {
    return typeOffre.nom.trim();
  }
  const legacy = raw.type?.trim();
  if (legacy === 'particulier') {
    return 'Particulier';
  }
  if (legacy === 'conteneur') {
    return 'Conteneur';
  }
  if (legacy === 'metre_cube') {
    return 'Mètre cube';
  }
  return 'Transport';
}

function resolvePublisherName(raw: ClientOffreRaw): string {
  const nom = raw.agence?.nom?.trim();
  if (nom) {
    return nom;
  }
  return 'Agence VERGA';
}

function resolvePublisherInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'VA';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function resolveLogoBg(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index)) % LOGO_GRADIENTS.length;
  }
  return LOGO_GRADIENTS[hash] ?? LOGO_GRADIENTS[0];
}

function resolveAgencyLogoUrl(raw: ClientOffreRaw): string {
  const logo = raw.agence?.logo;
  return resolveMediaUrl(logo?.url, logo?.chemin);
}

function resolveLocation(depart: string, arrivee: string, ville?: string): string {
  if (depart && arrivee) {
    return `${depart} → ${arrivee}`;
  }
  if (arrivee) {
    return arrivee;
  }
  if (depart) {
    return depart;
  }
  if (ville?.trim()) {
    return ville.trim();
  }
  return '—';
}

function resolveCapacityLabel(value: number | null, unlimited: boolean): string {
  if (unlimited) {
    return 'Illimitée';
  }
  if (value == null) {
    return '—';
  }
  return formatCount(value);
}

function resolveMeta(response: ClientOffresListResponse): ClientOffresPaginationMeta {
  return response.meta ?? response;
}

export function mapClientOffreToOffer(raw: ClientOffreRaw): Offer {
  const flat = flattenOffreRaw(raw);
  const publisherName = resolvePublisherName(flat);
  const { depart, arrivee } = resolveRoute(flat);
  const seed = flat.agence?.id ?? publisherName;
  const typeOffre = flat.type_offre;
  const unlimited = flat.capacite_illimitee === true;
  const disponible = toNumber(flat.capacite_disponible);
  const totale = toNumber(flat.capacite_totale);
  const ville = flat.agence?.ville?.trim() ?? '';
  const logoUrl = resolveAgencyLogoUrl(flat);
  const uniteLabel = typeOffre?.unite_label?.trim() || typeOffre?.unite?.trim() || '';

  return {
    id: String(flat.id ?? ''),
    title: flat.titre?.trim() || '—',
    likes: 0,
    date: formatCreatedAt(flat.created_at),
    price: formatPrice(flat),
    location: resolveLocation(depart, arrivee, ville),
    address: [depart, arrivee].filter(Boolean).join(' · ') || ville || '—',
    category: resolveCategory(flat),
    publisherName,
    publisherHandle: `@${publisherName.replace(/\s+/g, '_').toUpperCase()}`,
    publisherInitials: resolvePublisherInitials(publisherName),
    publisherCity: ville || undefined,
    logoBg: resolveLogoBg(String(seed)),
    logoUrl: logoUrl || undefined,
    description: flat.description?.trim() || '—',
    pricingType: resolvePricingType(flat, flat.type_offre),
    departureCountry: depart,
    arrivalCountry: arrivee,
    departureDate: formatPlainDate(flat.date_depart) || undefined,
    depotDate: formatPlainDate(flat.date_depot_colis) || undefined,
    capaciteDisponibleLabel: resolveCapacityLabel(disponible, unlimited),
    capaciteTotaleLabel: unlimited ? 'Illimitée' : resolveCapacityLabel(totale, false),
    uniteLabel: uniteLabel || undefined,
    verified: flat.statut === 'active',
    quantiteMin: typeOffre?.quantite_min ?? undefined,
    quantiteEntier: typeOffre?.quantite_entier ?? undefined,
    capaciteIllimitee: unlimited,
  };
}

export function parseClientOffresListResponse(response: ClientOffresListResponse): ClientOffresPage {
  const items = (response.data ?? []).map(mapClientOffreToOffer);
  const meta = resolveMeta(response);
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

export function parseClientOffreDetailResponse(response: ClientOffreDetailResponse): Offer {
  return mapClientOffreToOffer(unwrapOffreRaw(response));
}
