import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TypeOffreCreateRequest } from '../../models/type-offre.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceService } from '../../services/agence.service';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { slugifyTypeOffre } from '../../utils/type-offre.util';

@Component({
  selector: 'app-creer-type-offre',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './creer-type-offre.html',
  styleUrl: './creer-type-offre.css',
})
export class CreerTypeOffre {
  private readonly router = inject(Router);
  private readonly agenceSession = inject(AgenceSessionService);
  private readonly agenceService = inject(AgenceService);

  protected nom = '';
  protected slug = '';
  protected description = '';
  protected unite = '';
  protected uniteLabel = '';
  protected quantiteEntier = true;
  protected quantiteMin: number | null = 1;
  protected actif = true;
  protected slugTouched = false;

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly unauthenticated = signal(false);

  protected onNomChange(value: string): void {
    this.nom = value;
    if (!this.slugTouched) {
      this.slug = slugifyTypeOffre(value);
    }
  }

  protected onSlugChange(value: string): void {
    this.slugTouched = true;
    this.slug = slugifyTypeOffre(value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');

    const token = this.agenceSession.getToken();
    if (!token) {
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.createTypeOffre.authRequired');
      return;
    }

    if (!this.isFormValid()) {
      this.errorMessage.set('backoffice.createTypeOffre.validationError');
      return;
    }

    const payload: TypeOffreCreateRequest = {
      slug: this.slug.trim(),
      nom: this.nom.trim(),
      description: this.description.trim() || undefined,
      unite: this.unite.trim(),
      unite_label: this.uniteLabel.trim(),
      quantite_entier: this.quantiteEntier,
      quantite_min: Number(this.quantiteMin),
      actif: this.actif,
    };

    this.submitting.set(true);

    this.agenceService.createTypeOffre(token, payload).subscribe({
      next: () => {
        this.successMessage.set('backoffice.createTypeOffre.success');
        this.submitting.set(false);
        void this.router.navigate(['/backoffice/historique-types-offres']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.unauthenticated.set(true);
        }
        this.errorMessage.set(this.resolveCreateError(error));
        this.submitting.set(false);
      },
    });
  }

  private isFormValid(): boolean {
    return (
      !!this.nom.trim() &&
      !!this.slug.trim() &&
      !!this.unite.trim() &&
      !!this.uniteLabel.trim() &&
      this.quantiteMin != null &&
      this.quantiteMin > 0
    );
  }

  private resolveCreateError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.createTypeOffre.authRequired';
    }
    if (error.status === 422) {
      return extractApiErrorMessage(error) ?? 'backoffice.createTypeOffre.validationError';
    }
    return extractApiErrorMessage(error) ?? 'backoffice.createTypeOffre.error';
  }
}
