import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { FAQ_ITEMS, FaqFilter, FaqItem } from '../../data/faq.content';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-faq',
  imports: [Header, Footer, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {
  private readonly language = inject(LanguageService);

  protected readonly search = signal('');
  protected readonly filter = signal<FaqFilter>('all');
  protected readonly openId = signal<string | null>(null);

  protected readonly filters: Array<{ value: FaqFilter; labelKey: string }> = [
    { value: 'all', labelKey: 'faq.filterAll' },
    { value: 'client', labelKey: 'faq.filterClient' },
    { value: 'agence', labelKey: 'faq.filterAgency' },
    { value: 'general', labelKey: 'faq.filterGeneral' },
  ];

  protected readonly visibleItems = computed(() => {
    this.language.lang();
    const query = this.search().trim().toLowerCase();
    const audience = this.filter();

    return FAQ_ITEMS.filter((item) => {
      if (audience !== 'all' && item.audience !== audience) {
        return false;
      }
      if (!query) {
        return true;
      }
      const q = this.questionOf(item).toLowerCase();
      const a = this.answerOf(item).toLowerCase();
      const c = this.categoryOf(item).toLowerCase();
      return q.includes(query) || a.includes(query) || c.includes(query);
    });
  });

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const count = this.visibleItems().length;
    return this.language.translate(count === 1 ? 'faq.resultsOne' : 'faq.resultsMany', {
      count,
    });
  });

  protected setFilter(value: FaqFilter): void {
    this.filter.set(value);
    this.openId.set(null);
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    this.openId.set(null);
  }

  protected toggle(id: string): void {
    this.openId.update((current) => (current === id ? null : id));
  }

  protected isOpen(id: string): boolean {
    return this.openId() === id;
  }

  protected questionOf(item: FaqItem): string {
    return item.question[this.language.lang()];
  }

  protected answerOf(item: FaqItem): string {
    return item.answer[this.language.lang()];
  }

  protected categoryOf(item: FaqItem): string {
    return item.category[this.language.lang()];
  }

  protected audienceLabelKey(item: FaqItem): string {
    if (item.audience === 'client') {
      return 'faq.badgeClient';
    }
    if (item.audience === 'agence') {
      return 'faq.badgeAgency';
    }
    return 'faq.badgeGeneral';
  }
}
