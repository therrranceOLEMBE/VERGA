import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { AgenceDestination } from '../../models/agence-destination.model';
import { AgenceOffreCreateRequest } from '../../models/agence-offre-create.model';
import { AgenceOffreStatut } from '../../models/agence-offre.model';
import { TypeOffre } from '../../models/type-offre.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { findMatchingDestination } from '../../utils/agence-destination.util';

type DestinationMode = 'catalog' | 'custom';

@Component({
  selector: 'app-creer-offre',
  imports: [FormsModule, RouterLink, TranslatePipe, DecimalPipe],
  templateUrl: './creer-offre.html',
  styleUrl: './creer-offre.css',
})
export class CreerOffre implements OnInit {
  private readonly router = inject(Router);
  private readonly agenceSession = inject(AgenceSessionService);

  protected titre = '';
  protected typeOffreId = '';
  protected type = '';
  protected prix: number | null = null;
  protected capaciteIllimitee = false;
  protected capaciteTotale: number | null = null;
  protected destinationMode: DestinationMode = 'catalog';
  protected destinationId = '';
  protected customDepart = '';
  protected customArrivee = '';
  protected dateDepart = '';
  protected dateDepotColis = '';
  protected description = '';
  protected statut: AgenceOffreStatut = 'active';

  protected readonly loadingTypeOffres = signal(false);
  protected readonly loadingDestinations = signal(false);
  protected readonly typeOffreOptions = signal<TypeOffre[]>([]);
  protected readonly destinations = signal<AgenceDestination[]>([]);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly duplicateCorridorOpen = signal(false);
  protected readonly duplicateCorridorLabel = signal('');

  protected readonly statutOptions: Array<{ value: AgenceOffreStatut; labelKey: string }> = [
    { value: 'active', labelKey: 'backoffice.offerHistory.status.active' },
    { value: 'inactive', labelKey: 'backoffice.offerHistory.status.inactive' },
  ];

  ngOnInit(): void {
    this.loadTypeOffres();
    this.loadDestinations();
  }

  protected selectedDestination(): AgenceDestination | null {
    return this.destinations().find((destination) => destination.id === this.destinationId) ?? null;
  }

  protected isPriceLocked(): boolean {
    return this.destinationMode === 'catalog' && this.selectedDestination() != null;
  }

  protected onTypeOffreChange(): void {
    const selected = this.typeOffreOptions().find((option) => option.id === this.typeOffreId);
    this.type = selected?.code ?? '';
  }

  protected onDestinationModeChange(mode: DestinationMode): void {
    this.destinationMode = mode;
    this.errorMessage.set('');

    if (mode === 'catalog') {
      this.customDepart = '';
      this.customArrivee = '';
      this.applyCatalogPrice();
      return;
    }

    this.destinationId = '';
    this.prix = null;
  }

  protected onCatalogDestinationChange(): void {
    this.applyCatalogPrice();
  }

  protected onCapaciteIllimiteeChange(value: boolean): void {
    this.capaciteIllimitee = value;
    if (value) {
      this.capaciteTotale = null;
    }
  }

  protected closeDuplicateCorridorModal(): void {
    this.duplicateCorridorOpen.set(false);
  }

  protected useMatchedCatalogDestination(): void {
    const matched = findMatchingDestination(
      this.destinations(),
      this.customDepart,
      this.customArrivee,
    );
    if (!matched) {
      this.closeDuplicateCorridorModal();
      return;
    }

    this.destinationMode = 'catalog';
    this.destinationId = matched.id;
    this.customDepart = '';
    this.customArrivee = '';
    this.applyCatalogPrice();
    this.closeDuplicateCorridorModal();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.agenceSession.isAuthenticated()) {
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.createOffer.authRequired');
      return;
    }

    if (!this.isFormValid()) {
      this.errorMessage.set('backoffice.createOffer.validationError');
      return;
    }

    if (this.destinationMode === 'custom') {
      const matched = findMatchingDestination(
        this.destinations(),
        this.customDepart,
        this.customArrivee,
      );
      if (matched) {
        this.duplicateCorridorLabel.set(matched.label);
        this.duplicateCorridorOpen.set(true);
        return;
      }
    }

