import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-creer-collaborateur',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './creer-collaborateur.html',
  styleUrl: './creer-collaborateur.css',
})
export class CreerCollaborateur {
  protected firstName = '';
  protected lastName = '';
  protected email = '';
  protected phone = '';
  protected readonly role = 'support';
  protected password = '';
  protected confirmPassword = '';
  protected readonly showPassword = signal(false);
  protected readonly showConfirm = signal(false);

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected toggleConfirm(): void {
    this.showConfirm.update((v) => !v);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
  }
}
