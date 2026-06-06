import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-mot-de-passe',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './mot-de-passe.html',
  styleUrl: './mot-de-passe.css',
})
export class MotDePasse {
  protected currentPassword = '';
  protected newPassword = '';
  protected confirmPassword = '';
  protected readonly showCurrent = signal(false);
  protected readonly showNew = signal(false);
  protected readonly showConfirm = signal(false);

  protected toggleCurrent(): void {
    this.showCurrent.update((v) => !v);
  }

  protected toggleNew(): void {
    this.showNew.update((v) => !v);
  }

  protected toggleConfirm(): void {
    this.showConfirm.update((v) => !v);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
  }
}
