import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Offer } from '../../models/offer.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { resolvePaymentRedirectUrl, unwrapCommandeCreateResponse } from '../../utils/client-commande.util';
import {
  ClientOffreEstimationView,
  mapOffreEstimationToView,
  unwrapOffreEstimation,
} from '../../utils/client-offre-estimation.util';

export type BookingAction = 'achete' | 'reserve';

@Component({
  selector: 'app-offer-booking-modal',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './offer-booking-modal.html',
})
export class OfferBookingModal implements OnInit {
  private readonly clientSession = inject(ClientSessionService);
  private readonly particulierService = inject(ParticulierService);
  private readonly destroyRef = inject(DestroyRef);

  readonly offer = input.required<Offer>();
  readonly action = input.required<BookingAction>();
  readonly closed = output<void>();

  protected prenom = '';
  protected nom = '';
  protected phone = '';
  protected description = '';
  protected quantite: string | number = '';
  protected quantiteReservee: string | number = '';
  protected readonly photos = signal<File[]>([]);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly estimationLoading = signal(false);
  protected readonly estimationError = signal('');
  protected readonly estimation = signal<ClientOffreEstimationView | null>(null);

  private estimationTimer: ReturnType<typeof setTimeout> | null = null;
  private estimationRequestId = 0;

  protected readonly isAuthenticated = computed(() => this.clientSession.isAuthenticated());
  protected readonly isKiloOffer = computed(() => this.offer().pricingType === 'kilo');
  protected readonly isCubicMeterOffer = computed(() => this.offer().pricingType === 'metreCube');
  protected readonly isContainerOffer = computed(() => this.offer().pricingType === 'container');
  protected readonly isReserve = computed(() => this.action() === 'reserve');

  protected readonly quantityStep = computed(() => {
    const offer = this.offer();
    if (offer.quantiteEntier === true || this.isContainerOffer()) {
      return 1;
    }
    return 0.001;
  });

  protected readonly quantityMin = computed(() => {
    const offer = this.offer();
    if (this.isContainerOffer()) {
      return 1;
    }
    return offer.quantiteMin ?? (offer.quantiteEntier ? 1 : 0.001);
  });

  protected readonly quantityLabelKey = computed(() => {
    if (this.isCubicMeterOffer()) {
      return 'offerBooking.cubicMeters';
    }
    if (this.isContainerOffer()) {
      return 'offerBooking.containers';
    }
    return 'offerBooking.kilos';
  });

  protected readonly titleKey = computed(() =>
    this.action() === 'achete' ? 'offerBooking.titleBuy' : 'offerBooking.titleReserve',
  );

  protected readonly submitKey = computed(() =>
    this.action() === 'achete' ? 'offerBooking.submitBuy' : 'offerBooking.submitReserve',
  );

  protected readonly submitDisabled = computed(
    () => this.submitting() || (this.estimation() != null && !this.estimation()!.stockSufficient),
  );

  ngOnInit(): void {
    const profile = this.clientSession.client();
    if (profile.firstName) {
      this.prenom = profile.firstName;
    }
    if (profile.lastName) {
      this.nom = profile.lastName;
    }
    if (profile.phone) {
      this.phone = profile.phone;
    }
    if (this.isContainerOffer()) {
      this.quantite = '1';
      if (this.isReserve()) {
        this.quantiteReservee = '1';
      }
    }

    this.refreshEstimation();
  }

  protected close(): void {
    if (!this.submitting()) {
      this.closed.emit();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.submitting()) {
      this.close();
    }
  }

  protected onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const incoming = Array.from(input.files ?? []);
    if (incoming.length === 0) {
      return;
    }

