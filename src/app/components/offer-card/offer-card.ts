import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingAction, OfferBookingModal } from '../offer-booking-modal/offer-booking-modal';
import { Offer } from '../../models/offer.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-offer-card',
  imports: [RouterLink, TranslatePipe, OfferBookingModal],
  templateUrl: './offer-card.html',
})
export class OfferCard {
  readonly offer = input.required<Offer>();

  protected readonly bookingOpen = signal(false);
  protected readonly bookingAction = signal<BookingAction>('achete');

  protected openBooking(action: BookingAction, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.bookingAction.set(action);
    this.bookingOpen.set(true);
  }

  protected closeBooking(): void {
    this.bookingOpen.set(false);
  }
}
