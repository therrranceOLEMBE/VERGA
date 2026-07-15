import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgenceRegisterDocument } from '../../models/agence-register.model';
import { ClientRegisterDocument } from '../../models/client-register.model';
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

interface DocumentEntry {
  fichier: File;
  type_document: string;
  preview: string | null;
}

const LOGO_MAX_SIZE = 5 * 1024 * 1024;
const DOC_MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_DOC_TYPES = [...ACCEPTED_IMAGE_TYPES, 'application/pdf'];

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

  protected readonly logoFile = signal<File | null>(null);
  protected readonly logoPreview = signal<string | null>(null);
  protected readonly documents = signal<DocumentEntry[]>([]);

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
    this.documents.set([]);
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

  /* ── Logo ── */

  protected onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      this.errorMessage.set('auth.signup.logoInvalidType');
      input.value = '';
      return;
    }
    if (file.size > LOGO_MAX_SIZE) {
      this.errorMessage.set('auth.signup.logoTooLarge');
      input.value = '';
      return;
    }

    this.errorMessage.set('');
    this.logoFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.logoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  protected removeLogo(): void {
    this.logoFile.set(null);
    this.logoPreview.set(null);
  }

  /* ── Documents ── */

  protected onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!ACCEPTED_DOC_TYPES.includes(file.type)) {
      this.errorMessage.set('auth.signup.docInvalidType');
      input.value = '';
      return;
    }
    if (file.size > DOC_MAX_SIZE) {
      this.errorMessage.set('auth.signup.docTooLarge');
      input.value = '';
      return;
    }

    this.errorMessage.set('');

    let preview: string | null = null;
    const entry: DocumentEntry = { fichier: file, type_document: '', preview };

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        entry.preview = reader.result as string;
        this.documents.update((docs) => [...docs]);
      };
      reader.readAsDataURL(file);
    }

    this.documents.update((docs) => [...docs, entry]);
    input.value = '';
  }

  protected updateDocumentType(index: number, type: string): void {
    this.documents.update((docs) => {
      const copy = [...docs];
      if (copy[index]) {
        copy[index] = { ...copy[index], type_document: type };
      }
      return copy;
    });
  }

  protected removeDocument(index: number): void {
    this.documents.update((docs) => docs.filter((_, i) => i !== index));
  }

  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  /* ── Submit ── */

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
      !!this.typeAgenceId
    );
  }

  private registerEntreprise(): void {
    if (this.password !== this.passwordConfirmation) {
      this.errorMessage.set('auth.signup.passwordMismatch');
      return;
    }

    const docs = this.documents();
    const invalidDocs = docs.filter((d) => !d.type_document.trim());
    if (invalidDocs.length > 0) {
      this.errorMessage.set('auth.signup.docMissingType');
      return;
    }

    this.submitting.set(true);

    const apiDocs: AgenceRegisterDocument[] = docs.map((d) => ({
      fichier: d.fichier,
      type_document: d.type_document.trim(),
    }));

    this.agenceService
      .register(
        {
          nom: this.companyName.trim(),
          email: this.email.trim(),
          telephone: this.phone.trim(),
          type_agence_id: this.typeAgenceId || undefined,
          ville: this.city.trim() || undefined,
          adresse: this.address.trim() || undefined,
          pays: this.country.trim() || undefined,
          gerant_name: this.gerantName.trim(),
          gerant_email: this.gerantEmail.trim(),
          password: this.password,
          password_confirmation: this.passwordConfirmation,
          device_name: 'angular-backoffice',
        },
        this.logoFile(),
        apiDocs.length > 0 ? apiDocs : undefined,
      )
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

    const docs = this.documents();
    const invalidDocs = docs.filter((d) => !d.type_document.trim());
    if (invalidDocs.length > 0) {
      this.errorMessage.set('auth.signup.docMissingType');
      return;
    }

    this.submitting.set(true);

    const apiDocs: ClientRegisterDocument[] = docs.map((d) => ({
      fichier: d.fichier,
      type_document: d.type_document.trim(),
    }));

    this.particulierService
      .register(
        {
          nom,
          prenom,
          email,
          password: this.password,
          password_confirmation: this.passwordConfirmation,
          telephone,
          adresse: adresse || undefined,
          ville: ville || undefined,
          pays: pays || undefined,
          type: 'particulier',
          device_name: 'verga-web',
        },
        apiDocs.length > 0 ? apiDocs : undefined,
      )
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