    const merged = [...this.photos()];
    for (const file of incoming) {
      const duplicate = merged.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified,
      );
      if (!duplicate) {
        merged.push(file);
      }
    }

    this.photos.set(merged);
    input.value = '';
  }

  protected removePhoto(index: number): void {
    this.photos.update((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  protected photoKey(photo: File): string {
    return `${photo.name}-${photo.size}-${photo.lastModified}`;
  }

  protected onQuantityChanged(): void {
    if (this.estimationTimer) {
      clearTimeout(this.estimationTimer);
    }
    this.estimationTimer = setTimeout(() => this.refreshEstimation(), 400);
  }

  private refreshEstimation(): void {
    const quantite = this.resolveQuantite();
    if (quantite == null || quantite <= 0) {
      this.estimation.set(null);
      this.estimationError.set('');
      this.estimationLoading.set(false);
      return;
    }

    if (this.isReserve()) {
      const reservee = this.parseQuantity(this.quantiteReservee);
      if (reservee == null || reservee <= 0 || quantite > reservee) {
        this.estimation.set(null);
        this.estimationError.set('');
        this.estimationLoading.set(false);
        return;
      }
    }

    const requestId = ++this.estimationRequestId;
    this.estimationLoading.set(true);
    this.estimationError.set('');

    this.particulierService
      .estimateOffre(this.offer().id, quantite)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (requestId !== this.estimationRequestId) {
            return;
          }
          const payload = unwrapOffreEstimation(response);
          this.estimation.set(mapOffreEstimationToView(payload));
          this.estimationLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          if (requestId !== this.estimationRequestId) {
            return;
          }
          this.estimation.set(null);
          this.estimationLoading.set(false);
          const apiMessage = extractApiErrorMessage(error);
          this.estimationError.set(apiMessage ?? 'offerBooking.estimationUnavailable');
        },
      });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');

    console.log('[OfferBooking] Soumission du formulaire', {
      action: this.action(),
      offerId: this.offer().id,
      authenticated: this.isAuthenticated(),
    });

    const validationError = this.validateForm();
    if (validationError) {
      console.warn('[OfferBooking] Validation échouée:', validationError);
      this.errorMessage.set(validationError);
      return;
    }

    const formData = this.buildFormData();
    const photos = this.photos();
    console.log('[OfferBooking] Photos envoyées:', photos.map((photo) => ({
      name: photo.name,
      size: photo.size,
      type: photo.type,
    })));
    this.submitting.set(true);

    const token = this.clientSession.getToken();
    this.particulierService.createCommande(token, formData).subscribe({
      next: (raw) => {
        const response = unwrapCommandeCreateResponse(raw);
        console.log('[OfferBooking] Commande créée:', response);
        const redirectUrl = resolvePaymentRedirectUrl(response);
        if (redirectUrl) {
          window.location.assign(redirectUrl);
          return;
        }
        this.submitting.set(false);
        this.errorMessage.set('offerBooking.missingRedirect');
      },
      error: (error: HttpErrorResponse) => {
        console.error('[OfferBooking] Erreur création commande:', error);
        this.submitting.set(false);
        this.errorMessage.set(this.resolveSubmitError(error));
      },
    });
  }

  private validateForm(): string {
    if (!this.isAuthenticated()) {
      if (!this.prenom.trim() || !this.nom.trim()) {
        return 'offerBooking.guestNameRequired';
      }
    }

    if (!this.phone.trim()) {
      return 'offerBooking.phoneRequired';
    }

    const quantite = this.resolveQuantite();
    if (quantite == null || quantite <= 0) {
      return 'offerBooking.quantiteRequired';
    }

    if (this.isReserve()) {
      const reservee = this.parseQuantity(this.quantiteReservee);
      if (reservee == null || reservee <= 0) {
        return 'offerBooking.quantiteReserveeRequired';
      }
      if (quantite > reservee) {
        return 'offerBooking.quantiteExceedsReserve';
      }
    }

    if (!this.description.trim()) {
      return 'offerBooking.descriptionRequired';
    }

    if (this.estimation() && !this.estimation()!.stockSufficient) {
      return 'offerBooking.insufficientStock';
    }

    return '';
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    const quantite = this.resolveQuantite()!;

    formData.append('offre_id', this.offer().id);
    formData.append('quantite', String(quantite));
    formData.append('description', this.description.trim());
    formData.append('telephone', this.phone.trim());

    if (this.isReserve()) {
      const reservee = this.parseQuantity(this.quantiteReservee);
      if (reservee != null && reservee > quantite) {
        formData.append('quantite_reservee', String(reservee));
      }
    }

    if (!this.isAuthenticated()) {
      formData.append('prenom', this.prenom.trim());
      formData.append('nom', this.nom.trim());
    }

    const photos = this.photos();
    photos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo, photo.name);
    });

    return formData;
  }

  private resolveQuantite(): number | null {
    if (this.isContainerOffer()) {
      return 1;
    }
    return this.parseQuantity(this.quantite);
  }

  private parseQuantity(value: string | number | null | undefined): number | null {
    if (value == null || value === '') {
      return null;
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const normalized = value.trim().replace(',', '.');
    if (!normalized) {
      return null;
    }
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private resolveSubmitError(error: HttpErrorResponse): string {
    if (error.status === 422) {
      const apiMessage = extractApiErrorMessage(error);
      return apiMessage ?? 'offerBooking.validationError';
    }
    if (error.status >= 500) {
      return 'offerBooking.serverError';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'offerBooking.error';
  }
}
