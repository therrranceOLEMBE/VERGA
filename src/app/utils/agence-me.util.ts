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

export function mapAgenceMeToProfile(response: AgenceMeResponse): Partial<AgenceProfile> {
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
