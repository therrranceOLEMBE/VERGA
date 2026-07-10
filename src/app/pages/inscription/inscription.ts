import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TypeAgence } from '../../models/type-agence.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { AgenceService } from '../../services/agence.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
import { TransactionService } from '../../services/transaction.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';

export type SignupFormType = 'entreprise' | 'particulier';
export type CompanySignupStep = 1 | 2;

@Component({
  selector: 'app-inscription',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css',
})
export class Inscription implements OnInit {
  private readonly router = inject(Router);
  private readonly clientSession = inject(ClientSessionService);
  private readonly agenceSession = inject(AgenceSessionService);
  private readonly transactionService = inject(TransactionService);
  private readonly particulierService = inject(ParticulierService);
  private readonly agenceService = inject(AgenceService);

  protected readonly formType = signal<SignupFormType>('entreprise');
  protected readonly companyStep = signal<CompanySignupStep>(1);
  protected readonly showPassword = signal(false);
  protected readonly showPasswordConfirm = signal(false);
  protected readonly submitting = signal(false);
  protected readonly loadingTypeAgences = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly typeAgenceOptions = signal<TypeAgence[]>([]);

  protected companyName = '';
  protected email = '';
  protected phone = '';
  protected address = '';
  protected city = '';
  protected country = 'Gabon';
  protected typeAgenceId = '';
  protected gerantName = '';
  protected gerantEmail = '';
  protected password = '';
  protected passwordConfirmation = '';

  protected firstName = '';
  protected lastName = '';

  ngOnInit(): void {
    this.loadTypeAgences();
  }

  protected setFormType(type: SignupFormType): void {
    this.formType.set(type);
    this.companyStep.set(1);
    this.errorMessage.set('');
    if (type === 'entreprise') {
      this.loadTypeAgences();
    }
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected togglePasswordConfirm(): void {
    this.showPasswordConfirm.update((visible) => !visible);
  }

  protected previousCompanyStep(): void {
    this.companyStep.set(1);
    this.errorMessage.set('');
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');

    if (this.formType() === 'entreprise') {
      if (this.companyStep() === 1) {
        this.goToManagerStep();
        return;
      }
      this.registerEntreprise();
      return;
    }

    this.registerParticulier();
  }

  private goToManagerStep(): void {
    if (!this.isCompanyStepValid()) {
      this.errorMessage.set('auth.signup.companyStepError');
      return;
    }
    this.companyStep.set(2);
  }

  private isCompanyStepValid(): boolean {
    return (
      !!this.companyName.trim() &&
      !!this.email.trim() &&
      !!this.phone.trim() &&
      !!this.typeAgenceId &&
      !!this.city.trim() &&
      !!this.address.trim() &&
      !!this.country.trim()
    );
  }

  private registerEntreprise(): void {
    if (this.password !== this.passwordConfirmation) {
      this.errorMessage.set('auth.signup.passwordMismatch');
      return;
    }

    this.submitting.set(true);

    this.agenceService
      .register({
        nom: this.companyName.trim(),
        email: this.email.trim(),
        telephone: this.phone.trim(),
        type_agence_id: this.typeAgenceId,
        ville: this.city.trim(),
        adresse: this.address.trim(),
        pays: this.country.trim(),
        gerant_name: this.gerantName.trim(),
        gerant_email: this.gerantEmail.trim(),
        password: this.password,
        password_confirmation: this.passwordConfirmation,
        device_name: 'angular-backoffice',
      })
      .subscribe({
        next: (response) => {
          this.agenceSession.setSession(response.token);
          void this.router.navigate(['/backoffice/tableau-de-bord']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.resolveRegisterError(error));
          this.submitting.set(false);
        },
        complete: () => {
          this.submitting.set(false);
        },
      });
  }

  private registerParticulier(): void {
    const prenom = this.firstName.trim();
    const nom = this.lastName.trim();
    const email = this.email.trim();
    const telephone = this.phone.trim();
    const adresse = this.address.trim();
    const ville = this.city.trim();
    const pays = this.country.trim();

    if (this.password !== this.passwordConfirmation) {
      this.errorMessage.set('auth.signup.passwordMismatch');
      return;
    }

    this.submitting.set(true);

    this.particulierService
      .register({
        nom,
        prenom,
        email,
        password: this.password,
        password_confirmation: this.passwordConfirmation,
        telephone,
        adresse,
        ville,
        pays,
        type: 'particulier',
        device_name: 'verga-web',
      })
      .subscribe({
        next: (response) => {
          this.clientSession.setSession(response.token, {
            firstName: prenom,
            lastName: nom,
            email,
            phone: telephone,
            address: adresse,
            city: ville,
            country: pays,
          });
          this.transactionService.ensureClientDemoData({
            name: `${prenom} ${nom}`.trim(),
            email,
            phone: telephone,
          });
          void this.router.navigate(['/accueil'], { replaceUrl: true });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.resolveRegisterError(error));
          this.submitting.set(false);
        },
        complete: () => {
          this.submitting.set(false);
        },
      });
  }

  private loadTypeAgences(): void {
    if (this.loadingTypeAgences()) {
      return;
    }

    this.loadingTypeAgences.set(true);
    this.agenceService.getTypeAgences().subscribe({
      next: (options) => {
        this.typeAgenceOptions.set(options);
        this.loadingTypeAgences.set(false);
      },
      error: () => {
        this.typeAgenceOptions.set([]);
        this.loadingTypeAgences.set(false);
      },
    });
  }

  private resolveRegisterError(error: HttpErrorResponse): string {
    if (error.status === 429) {
      return 'auth.signup.tooManyAttempts';
    }

    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'auth.signup.error';
  }
}
