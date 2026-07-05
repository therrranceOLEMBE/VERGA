import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AgenceDashboardPeriode, AgenceDashboardResponse } from '../models/agence-dashboard.model';
import { AgenceOffreDetailResponse, AgenceOffresListResponse, AgenceOffresQueryParams } from '../models/agence-offre.model';
import {
  AgenceColisDetailResponse,
  AgenceColisListResponse,
  AgenceColisQueryParams,
  AgenceColisStatutUpdateRequest,
  AgenceColisStatutUpdateResponse,
} from '../models/agence-colis.model';
import { AgenceCommandesListResponse, AgenceCommandesQueryParams, AgenceCommandeDetailResponse } from '../models/agence-commande.model';
import { AgencePaiementsListResponse, AgencePaiementsQueryParams } from '../models/agence-paiement.model';
import { AgenceReclamationsListResponse, AgenceReclamationsQueryParams, AgenceReclamationDetailResponse, AgenceReclamationStatutUpdateRequest, AgenceReclamationStatutUpdateResponse, AgenceReclamationCreateRequest, AgenceReclamationCreateResponse } from '../models/agence-reclamation.model';
import { AgenceOffreCreateRequest, AgenceOffreCreateResponse, AgenceOffreDeleteResponse, AgenceOffreUpdateRequest, AgenceOffreUpdateResponse } from '../models/agence-offre-create.model';
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

  createOffre(payload: AgenceOffreCreateRequest): Observable<AgenceOffreCreateResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.createOffre(token, payload);
  }

  updateOffre(offreId: string, payload: AgenceOffreUpdateRequest): Observable<AgenceOffreUpdateResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.updateOffre(token, offreId, payload);
  }

  deleteOffre(offreId: string): Observable<AgenceOffreDeleteResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.deleteOffre(token, offreId);
  }

  loadCommandes(params: AgenceCommandesQueryParams = {}): Observable<AgenceCommandesListResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getCommandes(token, params);
  }

  loadCommande(commandeId: string): Observable<AgenceCommandeDetailResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getCommande(token, commandeId);
  }

  loadColis(params: AgenceColisQueryParams = {}): Observable<AgenceColisListResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getColis(token, params);
  }

  loadColisDetail(colisId: string): Observable<AgenceColisDetailResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getColisDetail(token, colisId);
  }

  advanceColisStatut(
    colisId: string,
    body: AgenceColisStatutUpdateRequest = {},
  ): Observable<AgenceColisStatutUpdateResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.updateColisStatut(token, colisId, body);
  }

  loadPaiements(params: AgencePaiementsQueryParams = {}): Observable<AgencePaiementsListResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getPaiements(token, params);
  }

  loadReclamations(params: AgenceReclamationsQueryParams = {}): Observable<AgenceReclamationsListResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getReclamations(token, params);
  }

  createReclamation(payload: AgenceReclamationCreateRequest): Observable<AgenceReclamationCreateResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.createReclamation(token, payload);
  }

  loadReclamationDetail(reclamationId: string): Observable<AgenceReclamationDetailResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getReclamationDetail(token, reclamationId);
  }

  updateReclamationStatut(
    reclamationId: string,
    body: AgenceReclamationStatutUpdateRequest,
  ): Observable<AgenceReclamationStatutUpdateResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.updateReclamationStatut(token, reclamationId, body);
  }

  updateProfile(data: Partial<AgenceProfile>): void {
    this.profile.update((current) => ({ ...current, ...data }));
  }

  private readToken(): string | null {
    return localStorage.getItem(AGENCE_TOKEN_KEY);
  }
}
