import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { BookingAction, OfferBookingModal } from '../../components/offer-booking-modal/offer-booking-modal';
import { Offer } from '../../models/offer.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { OfferService } from '../../services/offer.service';

@Component({
  selector: 'app-detail-offre',
  imports: [Header, Footer, RouterLink, TranslatePipe, OfferBookingModal],
  templateUrl: './detail-offre.html',
  styleUrl: './detail-offre.css',
})
export class DetailOffre {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly offerService = inject(OfferService);
  private readonly language = inject(LanguageService);

  protected readonly expanded = signal(false);
  protected readonly favorited = signal(false);
  protected readonly bookingOpen = signal(false);
  protected readonly bookingAction = signal<BookingAction>('achete');

  private readonly offerId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly offer = computed<Offer | undefined>(() => {
    this.language.lang();
    const id = this.offerId();
    return id ? this.offerService.getById(id) : undefined;
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
