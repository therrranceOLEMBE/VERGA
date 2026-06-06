import { Injectable, signal } from '@angular/core';
import {
  LANG_STORAGE_KEY,
  Language,
  translations,
} from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly lang = signal<Language>(this.readStoredLanguage());

  translate(key: string, params?: Record<string, string | number>): string {
    const dict = translations[this.lang()];
    let text = dict[key] ?? translations.fr[key] ?? key;

    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{{${name}}}`, String(value));
      }
    }

    return text;
  }

  setLanguage(lang: Language): void {
    this.lang.set(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }

  private readStoredLanguage(): Language {
    if (typeof localStorage === 'undefined') {
      return 'fr';
    }
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    return stored === 'en' ? 'en' : 'fr';
  }
}
