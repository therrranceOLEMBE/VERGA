import { environment } from '../../environments/environment';

/**
 * Résout une URL média (logo, document) depuis `url` absolue ou `chemin` relatif storage.
 * Remappe localhost vers l’hôte de l’API si besoin.
 */
export function resolveMediaUrl(url?: string | null, chemin?: string | null): string {
  const absolute = typeof url === 'string' ? url.trim() : '';
  if (absolute) {
    try {
      const media = new URL(absolute);
      if (media.hostname === 'localhost' || media.hostname === '127.0.0.1') {
        const api = new URL(environment.apiUrl);
        media.protocol = api.protocol;
        media.hostname = api.hostname;
        media.port = api.port;
        return media.toString();
      }
    } catch {
      return absolute;
    }
    return absolute;
  }

  const path = typeof chemin === 'string' ? chemin.trim() : '';
  if (!path) {
    return '';
  }

  const base = environment.apiUrl.replace(/\/api\/v1\/?$/i, '').replace(/\/$/, '');
  const normalized = path.replace(/^\/?(storage\/)?/i, '');
  return `${base}/storage/${normalized}`;
}
