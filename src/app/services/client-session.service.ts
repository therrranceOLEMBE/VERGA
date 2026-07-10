import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { ClientCommandeCreateResponse } from '../models/client-commande.model';
import { ClientDashboardPeriode, ClientDashboardResponse } from '../models/client-dashboard.model';
import { mapClientMeToProfile, mapProfileToApiPayload } from '../utils/client-me.util';
import { ParticulierService } from './particulier.service';

export interface ClientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  accountType: string;
}

const CLIENT_TOKEN_KEY = 'verga-client-token';

const EMPTY_PROFILE: ClientProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  accountType: '',
};

@Injectable({ providedIn: 'root' })
export class ClientSessionService {
  private readonly particulierService = inject(ParticulierService);
  private readonly profile = signal<ClientProfile>({ ...EMPTY_PROFILE });
  private readonly authenticated = signal(!!localStorage.getItem(CLIENT_TOKEN_KEY));

  readonly client = this.profile.asReadonly();
  readonly isLoggedIn = this.authenticated.asReadonly();

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  getToken(): string | null {
    return localStorage.getItem(CLIENT_TOKEN_KEY);
  }

  setSession(token: string, profile?: Partial<ClientProfile>): void {
    localStorage.setItem(CLIENT_TOKEN_KEY, token);
    this.authenticated.set(true);
    if (profile) {
      this.updateProfile(profile);
    }
  }

  clearSession(): void {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    this.authenticated.set(false);
    this.profile.set({ ...EMPTY_PROFILE });
  }

  loadProfile(): Observable<void> {
    const token = this.getToken();
    if (!token) {
      console.warn('[ClientSession] loadProfile — aucun token, profil non chargé');
      return of(void 0);
    }

    console.log('[ClientSession] loadProfile — appel GET /client/me…');

    return this.particulierService.getMe(token).pipe(
      tap((response) => {
        console.log('[ClientSession] loadProfile — réponse API brute:', response);
        const mapped = mapClientMeToProfile(response);
        console.log('[ClientSession] loadProfile — profil mappé:', mapped);
        this.updateProfile(mapped);
        console.log('[ClientSession] loadProfile — profil en session:', this.profile());
      }),
      map(() => void 0),
      catchError((error) => {
        console.error('[ClientSession] loadProfile — erreur:', error);
        return throwError(() => error);
      }),
    );
  }

  updateProfile(data: Partial<ClientProfile>): void {
    this.profile.update((current) => ({ ...current, ...data }));
  }

  saveProfile(data: Partial<ClientProfile>): Observable<void> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No client token'));
    }

    const payload = mapProfileToApiPayload({ ...this.profile(), ...data });

    return this.particulierService.updateProfile(token, payload).pipe(
      tap((response) => {
        const mapped = mapClientMeToProfile(response);
        if (mapped.email || mapped.firstName) {
          this.updateProfile(mapped);
        } else {
          this.updateProfile(data);
        }
      }),
      map(() => void 0),
    );
  }

  get fullName(): string {
    const { firstName, lastName } = this.profile();
    return `${firstName} ${lastName}`.trim();
  }

  createCommande(formData: FormData): Observable<ClientCommandeCreateResponse> {
    return this.particulierService.createCommande(this.getToken(), formData);
  }

  loadDashboard(periode: ClientDashboardPeriode = 'mois'): Observable<ClientDashboardResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No client token'));
    }
    return this.particulierService.getDashboard(token, periode);
  }
}
