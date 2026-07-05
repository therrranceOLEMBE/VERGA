import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TypeOffre } from '../../models/type-offre.model';
import { AgenceOffreCreateRequest } from '../../models/agence-offre-create.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceService } from '../../services/agence.service';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';

@Component({
  selector: 'app-creer-offre',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './creer-offre.html',
  styleUrl: './creer-offre.css',
})
export class CreerOffre implements OnInit {
  private readonly router = inject(Router);
  private readonly agenceSession = inject(AgenceSessionService);
  private readonly agenceService = inject(AgenceService);

  protected titre = '';
  protected typeOffreId = '';
  protected type = '';
  protected prix: number | null = null;
  protected capaciteTotale: number | null = null;
  protected origine = '';
  protected destination = '';
  protected description = '';

  protected readonly loadingTypeOffres = signal(false);
  protected readonly typeOffreOptions = signal<TypeOffre[]>([]);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly unauthenticated = signal(false);

  ngOnInit(): void {
    this.loadTypeOffres();
  }

  protected onTypeOffreChange(): void {
    const selected = this.typeOffreOptions().find((option) => option.id === this.typeOffreId);
    this.type = selected?.code ?? '';
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

    const selected = this.typeOffreOptions().find((option) => option.id === this.typeOffreId);
    const payload: AgenceOffreCreateRequest = {
      titre: this.titre.trim(),
      type_offre_id: this.typeOffreId,
      type: (selected?.code ?? this.type).trim(),
      prix: Number(this.prix),
      capacite_totale: Number(this.capaciteTotale),
      origine: this.origine.trim(),
      destination: this.destination.trim(),
      description: this.description.trim(),
      statut: 'active',
    };

    this.submitting.set(true);

    this.agenceSession.createOffre(payload).subscribe({
      next: () => {
        this.successMessage.set('backoffice.createOffer.success');
        this.submitting.set(false);
        void this.router.navigate(['/backoffice/historique-offres']);
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.unauthenticated.set(true);
          this.errorMessage.set('backoffice.createOffer.authRequired');
        } else {
          this.errorMessage.set(this.resolveCreateError(error as HttpErrorResponse));
        }
        this.submitting.set(false);
      },
    });
  }

  private loadTypeOffres(): void {
    if (this.loadingTypeOffres()) {
      return;
    }

    this.loadingTypeOffres.set(true);
    this.agenceService.getTypeOffres().subscribe({
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

  private isFormValid(): boolean {
    return (
      !!this.titre.trim() &&
      !!this.typeOffreId &&
      !!this.type.trim() &&
      this.prix != null &&
      this.prix > 0 &&
      this.capaciteTotale != null &&
      this.capaciteTotale > 0 &&
      !!this.origine.trim() &&
      !!this.destination.trim() &&
      !!this.description.trim()
    );
  }

  private resolveCreateError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.createOffer.authRequired';
    }
    if (error.status === 422) {
      const apiMessage = extractApiErrorMessage(error);
      return apiMessage ?? 'backoffice.createOffer.validationError';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.createOffer.error';
  }
}
