import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Offer } from '../../models/offer.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TransactionService } from '../../services/transaction.service';

export type BookingAction = 'achete' | 'reserve';

export interface BookingFormPayload {
  fullName: string;
  email: string;
  phone: string;
  kilos?: number;
  cubicMeters?: number;
}

@Component({
  selector: 'app-offer-booking-modal',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './offer-booking-modal.html',
})
export class OfferBookingModal {
  private readonly transactionService = inject(TransactionService);

  readonly offer = input.required<Offer>();
  readonly action = input.required<BookingAction>();
  readonly closed = output<void>();
  readonly submitted = output<BookingFormPayload>();

  protected fullName = '';
  protected email = '';
  protected phone = '';
  protected kilos = '';
  protected cubicMeters = '';
  protected readonly submittedSuccess = signal(false);

  protected readonly isKiloOffer = computed(() => this.offer().pricingType === 'kilo');
  protected readonly isCubicMeterOffer = computed(() => this.offer().pricingType === 'metreCube');
  protected readonly isContainerOffer = computed(() => this.offer().pricingType === 'container');

  protected readonly titleKey = computed(() =>
    this.action() === 'achete' ? 'offerBooking.titleBuy' : 'offerBooking.titleReserve',
  );

  protected readonly submitKey = computed(() =>
    this.action() === 'achete' ? 'offerBooking.submitBuy' : 'offerBooking.submitReserve',
  );

  protected close(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const payload: BookingFormPayload = {
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
    };

    if (this.isKiloOffer()) {
      payload.kilos = Number(this.kilos);
    } else if (this.isCubicMeterOffer()) {
      payload.cubicMeters = Number(this.cubicMeters);
    }

    this.transactionService.createFromBooking({
      offer: this.offer(),
      action: this.action(),
      ...payload,
    });

    this.submitted.emit(payload);
    this.submittedSuccess.set(true);
    setTimeout(() => this.close(), 1200);
  }
}
