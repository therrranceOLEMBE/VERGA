/** Slugs de rôles agence connus côté front. */
export const AGENCE_ROLE_SUPPORT_LOGISTIQUE = 'support_logistique';

/** Chemins backoffice accessibles au support logistique (cf. description du rôle). */
const SUPPORT_LOGISTIQUE_PATHS = [
  '/backoffice/commandes',
  '/backoffice/support-logistique',
  '/backoffice/paiements',
  '/backoffice/creer-offre',
  '/backoffice/historique-offres',
  '/backoffice/compte/profil',
  '/backoffice/compte/mot-de-passe',
] as const;

function stripQuery(url: string): string {
  return url.split('?')[0]?.split('#')[0] ?? url;
}

/** Normalise un libellé / slug de rôle vers une clé comparable. */
export function normalizeAgenceRoleSlug(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

/** Extrait un slug de rôle depuis une string ou un objet API `{ slug, nom, ... }`. */
export function extractAgenceRoleSlug(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return normalizeAgenceRoleSlug(value);
  }
  if (value && typeof value === 'object') {
    const role = value as { slug?: string; nom?: string; name?: string; code?: string };
    return normalizeAgenceRoleSlug(role.slug ?? role.code ?? role.nom ?? role.name ?? '');
  }
  return '';
}

export function isSupportLogistiqueRole(roleSlug: string | null | undefined): boolean {
  const normalized = normalizeAgenceRoleSlug(roleSlug);
  return (
    normalized === AGENCE_ROLE_SUPPORT_LOGISTIQUE ||
    normalized.includes('support_logistique')
  );
}

export function getAgenceHomePath(roleSlug: string | null | undefined): string {
  if (isSupportLogistiqueRole(roleSlug)) {
    return '/backoffice/commandes';
  }
  return '/backoffice/tableau-de-bord';
}

export function canAccessAgencePath(roleSlug: string | null | undefined, url: string): boolean {
  if (!isSupportLogistiqueRole(roleSlug)) {
    return true;
  }

  const path = stripQuery(url);
  if (path === '/backoffice' || path === '/backoffice/') {
    return true;
  }

  return SUPPORT_LOGISTIQUE_PATHS.some(
    (allowed) => path === allowed || path.startsWith(`${allowed}/`),
  );
}

export function filterPathsByRole<T extends { path: string }>(
  items: T[],
  roleSlug: string | null | undefined,
  permissionsReady = true,
): T[] {
  if (!permissionsReady) {
    return [];
  }
  if (!isSupportLogistiqueRole(roleSlug)) {
    return items;
  }
  return items.filter((item) => canAccessAgencePath(roleSlug, item.path));
}
