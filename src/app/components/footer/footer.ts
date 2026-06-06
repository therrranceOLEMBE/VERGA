import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe, LanguageSwitcher],
  templateUrl: './footer.html',
})
export class Footer {
  readonly showBackToTop = input(true);
  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
