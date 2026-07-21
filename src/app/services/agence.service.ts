import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
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
  AgenceOffreCreateRequest,
  AgenceOffreCreateResponse,
  AgenceOffreDeleteResponse,
  AgenceOffreUpdateRequest,
  AgenceOffreUpdateResponse,
} from '../models/agence-offre-create.model';
import {
  AgencePasswordUpdateRequest,
  AgencePasswordUpdateResponse,
} from '../models/agence-password.model';
import {
  AgenceRegisterDocument,
  AgenceRegisterRequest,
  AgenceRegisterResponse,
} from '../models/agence-register.model';
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
  AgenceColisDetailResponse,
  AgenceColisListResponse,
  AgenceColisQueryParams,
  AgenceColisStatutUpdateRequest,
  AgenceColisStatutUpdateResponse,
} from '../models/agence-colis.model';
import {
  AgenceCommandesListResponse,
  AgenceCommandesQueryParams,
  AgenceCommandeDetailResponse,
} from '../models/agence-commande.model';
import {
  AgencePaiementsListResponse,
  AgencePaiementsQueryParams,
} from '../models/agence-paiement.model';
import {
  AgenceReversementsListResponse,
  AgenceReversementsQueryParams,
} from '../models/agence-reversement.model';
import { AgenceSoldeResponse } from '../models/agence-solde.model';
import {
  AgenceReclamationsListResponse,
  AgenceReclamationsQueryParams,
  AgenceReclamationDetailResponse,
  AgenceReclamationStatutUpdateRequest,
  AgenceReclamationStatutUpdateResponse,
  AgenceReclamationCreateRequest,
  AgenceReclamationCreateResponse,
} from '../models/agence-reclamation.model';
import { TypeAgence, TypeAgenceListResponse } from '../models/type-agence.model';
import {
  TypeOffre,
  TypeOffreCreateRequest,
  TypeOffreCreateResponse,
  TypeOffreDeleteResponse,
  TypeOffreDetailResponse,
  TypeOffreListResponse,
  TypeOffreUpdateRequest,
  TypeOffreUpdateResponse,
} from '../models/type-offre.model';
import {
  parseTypeOffreCreateResponse,
  parseTypeOffreDetailResponse,
  parseTypeOffreListResponse,
} from '../utils/type-offre.util';

