import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';

@Component({
  selector: 'app-profil-client',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './profil-client.html',
  styleUrl: './profil-client.css',
})
export class ProfilClient {
  private readonly clientSession = inject(ClientSessionService);

  protected firstName = this.clientSession.client().firstName;
  protected lastName = this.clientSession.client().lastName;
  protected email = this.clientSession.client().email;
  protected phone = this.clientSession.client().phone;
  protected address = this.clientSession.client().address;

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.clientSession.updateProfile({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      address: this.address,
    });
  }

  protected get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
}
