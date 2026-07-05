import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClientLoginRequest, ClientLoginResponse, ClientLogoutResponse } from '../models/client-auth.model';
import {
  ClientCommandesListResponse,
  ClientCommandesQueryParams,
} from '../models/client-commande.model';
import {
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
} from '../models/client-reclamation.model';
import { ClientRegisterRequest, ClientRegisterResponse } from '../models/client-register.model';

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