import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

export type LoginFormType = 'entreprise' | 'particulier';

@Component({
  selector: 'app-connexion',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {
  private readonly router = inject(Router);

  protected readonly formType = signal<LoginFormType>('entreprise');
  protected readonly showPassword = signal(false);

  protected email = '';
  protected password = '';

  protected setFormType(type: LoginFormType): void {
    this.formType.set(type);
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.formType() === 'particulier') {
      void this.router.navigate(['/espace-client/dashboard']);
      return;
    }

    void this.router.navigate(['/backoffice/tableau-de-bord']);
  }
}
