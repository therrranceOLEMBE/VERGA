import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';
import { TransactionService } from '../../services/transaction.service';

export type SignupFormType = 'entreprise' | 'particulier';
export type CompanyScope = 'international' | 'regional';

@Component({
  selector: 'app-inscription',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css',
})
export class Inscription {
  private readonly router = inject(Router);
  private readonly clientSession = inject(ClientSessionService);
  private readonly transactionService = inject(TransactionService);

  protected readonly formType = signal<SignupFormType>('entreprise');
  protected readonly showPassword = signal(false);

  protected companyScope: CompanyScope = 'international';
  protected companyName = '';
  protected firstName = '';
  protected lastName = '';
  protected email = '';
  protected phone = '';
  protected address = '';
  protected password = '';

  protected readonly companyScopeOptions: { value: CompanyScope; labelKey: string }[] = [
    { value: 'international', labelKey: 'auth.accountType.international' },
    { value: 'regional', labelKey: 'auth.accountType.regional' },
  ];

  protected setFormType(type: SignupFormType): void {
    this.formType.set(type);
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.formType() === 'particulier') {
      const firstName = this.firstName.trim();
      const lastName = this.lastName.trim();
      const email = this.email.trim();
      const phone = this.phone.trim();

      this.clientSession.updateProfile({ firstName, lastName, email, phone });
      this.transactionService.ensureClientDemoData({
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
      });
      void this.router.navigate(['/espace-client/dashboard']);
    }
  }
}