@Injectable({ providedIn: 'root' })
export class AgenceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/agence`;

  register(
    payload: AgenceRegisterRequest,
    logo?: File | null,
    documents?: AgenceRegisterDocument[],
  ): Observable<AgenceRegisterResponse> {
    const fd = new FormData();

    fd.append('nom', payload.nom);
    fd.append('email', payload.email);
    fd.append('telephone', payload.telephone);
    if (payload.type_agence_id) fd.append('type_agence_id', payload.type_agence_id);
    if (payload.ville) fd.append('ville', payload.ville);
    if (payload.adresse) fd.append('adresse', payload.adresse);
    if (payload.pays) fd.append('pays', payload.pays);
    fd.append('gerant_name', payload.gerant_name);
    fd.append('gerant_email', payload.gerant_email);
    fd.append('password', payload.password);
    fd.append('password_confirmation', payload.password_confirmation);
    if (payload.device_name) fd.append('device_name', payload.device_name);

    if (logo) {
      fd.append('logo', logo, logo.name);
    }

    if (documents?.length) {
      documents.forEach((doc, i) => {
        fd.append(`documents[${i}][fichier]`, doc.fichier, doc.fichier.name);
        fd.append(`documents[${i}][type_document]`, doc.type_document);
      });
    }

    return this.http.post<AgenceRegisterResponse>(`${this.baseUrl}/register`, fd);
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

  getRoles(token: string): Observable<AgenceRolesResponse> {
    return this.http.get<AgenceRolesResponse>(`${this.baseUrl}/roles`, {
      headers: this.authHeaders(token),
    });
  }

  createUser(token: string, payload: AgenceUserCreateRequest): Observable<AgenceUserCreateResponse> {
    return this.http.post<AgenceUserCreateResponse>(`${this.baseUrl}/users`, payload, {
      headers: this.authHeaders(token),
    });
  }

  getUsers(token: string): Observable<AgenceUsersListResponse> {
    return this.http.get<AgenceUsersListResponse>(`${this.baseUrl}/users`, {
      headers: this.authHeaders(token),
    });
  }

  updateUser(
    token: string,
    userId: number | string,
    payload: AgenceUserUpdateRequest,
  ): Observable<AgenceUserUpdateResponse> {
    return this.http.patch<AgenceUserUpdateResponse>(`${this.baseUrl}/users/${userId}`, payload, {
      headers: this.authHeaders(token),
    });
  }

  deleteUser(token: string, userId: number | string): Observable<AgenceUserDeleteResponse> {
    return this.http.delete<AgenceUserDeleteResponse>(`${this.baseUrl}/users/${userId}`, {
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
    }).pipe(
      map((response) => {
        console.log('[AgenceService] getOffres — réponse:', JSON.stringify(response?.data));
        return response;
      }),
      catchError((error) => {
        console.error('[AgenceService] getOffres — erreur:', error);
        return throwError(() => error);
      }),
    );
  }

  getOffre(token: string, offreId: string): Observable<AgenceOffreDetailResponse> {
    return this.http.get<AgenceOffreDetailResponse>(`${this.baseUrl}/offres/${offreId}`, {
      headers: this.authHeaders(token),
    });
  }

  createOffre(token: string, payload: AgenceOffreCreateRequest): Observable<AgenceOffreCreateResponse> {
    return this.http.post<AgenceOffreCreateResponse>(`${this.baseUrl}/offres`, payload, {
      headers: this.authHeaders(token),
    });
  }

  updateOffre(token: string, offreId: string, payload: AgenceOffreUpdateRequest): Observable<AgenceOffreUpdateResponse> {
    return this.http.patch<AgenceOffreUpdateResponse>(`${this.baseUrl}/offres/${offreId}`, payload, {
      headers: this.authHeaders(token),
    });
  }

  deleteOffre(token: string, offreId: string): Observable<AgenceOffreDeleteResponse> {
    return this.http.delete<AgenceOffreDeleteResponse>(`${this.baseUrl}/offres/${offreId}`, {
      headers: this.authHeaders(token),
    });
  }

  getCommandes(token: string, params: AgenceCommandesQueryParams = {}): Observable<AgenceCommandesListResponse> {
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

    return this.http.get<AgenceCommandesListResponse>(`${this.baseUrl}/commandes`, {
      headers: this.authHeaders(token),
      params: httpParams,
    });
  }

  getCommande(token: string, commandeId: string): Observable<AgenceCommandeDetailResponse> {
    return this.http.get<AgenceCommandeDetailResponse>(`${this.baseUrl}/commandes/${commandeId}`, {
      headers: this.authHeaders(token),
    });
  }

  getColis(token: string, params: AgenceColisQueryParams = {}): Observable<AgenceColisListResponse> {
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

    return this.http.get<AgenceColisListResponse>(`${this.baseUrl}/colis`, {
      headers: this.authHeaders(token),
      params: httpParams,
    }).pipe(
      map((response) => {
        console.log('[AgenceService] getColis — réponse:', JSON.stringify(response?.data));
        return response;
      }),
      catchError((error) => {
        console.error('[AgenceService] getColis — erreur:', error);
        return throwError(() => error);
      }),
    );
  }

  getColisDetail(token: string, colisId: string): Observable<AgenceColisDetailResponse> {
    return this.http.get<AgenceColisDetailResponse>(`${this.baseUrl}/colis/${colisId}`, {
      headers: this.authHeaders(token),
    });
  }

  updateColisStatut(
    token: string,
    colisId: string,
    body: AgenceColisStatutUpdateRequest = {},
  ): Observable<AgenceColisStatutUpdateResponse> {
    return this.http.patch<AgenceColisStatutUpdateResponse>(`${this.baseUrl}/colis/${colisId}/statut`, body, {
      headers: this.authHeaders(token),
    });
  }

  getSolde(token: string): Observable<AgenceSoldeResponse> {
    return this.http.get<AgenceSoldeResponse>(`${this.baseUrl}/solde`, {
      headers: this.authHeaders(token),
    });
  }

  getReversements(
    token: string,
    params: AgenceReversementsQueryParams = {},
  ): Observable<AgenceReversementsListResponse> {
    let httpParams = new HttpParams();

    if (params.statut) {
      httpParams = httpParams.set('statut', params.statut);
    }
    if (params.periode?.trim()) {
      httpParams = httpParams.set('periode', params.periode.trim());
    }
    if (params.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.per_page) {
      httpParams = httpParams.set('per_page', String(params.per_page));
    }

    return this.http.get<AgenceReversementsListResponse>(`${this.baseUrl}/reversements`, {
      headers: this.authHeaders(token),
      params: httpParams,
    });
  }

  getPaiements(token: string, params: AgencePaiementsQueryParams = {}): Observable<AgencePaiementsListResponse> {
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

    return this.http.get<AgencePaiementsListResponse>(`${this.baseUrl}/paiements`, {
      headers: this.authHeaders(token),
      params: httpParams,
    }).pipe(
      map((response) => {
        console.log('[AgenceService] getPaiements — réponse:', JSON.stringify(response?.data));
        return response;
      }),
      catchError((error) => {
        console.error('[AgenceService] getPaiements — erreur:', error);
        return throwError(() => error);
      }),
    );
  }

  getReclamations(token: string, params: AgenceReclamationsQueryParams = {}): Observable<AgenceReclamationsListResponse> {
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

    return this.http.get<AgenceReclamationsListResponse>(`${this.baseUrl}/reclamations`, {
      headers: this.authHeaders(token),
      params: httpParams,
    });
  }

  createReclamation(
    token: string,
    body: AgenceReclamationCreateRequest,
  ): Observable<AgenceReclamationCreateResponse> {
    return this.http.post<AgenceReclamationCreateResponse>(`${this.baseUrl}/reclamations`, body, {
      headers: this.authHeaders(token),
    });
  }

  getReclamationDetail(token: string, reclamationId: string): Observable<AgenceReclamationDetailResponse> {
    return this.http.get<AgenceReclamationDetailResponse>(`${this.baseUrl}/reclamations/${reclamationId}`, {
      headers: this.authHeaders(token),
    });
  }

  updateReclamationStatut(
    token: string,
    reclamationId: string,
    body: AgenceReclamationStatutUpdateRequest,
  ): Observable<AgenceReclamationStatutUpdateResponse> {
    return this.http.patch<AgenceReclamationStatutUpdateResponse>(
      `${this.baseUrl}/reclamations/${reclamationId}/statut`,
      body,
      {
        headers: this.authHeaders(token),
      },
    );
  }

  getTypeOffres(token: string): Observable<TypeOffre[]> {
    return this.http
      .get<TypeOffreListResponse>(`${this.baseUrl}/types-offres`, {
        headers: this.authHeaders(token),
      })
      .pipe(map((response) => parseTypeOffreListResponse(response)));
  }

  getTypeOffre(token: string, typeOffreId: string): Observable<TypeOffre> {
    return this.http
      .get<TypeOffreDetailResponse>(`${this.baseUrl}/types-offres/${typeOffreId}`, {
        headers: this.authHeaders(token),
      })
      .pipe(
        map((response) => {
          const item = parseTypeOffreDetailResponse(response);
          if (!item) {
            throw new Error('Type offre introuvable');
          }
          return item;
        }),
      );
  }

  createTypeOffre(token: string, payload: TypeOffreCreateRequest): Observable<TypeOffre> {
    return this.http
      .post<TypeOffreCreateResponse>(`${this.baseUrl}/types-offres`, payload, {
        headers: this.authHeaders(token),
      })
      .pipe(
        map((response) => {
          const item = parseTypeOffreCreateResponse(response);
          if (!item) {
            throw new Error('Réponse type offre invalide');
          }
          return item;
        }),
      );
  }

  updateTypeOffre(
    token: string,
    typeOffreId: string,
    payload: TypeOffreUpdateRequest,
  ): Observable<TypeOffre> {
    return this.http
      .patch<TypeOffreUpdateResponse>(`${this.baseUrl}/types-offres/${typeOffreId}`, payload, {
        headers: this.authHeaders(token),
      })
      .pipe(
        map((response) => {
          const item = parseTypeOffreDetailResponse(response);
          if (!item) {
            throw new Error('Réponse type offre invalide');
          }
          return item;
        }),
      );
  }

  deleteTypeOffre(token: string, typeOffreId: string): Observable<TypeOffreDeleteResponse> {
    return this.http.delete<TypeOffreDeleteResponse>(`${this.baseUrl}/types-offres/${typeOffreId}`, {
      headers: this.authHeaders(token),
    });
  }

  getTypeAgences(): Observable<TypeAgence[]> {
    return this.http.get<TypeAgenceListResponse>(`${this.baseUrl}/types-agences`).pipe(
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
        description: item.description?.trim() ?? '',
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
