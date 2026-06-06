import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(key: string, params?: Record<string, string | number>): string {
    this.language.lang();
    return this.language.translate(key, params);
  }
}
