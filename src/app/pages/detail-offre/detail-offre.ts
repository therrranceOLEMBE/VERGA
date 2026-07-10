import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { BookingAction, OfferBookingModal } from '../../components/offer-booking-modal/offer-booking-modal';
import { Offer } from '../../models/offer.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientOfferCatalogService } from '../../services/client-offre-catalog.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-detail-offre',
  imports: [Header, Footer, RouterLink, TranslatePipe, OfferBookingModal],
  templateUrl: './detail-offre.html',
  styleUrl: './detail-offre.css',
})
export class DetailOffre {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(ClientOfferCatalogService);
  private readonly language = inject(LanguageService);

  protected readonly expanded = signal(false);
  protected readonly favorited = signal(false);
  protected readonly bookingOpen = signal(false);
  protected readonly bookingAction = signal<BookingAction>('achete');
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  private readonly offerId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  private readonly loadedOffer = toSignal(
    toObservable(this.offerId).pipe(
      switchMap((id) => {
        if (!id) {
          this.loading.set(false);
          this.loadError.set(true);
          return of(undefined);
        }

        this.loading.set(true);
        this.loadError.set(false);

        return this.catalogService.loadById(id).pipe(
          map((offer) => {
            this.loading.set(false);
            return offer;
          }),
          catchError(() => {
            this.loading.set(false);
            this.loadError.set(true);
            return of(undefined);
          }),
        );
      }),
    ),
    { initialValue: undefined },
  );

  protected readonly offer = computed<Offer | undefined>(() => {
    this.language.lang();
    return this.loadedOffer();
  });

  protected readonly descriptionPreview = computed(() => {
    const text = this.offer()?.description ?? '';
    if (this.expanded() || text.length <= 220) {
      return text;
    }
    return text.slice(0, 220).trimEnd() + '…';
  });

  protected readonly showReadMore = computed(() => (this.offer()?.description.length ?? 0) > 220);

  protected toggleDescription(): void {
    this.expanded.update((v) => !v);
  }

  protected toggleFavorite(): void {
    this.favorited.update((v) => !v);
  }

  protected openBooking(action: BookingAction): void {
    this.bookingAction.set(action);
    this.bookingOpen.set(true);
  }

  protected closeBooking(): void {
    this.bookingOpen.set(false);
  }

  protected goBack(): void {
    void this.router.navigate(['/accueil']);
  }
}
