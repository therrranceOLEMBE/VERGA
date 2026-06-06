import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-connexion',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly showPassword = signal(false);

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void this.router.navigate(['/backoffice/tableau-de-bord']);
  }
}
