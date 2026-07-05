import { ClientMeData, ClientMeFields, ClientMeResponse } from '../models/client-me.model';
import { ClientProfileUpdateRequest } from '../models/client-profile-update.model';
import { ClientProfile } from '../services/client-session.service';

function unwrapMeData(response: ClientMeResponse): ClientMeData {
  return response.data ?? response;
}

function resolveMeFields(data: ClientMeData): ClientMeFields {
  const { user, client, ...flat } = data;
  return { ...flat, ...user, ...client };
}

function splitFullName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function mapClientMeToProfile(response: ClientMeResponse): Partial<ClientProfile> {
  const data = unwrapMeData(response);
  const source = resolveMeFields(data);

  let firstName = source.prenom?.trim() ?? '';
  let lastName = source.nom?.trim() ?? '';

  if ((!firstName || !lastName) && data.name) {
    const fromName = splitFullName(data.name);
    firstName = firstName || fromName.firstName;
    lastName = lastName || fromName.lastName;
  }

  return {
    firstName,
    lastName,
    email: (source.email ?? data.email)?.trim() ?? '',
    phone: source.telephone?.trim() ?? '',
    address: source.adresse?.trim() ?? '',
    city: source.ville?.trim() ?? '',
    country: source.pays?.trim() ?? '',
    accountType: (source.type ?? data.role)?.trim() ?? '',
  };
}

export function mapProfileToApiPayload(profile: Partial<ClientProfile>): ClientProfileUpdateRequest {
  return {
    nom: profile.lastName?.trim() ?? '',
    prenom: profile.firstName?.trim() ?? '',
    email: profile.email?.trim() ?? '',
    telephone: profile.phone?.trim() ?? '',
    adresse: profile.address?.trim() ?? '',
    ville: profile.city?.trim() ?? '',
    pays: profile.country?.trim() ?? '',
    type: 'particulier',
  };
}
