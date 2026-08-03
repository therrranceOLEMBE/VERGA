import { AgenceDocumentFields, AgenceMeData, AgenceMeFields, AgenceMeResponse, AgenceMeUserFields } from '../models/agence-me.model';
import { AgenceProfile, AgenceProfileDocument } from '../services/agence-session.service';

function unwrapMeData(response: AgenceMeResponse): AgenceMeData {
  return response.data ?? response;
}

function resolveUser(data: AgenceMeData): AgenceMeUserFields {
  return data.user ?? data;
}

function resolveAgence(data: AgenceMeData, user: AgenceMeUserFields): AgenceMeFields {
  return data.agence ?? user.agence ?? {};
}

function resolveTypeAgence(agence: AgenceMeFields): string {
  const type = agence.type_agence;
  return (type?.nom ?? type?.name ?? type?.label ?? agence.type_agence_nom ?? '').trim();
}

function formatMemberSince(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join(', ');
}

function resolveStatusKey(statut: string | undefined, isActive: boolean | undefined): string {
  const value = statut?.trim().toLowerCase() ?? '';

  if (value === 'actif' || value === 'active' || isActive === true) {
    return 'backoffice.profile.statusActive';
  }
  if (value === 'bloque' || value === 'blocked' || value === 'bloqué') {
    return 'backoffice.profile.statusBlocked';
  }
  if (value === 'suspendu' || value === 'suspended') {
    return 'backoffice.profile.statusSuspended';
  }
  if (value === 'inactif' || value === 'inactive' || isActive === false) {
    return 'backoffice.profile.statusInactive';
  }

  return '';
}

function resolveStatusClass(statut: string | undefined, isActive: boolean | undefined): string {
  const value = statut?.trim().toLowerCase() ?? '';

  if (value === 'actif' || value === 'active' || isActive === true) {
    return 'bg-verga-success-muted text-verga-success';
  }
  if (value === 'bloque' || value === 'blocked' || value === 'bloqué' || value === 'suspendu' || value === 'suspended') {
    return 'bg-red-50 text-red-700';
  }

  return 'bg-verga-surface text-verga-muted';
}

function extractRoleValue(candidate: unknown): string {
  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim();
  }
  if (candidate && typeof candidate === 'object') {
    const role = candidate as { slug?: string; nom?: string; name?: string; code?: string };
    return (role.slug ?? role.code ?? role.nom ?? role.name ?? '').trim();
  }
  return '';
}

function resolveRoleSlug(response: AgenceMeResponse): string {
  const data = unwrapMeData(response);
  const user = resolveUser(data);
  const candidates = [data.role, user.role, response.role];
  for (const candidate of candidates) {
    const value = extractRoleValue(candidate);
    if (value) {
      return value;
    }
  }
  return '';
}

export function mapAgenceMeToProfile(response: AgenceMeResponse): Partial<AgenceProfile> & { roleSlug?: string } {
  const data = unwrapMeData(response);
  const user = resolveUser(data);
  const agence = resolveAgence(data, user);

  const address = agence.adresse?.trim() ?? '';
  const city = agence.ville?.trim() ?? '';
  const country = agence.pays?.trim() ?? '';
  const statut = agence.statut?.trim() ?? '';

  return {
    companyName: agence.nom?.trim() ?? '',
    status: statut,
    statusLabelKey: resolveStatusKey(statut, agence.is_active),
    statusClass: resolveStatusClass(statut, agence.is_active),
    typeAgence: resolveTypeAgence(agence),
    memberSince: formatMemberSince(agence.created_at),
    email: agence.email?.trim() ?? '',
    phone: agence.telephone?.trim() ?? '',
    address,
    city,
    country,
    fullAddress: joinAddress([address, city, country]),
    gerantName: (agence.gerant_name ?? user.name)?.trim() ?? '',
    gerantEmail: (agence.gerant_email ?? user.email)?.trim() ?? '',
    logoUrl: agence.logo?.url?.trim() ?? '',
    documents: mapDocuments(agence.documents),
    roleSlug: resolveRoleSlug(response),
  };
}

function mapDocuments(raw: AgenceDocumentFields[] | undefined): AgenceProfileDocument[] {
  if (!raw?.length) return [];

  return raw
    .filter((doc) => doc.id && doc.url)
    .map((doc) => ({
      id: doc.id!,
      typeDocument: doc.type_document?.trim() ?? '',
      url: doc.url!.trim(),
      fileName: doc.nom_original?.trim() ?? '',
    }));
}
