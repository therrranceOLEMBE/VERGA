import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';

@Component({
  selector: 'app-profil-client',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './profil-client.html',
  styleUrl: './profil-client.css',
})
export class ProfilClient implements OnInit {
  private readonly clientSession = inject(ClientSessionService);

  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly profile = computed(() => this.clientSession.client());

  protected firstName = '';
  protected lastName = '';
  protected email = '';
  protected phone = '';
  protected address = '';
  protected city = '';
  protected country = '';
  protected accountType = '';

  ngOnInit(): void {
    this.clientSession.loadProfile().subscribe({
      next: () => {
        this.syncFormFromSession();
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('clientBackoffice.profile.loadError');
        this.syncFormFromSession();
        this.loading.set(false);
      },
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.submitting.set(true);

    const payload = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      city: this.city.trim(),
      country: this.country.trim(),
      accountType: this.accountType,
    };

    this.clientSession.saveProfile(payload).subscribe({
      next: () => {
        this.syncFormFromSession();
        this.successMessage.set('clientBackoffice.profile.saveSuccess');
        this.submitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.resolveSaveError(error));
        this.submitting.set(false);
      },
    });
  }

  protected get initials(): string {
    const profile = this.profile();
    const first = profile.firstName.charAt(0);
    const last = profile.lastName.charAt(0);
    return `${first}${last}`.toUpperCase() || '?';
  }

  protected get displayName(): string {
    const { firstName, lastName } = this.profile();
    return `${firstName} ${lastName}`.trim();
  }

  protected get displayAccountType(): string {
    return this.profile().accountType;
  }

  private syncFormFromSession(): void {
    const profile = this.clientSession.client();
    this.firstName = profile.firstName;
    this.lastName = profile.lastName;
    this.email = profile.email;
    this.phone = profile.phone;
    this.address = profile.address;
    this.city = profile.city;
    this.country = profile.country;
    this.accountType = profile.accountType;
  }

  private resolveSaveError(error: HttpErrorResponse): string {
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }
    if (error.status === 422) {
      return 'clientBackoffice.profile.saveValidationError';
    }
    return 'clientBackoffice.profile.saveError';
  }
}
