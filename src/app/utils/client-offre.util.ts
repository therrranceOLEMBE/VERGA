import { Offer, OfferPricingType } from '../models/offer.model';
import {
  ClientOffreDetailResponse,
  ClientOffreRaw,
  ClientOffresListResponse,
  ClientOffresPage,
  ClientOffresPaginationMeta,
  ClientOffreTypeOffreRaw,
} from '../models/client-offre.model';

const LOGO_GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
  'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
  'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
  'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 100%)',
  'linear-gradient(135deg, #831843 0%, #ec4899 100%)',
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
  const prix = toNumber(raw.prix);
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

function resolveLocation(raw: ClientOffreRaw): string {
  const origine = raw.origine?.trim();
  const destination = raw.destination?.trim();
  const ville = raw.agence?.ville?.trim();

  if (origine && destination) {
    return `${origine} → ${destination}`;
  }
  if (destination) {
    return destination;
  }
  if (origine) {
    return origine;
  }
  if (ville) {
    return ville;
  }
  return '—';
}

function resolveMeta(response: ClientOffresListResponse): ClientOffresPaginationMeta {
  return response.meta ?? response;
}

export function mapClientOffreToOffer(raw: ClientOffreRaw): Offer {
  const flat = flattenOffreRaw(raw);
  const publisherName = resolvePublisherName(flat);
  const origine = flat.origine?.trim() ?? '';
  const destination = flat.destination?.trim() ?? '';
  const seed = flat.agence?.id ?? publisherName;
  const typeOffre = flat.type_offre;

  return {
    id: String(flat.id ?? ''),
    title: flat.titre?.trim() || '—',
    likes: 0,
    date: formatCreatedAt(flat.created_at),
    price: formatPrice(flat),
    location: resolveLocation(flat),
    address: [origine, destination].filter(Boolean).join(' · ') || '—',
    category: resolveCategory(flat),
    publisherName,
    publisherHandle: `@${publisherName.replace(/\s+/g, '_').toUpperCase()}`,
    publisherInitials: resolvePublisherInitials(publisherName),
    logoBg: resolveLogoBg(String(seed)),
    description: flat.description?.trim() || '—',
    pricingType: resolvePricingType(flat, flat.type_offre),
    departureCountry: origine,
    arrivalCountry: destination,
    verified: flat.statut === 'active',
    quantiteMin: typeOffre?.quantite_min ?? undefined,
    quantiteEntier: typeOffre?.quantite_entier ?? undefined,
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
