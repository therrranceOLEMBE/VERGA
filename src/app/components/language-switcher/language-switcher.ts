import { Component, HostListener, inject, signal } from '@angular/core';
import { Language } from '../../i18n/translations';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe],
  templateUrl: './language-switcher.html',
})
export class LanguageSwitcher {
  protected readonly language = inject(LanguageService);

  protected readonly open = signal(false);

  protected readonly options: { code: Language; flag: string; labelKey: string }[] = [
    { code: 'fr', flag: '🇫🇷', labelKey: 'lang.fr' },
    { code: 'en', flag: '🇬🇧', labelKey: 'lang.en' },
  ];

  protected currentFlag(): string {
    return this.language.lang() === 'fr' ? '🇫🇷' : '🇬🇧';
  }

  protected toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  protected select(lang: Language, event: Event): void {
    event.stopPropagation();
    this.language.setLanguage(lang);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected closeOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-lang-root]')) {
      this.open.set(false);
    }
  }
}
