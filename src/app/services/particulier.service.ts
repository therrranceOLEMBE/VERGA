import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClientLoginRequest, ClientLoginResponse, ClientLogoutResponse } from '../models/client-auth.model';
import {
  ClientCommandesListResponse,
  ClientCommandesQueryParams,
  ClientCommandeCreateResponse,
} from '../models/client-commande.model';
import {
  ClientColisDetailResponse,
  ClientColisListResponse,
  ClientColisQueryParams,
} from '../models/client-colis.model';
import { ClientMeResponse } from '../models/client-me.model';
import {
  ClientPasswordUpdateRequest,
  ClientPasswordUpdateResponse,
} from '../models/client-password.model';
import {
  ClientProfileUpdateRequest,
  ClientProfileUpdateResponse,
} from '../models/client-profile-update.model';
import {
  ClientReclamationsListResponse,
  ClientReclamationsQueryParams,
  ClientReclamationCreateRequest,
  ClientReclamationCreateResponse,
} from '../models/client-reclamation.model';
import {
  ClientPaiementsListResponse,
  ClientPaiementsQueryParams,
} from '../models/client-paiement.model';
import { ClientRegisterRequest, ClientRegisterResponse } from '../models/client-register.model';
import {
  ClientDashboardPeriode,
  ClientDashboardResponse,
} from '../models/client-dashboard.model';
import {
  ClientOffreDetailResponse,
  ClientOffresListResponse,
  ClientOffresQueryParams,
} from '../models/client-offre.model';
import {
  ClientOffreEstimationResponse,
} from '../models/client-offre-estimation.model';
import { TypeOffre, TypeOffreListResponse } from '../models/type-offre.model';
import { parseTypeOffreListResponse } from '../utils/type-offre.util';

