import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-profil',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {
  protected companyName = 'Transit Express CI';
  protected accountType = 'international';
  protected email = 'contact@transit-express.ci';
  protected phone = '+225 07 10 28 99 04';
  protected address = "Cité SYNATRESOR, Abatta Cocody, Abidjan";
  protected description = 'Agence de transit et logistique spécialisée dans le fret international.';

  protected onSubmit(event: Event): void {
    event.preventDefault();
  }
}