    const selectedType = this.typeOffreOptions().find((option) => option.id === this.typeOffreId);
    const basePayload = {
      titre: this.titre.trim(),
      type_offre_id: this.typeOffreId,
      type: (selectedType?.code ?? this.type).trim(),
      prix: Number(this.prix),
      capacite_illimitee: this.capaciteIllimitee,
      capacite_totale: this.capaciteIllimitee ? null : Number(this.capaciteTotale),
      date_depart: this.dateDepart.trim(),
      date_depot_colis: this.dateDepotColis.trim() || null,
      description: this.description.trim(),
      statut: this.statut,
    };

    this.submitting.set(true);

    if (this.destinationMode === 'catalog') {
      this.publishOffer({
        ...basePayload,
        destination_id: this.destinationId,
      });
      return;
    }

    this.agenceSession
      .createDestination({
        depart: this.customDepart.trim(),
        arrivee: this.customArrivee.trim(),
        montant: Number(this.prix),
      })
      .pipe(
        switchMap((destinationId) =>
          this.agenceSession.createOffre({
            ...basePayload,
            destination_id: destinationId,
          }),
        ),
      )
      .subscribe({
        next: () => this.onCreateSuccess(),
        error: (error: HttpErrorResponse | Error) => this.onCreateError(error),
      });
  }

  protected loadTypeOffres(): void {
    if (this.loadingTypeOffres()) {
      return;
    }

    if (!this.agenceSession.isAuthenticated()) {
      this.typeOffreOptions.set([]);
      this.unauthenticated.set(true);
      return;
    }

    this.loadingTypeOffres.set(true);
    this.agenceSession.loadTypeOffres().subscribe({
      next: (options) => {
        this.typeOffreOptions.set(options);
        this.loadingTypeOffres.set(false);
      },
      error: () => {
        this.typeOffreOptions.set([]);
        this.loadingTypeOffres.set(false);
      },
    });
  }

  protected loadDestinations(): void {
    if (this.loadingDestinations()) {
      return;
    }

    if (!this.agenceSession.isAuthenticated()) {
      this.destinations.set([]);
      this.unauthenticated.set(true);
      return;
    }

    this.loadingDestinations.set(true);
    this.agenceSession.loadDestinations().subscribe({
      next: (destinations) => {
        this.destinations.set(destinations);
        this.loadingDestinations.set(false);
        this.applyCatalogPrice();
      },
      error: () => {
        this.destinations.set([]);
        this.loadingDestinations.set(false);
      },
    });
  }

  private publishOffer(payload: AgenceOffreCreateRequest): void {
    this.agenceSession.createOffre(payload).subscribe({
      next: () => this.onCreateSuccess(),
      error: (error: HttpErrorResponse | Error) => this.onCreateError(error),
    });
  }

  private onCreateSuccess(): void {
    this.successMessage.set('backoffice.createOffer.success');
    this.submitting.set(false);
    void this.router.navigate(['/backoffice/historique-offres']);
  }

  private onCreateError(error: HttpErrorResponse | Error): void {
    if (error instanceof Error && error.message === 'No agence token') {
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.createOffer.authRequired');
    } else if (error instanceof Error && error.message === 'Destination créée sans identifiant') {
      this.errorMessage.set('backoffice.createOffer.destinationCreateError');
    } else {
      this.errorMessage.set(this.resolveCreateError(error as HttpErrorResponse));
    }
    this.submitting.set(false);
  }

  private applyCatalogPrice(): void {
    if (this.destinationMode !== 'catalog') {
      return;
    }
    const selected = this.selectedDestination();
    this.prix = selected ? selected.montant : null;
  }

  private isFormValid(): boolean {
    const commonValid =
      !!this.titre.trim() &&
      !!this.typeOffreId &&
      !!this.type.trim() &&
      this.prix != null &&
      this.prix > 0 &&
      (this.capaciteIllimitee ||
        (this.capaciteTotale != null && this.capaciteTotale > 0)) &&
      !!this.dateDepart.trim() &&
      !!this.description.trim();

    if (!commonValid) {
      return false;
    }

    if (this.destinationMode === 'catalog') {
      return !!this.destinationId;
    }

    return !!this.customDepart.trim() && !!this.customArrivee.trim();
  }

  private resolveCreateError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.createOffer.authRequired';
    }
    if (error.status === 422) {
      const apiMessage = extractApiErrorMessage(error);
      return apiMessage ?? 'backoffice.createOffer.validationError';
    }
    if (error.status === 404 || error.status === 405) {
      return 'backoffice.createOffer.destinationCreateError';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.createOffer.error';
  }
}
