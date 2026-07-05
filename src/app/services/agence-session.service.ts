import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AgenceDashboardPeriode, AgenceDashboardResponse } from '../models/agence-dashboard.model';
import { AgenceOffreDetailResponse, AgenceOffresListResponse, AgenceOffresQueryParams } from '../models/agence-offre.model';
import { mapAgenceMeToProfile } from '../utils/agence-me.util';
import { AgenceService } from './agence.service';

export interface AgenceProfile {
  companyName: string;
  status: string;
  statusLabelKey: string;
  statusClass: string;
  typeAgence: string;
  memberSince: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  fullAddress: string;
  gerantName: string;
  gerantEmail: string;
}

const AGENCE_TOKEN_KEY = 'verga-agence-token';

const EMPTY_PROFILE: AgenceProfile = {
  companyName: '',
  status: '',
  statusLabelKey: '',
  statusClass: 'bg-verga-surface text-verga-muted',
  typeAgence: '',
  memberSince: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  fullAddress: '',
  gerantName: '',
  gerantEmail: '',
};

@Injectable({ providedIn: 'root' })
export class AgenceSessionService {
  private readonly agenceService = inject(AgenceService);
  private readonly token = signal<string | null>(this.readToken());
  private readonly profile = signal<AgenceProfile>({ ...EMPTY_PROFILE });

  readonly authToken = this.token.asReadonly();
  readonly agence = this.profile.asReadonly();

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    const stored = localStorage.getItem(AGENCE_TOKEN_KEY);
    if (stored !== this.token()) {
      this.token.set(stored);
    }
    return stored;
  }

  setSession(token: string): void {
    localStorage.setItem(AGENCE_TOKEN_KEY, token);
    this.token.set(token);
  }

  clearSession(): void {
    localStorage.removeItem(AGENCE_TOKEN_KEY);
    this.token.set(null);
    this.profile.set({ ...EMPTY_PROFILE });
  }

  loadProfile(): Observable<void> {
    const token = this.getToken();
    if (!token) {
      return of(void 0);
    }

    return this.agenceService.getMe(token).pipe(
      tap((response) => {
        this.updateProfile(mapAgenceMeToProfile(response));
      }),
      map(() => void 0),
      catchError((error) => throwError(() => error)),
    );
  }

  loadDashboard(periode: AgenceDashboardPeriode = 'mois'): Observable<AgenceDashboardResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getDashboard(token, periode);
  }

  loadOffres(params: AgenceOffresQueryParams = {}): Observable<AgenceOffresListResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getOffres(token, params);
  }

  loadOffre(offreId: string): Observable<AgenceOffreDetailResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getOffre(token, offreId);
  }

  updateProfile(data: Partial<AgenceProfile>): void {
    this.profile.update((current) => ({ ...current, ...data }));
  }

  private readToken(): string | null {
    return localStorage.getItem(AGENCE_TOKEN_KEY);
  }
}
