import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AgenceLoginRequest,
  AgenceLoginResponse,
  AgenceLogoutResponse,
} from '../models/agence-auth.model';
import { AgenceMeResponse } from '../models/agence-me.model';
import {
  AgenceDashboardPeriode,
  AgenceDashboardResponse,
} from '../models/agence-dashboard.model';
import {
  AgenceOffreDetailResponse,
  AgenceOffresListResponse,
  AgenceOffresQueryParams,
} from '../models/agence-offre.model';
import {
  AgencePasswordUpdateRequest,
  AgencePasswordUpdateResponse,
} from '../models/agence-password.model';
import { AgenceRegisterRequest, AgenceRegisterResponse } from '../models/agence-register.model';
import { TypeAgence, TypeAgenceListResponse } from '../models/type-agence.model';

@Injectable({ providedIn: 'root' })
export class AgenceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/agence`;

  register(payload: AgenceRegisterRequest): Observable<AgenceRegisterResponse> {
    return this.http.post<AgenceRegisterResponse>(`${this.baseUrl}/register`, payload);
  }

  login(payload: AgenceLoginRequest): Observable<AgenceLoginResponse> {
    return this.http.post<AgenceLoginResponse>(`${this.baseUrl}/login`, payload);
  }

  logout(token: string): Observable<AgenceLogoutResponse> {
    return this.http.post<AgenceLogoutResponse>(
      `${this.baseUrl}/logout`,
      {},
      {
        headers: this.authHeaders(token),
      },
    );
  }

  getMe(token: string): Observable<AgenceMeResponse> {
    return this.http.get<AgenceMeResponse>(`${this.baseUrl}/me`, {
      headers: this.authHeaders(token),
    });
  }

  changePassword(token: string, payload: AgencePasswordUpdateRequest): Observable<AgencePasswordUpdateResponse> {
    return this.http.put<AgencePasswordUpdateResponse>(`${this.baseUrl}/password`, payload, {
      headers: this.authHeaders(token),
    });
  }

  getDashboard(token: string, periode: AgenceDashboardPeriode = 'mois'): Observable<AgenceDashboardResponse> {
    const params = new HttpParams().set('periode', periode);
    return this.http.get<AgenceDashboardResponse>(`${this.baseUrl}/dashboard`, {
      headers: this.authHeaders(token),
      params,
    });
  }

  getOffres(token: string, params: AgenceOffresQueryParams = {}): Observable<AgenceOffresListResponse> {
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

    return this.http.get<AgenceOffresListResponse>(`${this.baseUrl}/offres`, {
      headers: this.authHeaders(token),
      params: httpParams,
    });
  }

  getOffre(token: string, offreId: string): Observable<AgenceOffreDetailResponse> {
    return this.http.get<AgenceOffreDetailResponse>(`${this.baseUrl}/offres/${offreId}`, {
      headers: this.authHeaders(token),
    });
  }

  getTypeAgences(): Observable<TypeAgence[]> {
    return this.http.get<TypeAgenceListResponse>(`${environment.apiUrl}/referentiels/types-agence`).pipe(
      map((response) => this.mapTypeAgences(response)),
      catchError(() => of(this.getConfiguredTypeAgences())),
    );
  }

  private mapTypeAgences(response: TypeAgenceListResponse): TypeAgence[] {
    const items = response.data ?? [];
    const mapped = items
      .map((item) => ({
        id: item.id?.trim() ?? '',
        label: (item.nom ?? item.name ?? item.label ?? '').trim(),
      }))
      .filter((item) => item.id && item.label);

    return mapped.length > 0 ? mapped : this.getConfiguredTypeAgences();
  }

  private getConfiguredTypeAgences(): TypeAgence[] {
    const configured = environment.typeAgences ?? [];
    return configured.filter((item) => item.id && item.label);
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
