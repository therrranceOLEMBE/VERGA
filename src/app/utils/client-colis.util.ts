import {
  ClientColis,
  ClientColisCommandeRaw,
  ClientColisDetail,
  ClientColisDetailRaw,
  ClientColisDetailResponse,
  ClientColisHistoriqueItem,
  ClientColisHistoriqueRaw,
  ClientColisListPayload,
  ClientColisListResponse,
  ClientColisPage,
  ClientColisPaginationMeta,
  ClientColisPhoto,
  ClientColisPhotoRaw,
  ClientColisRaw,
} from '../models/client-colis.model';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function flattenColisRaw(raw: ClientColisDetailRaw): ClientColisDetailRaw {
  const record = { ...(raw as Record<string, unknown>) };

  for (const key of ['colis', 'data', 'attributes']) {
    const nested = asRecord(record[key]);
    if (nested) {
      Object.assign(record, nested);
    }
  }

  return record as ClientColisDetailRaw;
}

function unwrapColisRaw(response: ClientColisDetailResponse | ClientColisDetailRaw): ClientColisDetailRaw {
  if ('data' in response && response.data) {
    return flattenColisRaw(response.data);
  }
  return flattenColisRaw(response as ClientColisDetailRaw);
}

function unwrapListPayload(response: ClientColisListResponse): ClientColisListPayload {
  const root = response.data ?? response;
  if (Array.isArray(root)) {
    return { data: root };
  }
  return root as ClientColisListPayload;
}

function resolveMeta(payload: ClientColisListPayload): ClientColisPaginationMeta {
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
    if (typeof nom === 'string' && nom.trim()) {
      return nom.trim();
    }
  }
  return '';
}

function resolveCommande(raw: ClientColisRaw): ClientColisCommandeRaw | null {
  if (raw.commande != null && typeof raw.commande === 'object') {
    return raw.commande;
  }
  return null;
}

function formatPoids(value: number | string | null | undefined, fallback?: number | string | null): string {
  const raw = value ?? fallback;
  if (raw == null || raw === '') {
    return '—';
  }
  const numeric = typeof raw === 'number' ? raw : Number(String(raw).replace(/\s/g, '').replace(',', '.'));
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    return `${new Intl.NumberFormat('fr-FR').format(numeric)} kg`;
  }
  const text = String(raw).trim();
  return text.toLowerCase().includes('kg') ? text : `${text} kg`;
}

function resolvePoidsLabel(raw: ClientColisRaw): string {
  const commande = resolveCommande(raw);
  const label =
    raw.quantite_label?.trim() ||
    raw.poids_label?.trim() ||
    commande?.quantite_label?.trim() ||
    '';

  if (label) {
    return label.toLowerCase().includes('kg') ? label : `${label} kg`;
  }

  return formatPoids(raw.poids, raw.poids_kg);
}

function resolveCommandeQuantite(raw: ClientColisRaw): string {
  const commande = resolveCommande(raw);
  if (commande?.quantite_label?.trim()) {
    const label = commande.quantite_label.trim();
    return label.toLowerCase().includes('kg') ? label : `${label} kg`;
  }
  if (commande?.quantite != null && String(commande.quantite).trim() !== '') {
    return formatPoids(commande.quantite);
  }
  return resolvePoidsLabel(raw);
}

function resolveDescription(raw: ClientColisRaw): string {
  const value = raw.description ?? raw.contenu ?? raw.libelle;
  if (value == null || String(value).trim() === '') {
    return '—';
  }
  return String(value).trim();
}

function resolveVolume(raw: ClientColisRaw): string {
  if (raw.volume == null || raw.volume === '') {
    return '—';
  }
  const text = String(raw.volume).trim();
  return text;
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

function mapPhotos(raw: ClientColisRaw): ClientColisPhoto[] {
  const items = raw.photos ?? [];
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((photo: ClientColisPhotoRaw, index: number) => ({
      id: String(photo.id ?? `photo-${index}`),
      url: photo.url?.trim() ?? '',
      ordre: typeof photo.ordre === 'number' ? photo.ordre : index,
    }))
    .filter((photo) => photo.url.length > 0)
    .sort((left, right) => left.ordre - right.ordre);
}

function resolveHistorique(raw: ClientColisDetailRaw): ClientColisHistoriqueRaw[] {
  const items = raw.historique ?? raw.history ?? raw.historiques ?? [];
  return Array.isArray(items) ? items : [];
}

function mapHistoriqueItem(raw: ClientColisHistoriqueRaw, index: number): ClientColisHistoriqueItem {
  const commentaire = raw.commentaire ?? raw.comment ?? raw.note;
  return {
    id: String(raw.id ?? `${raw.statut ?? 'step'}-${index}`),
    statut: raw.statut?.trim() ?? '',
    date: formatDate(raw.date ?? raw.created_at ?? raw.updated_at),
    commentaire: commentaire?.trim() ? String(commentaire).trim() : '—',
  };
}

export function mapColisToRow(raw: ClientColisRaw): ClientColis {
  const commande = resolveCommande(raw);
  const commandeCode =
    resolveLabel(raw.commande) ||
    commande?.code?.trim() ||
    (raw.commande_id != null ? String(raw.commande_id) : '');

  return {
    id: String(raw.id ?? raw.reference ?? raw.ref ?? raw.code ?? ''),
    reference: (raw.reference ?? raw.ref ?? raw.code)?.trim() ?? '—',
    commande: commandeCode || '—',
    commandeId: commande?.id != null ? String(commande.id) : '',
    commandeQuantite: resolveCommandeQuantite(raw),
    description: resolveDescription(raw),
    agence: resolveLabel(raw.agence) || '—',
    poids: resolvePoidsLabel(raw),
    volume: resolveVolume(raw),
    statut: raw.statut?.trim() ?? '',
    createdAt: formatDate(raw.created_at),
    photos: mapPhotos(raw),
  };
}

export function parseColisListResponse(response: ClientColisListResponse): ClientColisPage {
  const payload = unwrapListPayload(response);
  const items = (payload.data ?? []).map(mapColisToRow);
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

export function parseColisDetailResponse(response: ClientColisDetailResponse | ClientColisDetailRaw): ClientColisDetail {
  const raw = unwrapColisRaw(response);
  const base = mapColisToRow(raw);

  return {
    ...base,
    historique: resolveHistorique(raw).map(mapHistoriqueItem),
  };
}
