import { Injectable, inject } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { Offer } from '../models/offer.model';
import { ClientOffresPage, ClientOffresQueryParams } from '../models/client-offre.model';
import { TypeOffre } from '../models/type-offre.model';
import { ParticulierService } from './particulier.service';
import { parseClientOffreDetailResponse, parseClientOffresListResponse } from '../utils/client-offre.util';

@Injectable({ providedIn: 'root' })
export class ClientOfferCatalogService {
  private readonly particulierService = inject(ParticulierService);
  private readonly cache = new Map<string, Offer>();

  loadOffres(params: ClientOffresQueryParams = {}): Observable<ClientOffresPage> {
    return this.particulierService.getOffres(params).pipe(
      map((response) => parseClientOffresListResponse(response)),
      tap((page) => {
        for (const offer of page.items) {
          this.cache.set(offer.id, offer);
        }
      }),
    );
  }

  getCachedById(id: string): Offer | undefined {
    return this.cache.get(id);
  }

  loadTypeOffres(): Observable<TypeOffre[]> {
    return this.particulierService.getTypeOffres();
  }

  loadById(id: string): Observable<Offer> {
    const cached = this.cache.get(id);
    if (cached) {
      return of(cached);
    }

    return this.particulierService.getOffre(id).pipe(
      map((response) => parseClientOffreDetailResponse(response)),
      tap((offer) => {
        this.cache.set(offer.id, offer);
      }),
    );
  }
}