@Injectable({ providedIn: 'root' })
export class ParticulierService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/client`;

  register(payload: ClientRegisterRequest): Observable<ClientRegisterResponse> {
    return this.http.post<ClientRegisterResponse>(`${this.baseUrl}/register`, payload);
  }

  login(payload: ClientLoginRequest): Observable<ClientLoginResponse> {
    return this.http.post<ClientLoginResponse>(`${this.baseUrl}/login`, payload);
  }

  getMe(token: string): Observable<ClientMeResponse> {
    return this.http.get<ClientMeResponse>(`${this.baseUrl}/me`, {
      headers: this.authHeaders(token),
    });
  }

  getDashboard(token: string, periode: ClientDashboardPeriode = 'mois'): Observable<ClientDashboardResponse> {
    const params = new HttpParams().set('periode', periode);
    return this.http.get<ClientDashboardResponse>(`${this.baseUrl}/dashboard`, {
      headers: this.authHeaders(token),
      params,
    });
  }

  updateProfile(token: string, payload: ClientProfileUpdateRequest): Observable<ClientProfileUpdateResponse> {
    return this.http.put<ClientProfileUpdateResponse>(`${this.baseUrl}/profile`, payload, {
      headers: this.authHeaders(token),
    });
  }

  changePassword(token: string, payload: ClientPasswordUpdateRequest): Observable<ClientPasswordUpdateResponse> {
    return this.http.put<ClientPasswordUpdateResponse>(`${this.baseUrl}/password`, payload, {
      headers: this.authHeaders(token),
    });
  }

  getCommandes(token: string, params: ClientCommandesQueryParams = {}): Observable<ClientCommandesListResponse> {
    let httpParams = new HttpParams();

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.statut) {
      httpParams = httpParams.set('statut', params.statut);
    }
    if (params.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.per_page) {
      httpParams = httpParams.set('per_page', String(params.per_page));
    }

    return this.http.get<ClientCommandesListResponse>(`${this.baseUrl}/commandes`, {
      headers: this.authHeaders(token),
      params: httpParams,
    });
  }

  createCommande(token: string | null, formData: FormData): Observable<ClientCommandeCreateResponse> {
    const options = token
      ? { headers: this.authHeaders(token) }
      : {};

    return this.http.post<ClientCommandeCreateResponse>(`${this.baseUrl}/commandes`, formData, options);
  }

  payCommandeSolde(
    token: string,
    commandeId: string,
    quantite: number,
  ): Observable<ClientCommandeCreateResponse> {
    return this.http.post<ClientCommandeCreateResponse>(
      `${this.baseUrl}/commandes/${commandeId}/paiements`,
      { quantite },
      { headers: this.authHeaders(token) },
    );
  }

  getColis(token: string, params: ClientColisQueryParams = {}): Observable<ClientColisListResponse> {
    let httpParams = new HttpParams();

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.statut) {
      httpParams = httpParams.set('statut', params.statut);
    }
    if (params.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.per_page) {
      httpParams = httpParams.set('per_page', String(params.per_page));
    }

    return this.http.get<ClientColisListResponse>(`${this.baseUrl}/colis`, {
      headers: this.authHeaders(token),
      params: httpParams,
    });
  }

  getColisDetail(token: string, colisId: string): Observable<ClientColisDetailResponse> {
    return this.http.get<ClientColisDetailResponse>(`${this.baseUrl}/colis/${colisId}`, {
      headers: this.authHeaders(token),
    });
  }

  getReclamations(
    token: string,
    params: ClientReclamationsQueryParams = {},
  ): Observable<ClientReclamationsListResponse> {
    let httpParams = new HttpParams();

    if (params.statut) {
      httpParams = httpParams.set('statut', params.statut);
    }
    if (params.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.per_page) {
      httpParams = httpParams.set('per_page', String(params.per_page));
    }

    return this.http.get<ClientReclamationsListResponse>(`${this.baseUrl}/reclamations`, {
      headers: this.authHeaders(token),
      params: httpParams,
    });
  }

  createReclamation(
    token: string,
    body: ClientReclamationCreateRequest,
  ): Observable<ClientReclamationCreateResponse> {
    return this.http.post<ClientReclamationCreateResponse>(`${this.baseUrl}/reclamations`, body, {
      headers: this.authHeaders(token),
    });
  }

  getPaiements(token: string, params: ClientPaiementsQueryParams = {}): Observable<ClientPaiementsListResponse> {
    let httpParams = new HttpParams();

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.statut) {
      httpParams = httpParams.set('statut', params.statut);
    }
    if (params.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.per_page) {
      httpParams = httpParams.set('per_page', String(params.per_page));
    }

    return this.http.get<ClientPaiementsListResponse>(`${this.baseUrl}/paiements`, {
      headers: this.authHeaders(token),
      params: httpParams,
    });
  }

  getOffres(params: ClientOffresQueryParams = {}): Observable<ClientOffresListResponse> {
    let httpParams = new HttpParams();

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.destination?.trim()) {
      httpParams = httpParams.set('destination', params.destination.trim());
    }
    if (params.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params.type_offre_id?.trim()) {
      httpParams = httpParams.set('type_offre_id', params.type_offre_id.trim());
    }
    if (params.date_debut) {
      httpParams = httpParams.set('date_debut', params.date_debut);
    }
    if (params.date_fin) {
      httpParams = httpParams.set('date_fin', params.date_fin);
    }
    if (params.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.per_page) {
      httpParams = httpParams.set('per_page', String(params.per_page));
    }

    return this.http.get<ClientOffresListResponse>(`${this.baseUrl}/offres`, {
      params: httpParams,
    });
  }

  getOffre(offreId: string): Observable<ClientOffreDetailResponse> {
    return this.http.get<ClientOffreDetailResponse>(`${this.baseUrl}/offres/${offreId}`);
  }

  getTypeOffres(): Observable<TypeOffre[]> {
    return this.http
      .get<TypeOffreListResponse>(`${environment.apiUrl}/types-offres`)
      .pipe(
        map((response) => parseTypeOffreListResponse(response)),
        catchError(() =>
          this.http.get<TypeOffreListResponse>(`${this.baseUrl}/types-offres`).pipe(
            map((response) => parseTypeOffreListResponse(response)),
            catchError(() => of([])),
          ),
        ),
      );
  }

  estimateOffre(offreId: string, quantite: number): Observable<ClientOffreEstimationResponse> {
    const params = new HttpParams().set('quantite', String(quantite));
    return this.http.get<ClientOffreEstimationResponse>(`${this.baseUrl}/offres/${offreId}/estimation`, {
      params,
    });
  }

  logout(token: string): Observable<ClientLogoutResponse> {
    return this.http.post<ClientLogoutResponse>(
      `${this.baseUrl}/logout`,
      {},
      {
        headers: this.authHeaders(token),
      },
    );
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}