import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
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
import { AgenceReversementsListResponse, AgenceReversementsQueryParams } from '../models/agence-reversement.model';
import { AgenceSoldeResponse } from '../models/agence-solde.model';
import { AgenceReclamationsListResponse, AgenceReclamationsQueryParams, AgenceReclamationDetailResponse, AgenceReclamationStatutUpdateRequest, AgenceReclamationStatutUpdateResponse, AgenceReclamationCreateRequest, AgenceReclamationCreateResponse } from '../models/agence-reclamation.model';
import { AgenceOffreCreateRequest, AgenceOffreCreateResponse, AgenceOffreDeleteResponse, AgenceOffreUpdateRequest, AgenceOffreUpdateResponse } from '../models/agence-offre-create.model';
import {
  AgenceDestination,
  AgenceDestinationCreateRequest,
} from '../models/agence-destination.model';
import {
  extractCreatedDestinationId,
  mapAgenceDestinationsResponse,
} from '../utils/agence-destination.util';
import {
  AgenceRolesResponse,
  AgenceUserCreateRequest,
  AgenceUserCreateResponse,
  AgenceUserDeleteResponse,
  AgenceUserUpdateRequest,
  AgenceUserUpdateResponse,
  AgenceUsersListResponse,
} from '../models/agence-user.model';
import {
  TypeOffre,
  TypeOffreCreateRequest,
  TypeOffreDeleteResponse,
  TypeOffreUpdateRequest,
} from '../models/type-offre.model';
import { mapAgenceMeToProfile } from '../utils/agence-me.util';
import { extractAgenceRoleSlug, normalizeAgenceRoleSlug } from '../utils/agence-permissions.util';
import { AgenceService } from './agence.service';

export interface AgenceProfileDocument {
  id: string;
  typeDocument: string;
  url: string;
  fileName: string;
}

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
  logoUrl: string;
  documents: AgenceProfileDocument[];
}

const AGENCE_TOKEN_KEY = 'verga-agence-token';
const AGENCE_ROLE_KEY = 'verga-agence-role';

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
  logoUrl: '',
  documents: [],
};

@Injectable({ providedIn: 'root' })
export class AgenceSessionService {
  private readonly agenceService = inject(AgenceService);
  private readonly token = signal<string | null>(this.readToken());
  private readonly profile = signal<AgenceProfile>({ ...EMPTY_PROFILE });
  private readonly roleSlug = signal<string>(this.readRoleSlug());
  /** false tant que le rôle n'est pas connu : évite d'afficher tout le menu puis de le filtrer. */
  private readonly permissionsReady = signal(this.computeInitialPermissionsReady());
  private permissionsLoad$: Observable<boolean> | null = null;

  readonly authToken = this.token.asReadonly();
  readonly agence = this.profile.asReadonly();
  readonly currentRoleSlug = this.roleSlug.asReadonly();
  readonly arePermissionsReady = this.permissionsReady.asReadonly();

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRoleSlug(): string {
    return this.roleSlug();
  }

  isPermissionsReady(): boolean {
    return this.permissionsReady();
  }

  getToken(): string | null {
    const stored = localStorage.getItem(AGENCE_TOKEN_KEY);
    if (stored !== this.token()) {
      this.token.set(stored);
    }
    return stored;
  }

  setSession(token: string, role?: unknown): void {
    localStorage.setItem(AGENCE_TOKEN_KEY, token);
    this.token.set(token);

    const normalizedRole = extractAgenceRoleSlug(role);
    if (normalizedRole) {
      this.setRoleSlug(normalizedRole);
      this.permissionsReady.set(true);
      this.permissionsLoad$ = null;
      return;
    }

    localStorage.removeItem(AGENCE_ROLE_KEY);
    this.roleSlug.set('');
    this.permissionsReady.set(false);
    this.permissionsLoad$ = null;
  }

  setRoleSlug(role: string): void {
    const normalized = normalizeAgenceRoleSlug(role);
    if (normalized) {
      localStorage.setItem(AGENCE_ROLE_KEY, normalized);
      this.roleSlug.set(normalized);
    }
  }

