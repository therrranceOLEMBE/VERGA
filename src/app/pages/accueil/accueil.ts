import { afterNextRender, Component, computed, HostListener, inject, signal } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { OfferCard } from '../../components/offer-card/offer-card';
import { OfferFiltersService } from '../../services/offer-filters.service';
import { LanguageService } from '../../services/language.service';
import { OfferService } from '../../services/offer.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-accueil',
  imports: [Header, Footer, OfferCard, TranslatePipe],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil {
  private readonly filtersService = inject(OfferFiltersService);
  private readonly language = inject(LanguageService);
  private readonly offerService = inject(OfferService);

  protected readonly showScrollTop = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 28;
  protected readonly totalResults = 306;
  protected readonly totalPages = 11;

  constructor() {
    afterNextRender(() => this.updateScrollTopVisibility());
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.updateScrollTopVisibility();
  }

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages }, (_, i) => i + 1),
  );

  protected readonly displayedOffers = computed(() => {
    this.language.lang();
    const f = this.filtersService.filters();
    let list = [...this.offerService.getAll()];

    if (f.verifiedOnly) {
      list = list.filter((o) => o.verified);
    }
    if (f.location) {
      const q = f.location.toLowerCase();
      list = list.filter((o) => o.location.toLowerCase().includes(q));
    }
    if (f.category) {
      const map: Record<string, string[]> = {
        maritime: ['Festival', 'Fret maritime'],
        aerien: ['Concert', 'Fret aérien'],
        routier: ['Soirée', 'Transport routier'],
        entreposage: ['Logistique & entreposage'],
      };
      const allowed = map[f.category] ?? [];
      if (allowed.length) {
        list = list.filter((o) => allowed.some((c) => o.category.toLowerCase().includes(c.toLowerCase())));
      }
    }

    return list.length > 0 ? list : this.offerService.getAll().slice(0, 4);
  });

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage() * this.pageSize, this.totalResults);
    return this.language.translate('home.results', {
      start,
      end,
      total: this.totalResults,
    });
  });

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateScrollTopVisibility(): void {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - viewportHeight;
    const midPageThreshold = viewportHeight * 0.5;

    const visible =
      scrollY >= midPageThreshold ||
      (maxScroll > 0 && scrollY >= maxScroll * 0.5);

    this.showScrollTop.set(visible);
  }
}