  /**
   * Garantit que le rôle est résolu avant d'afficher le backoffice.
   * Utilise le cache local si présent, sinon charge `/me`.
   */
  ensurePermissions(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    if (this.permissionsReady()) {
      return of(true);
    }

    if (!this.permissionsLoad$) {
      this.permissionsLoad$ = this.loadProfile().pipe(
        tap(() => this.permissionsReady.set(true)),
        map(() => true),
        catchError(() => {
          this.permissionsReady.set(true);
          return of(true);
        }),
        finalize(() => {
          this.permissionsLoad$ = null;
        }),
        shareReplay(1),
      );
    }

    return this.permissionsLoad$;
  }

  clearSession(): void {
    localStorage.removeItem(AGENCE_TOKEN_KEY);
    localStorage.removeItem(AGENCE_ROLE_KEY);
    this.token.set(null);
    this.roleSlug.set('');
    this.permissionsReady.set(true);
    this.permissionsLoad$ = null;
    this.profile.set({ ...EMPTY_PROFILE });
  }

  loadProfile(): Observable<void> {
    const token = this.getToken();
    if (!token) {
      return of(void 0);
    }

    return this.agenceService.getMe(token).pipe(
      tap((response) => {
        const mapped = mapAgenceMeToProfile(response);
        const { roleSlug, ...profileData } = mapped;
        this.updateProfile(profileData);
        if (roleSlug) {
          this.setRoleSlug(roleSlug);
        }
        this.permissionsReady.set(true);
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

  loadDestinations(search?: string): Observable<AgenceDestination[]> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getDestinations(token, search).pipe(
      map((response) => mapAgenceDestinationsResponse(response)),
    );
  }

  createDestination(payload: AgenceDestinationCreateRequest): Observable<string> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.createDestination(token, payload).pipe(
      map((response) => {
        const id = extractCreatedDestinationId(response);
        if (!id) {
          throw new Error('Destination créée sans identifiant');
        }
        return id;
      }),
    );
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

  loadTypeOffres(): Observable<TypeOffre[]> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getTypeOffres(token);
  }

  loadTypeOffre(typeOffreId: string): Observable<TypeOffre> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getTypeOffre(token, typeOffreId);
  }

  createTypeOffre(payload: TypeOffreCreateRequest): Observable<TypeOffre> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.createTypeOffre(token, payload);
  }

  updateTypeOffre(typeOffreId: string, payload: TypeOffreUpdateRequest): Observable<TypeOffre> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.updateTypeOffre(token, typeOffreId, payload);
  }

  deleteTypeOffre(typeOffreId: string): Observable<TypeOffreDeleteResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.deleteTypeOffre(token, typeOffreId);
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

  loadRoles(): Observable<AgenceRolesResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getRoles(token);
  }

  createUser(payload: AgenceUserCreateRequest): Observable<AgenceUserCreateResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.createUser(token, payload);
  }

  loadUsers(): Observable<AgenceUsersListResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getUsers(token);
  }

  updateUser(userId: number | string, payload: AgenceUserUpdateRequest): Observable<AgenceUserUpdateResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.updateUser(token, userId, payload);
  }

  deleteUser(userId: number | string): Observable<AgenceUserDeleteResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.deleteUser(token, userId);
  }

  loadSolde(): Observable<AgenceSoldeResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getSolde(token);
  }

  loadReversements(params: AgenceReversementsQueryParams = {}): Observable<AgenceReversementsListResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No agence token'));
    }

    return this.agenceService.getReversements(token, params);
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

  private readRoleSlug(): string {
    return normalizeAgenceRoleSlug(localStorage.getItem(AGENCE_ROLE_KEY) ?? '');
  }

  private computeInitialPermissionsReady(): boolean {
    // Connecté sans rôle en cache → attendre `/me` avant d'afficher le menu.
    if (!this.readToken()) {
      return true;
    }
    return !!this.readRoleSlug();
  }
}
