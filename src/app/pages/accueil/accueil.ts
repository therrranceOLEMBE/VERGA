import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { OfferCard } from '../../components/offer-card/offer-card';
import { Offer } from '../../models/offer.model';
import { OfferDestinationRoute } from '../../models/offer.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientOfferCatalogService } from '../../services/client-offre-catalog.service';
import { OfferFiltersService } from '../../services/offer-filters.service';
import { LanguageService } from '../../services/language.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import {
  buildClientOffresQueryFromFilters,
  OFFER_DESTINATION_FILTERS,
} from '../../utils/client-offre-filters.util';

interface DestinationFilter {
  value: '' | OfferDestinationRoute;
  labelKey: string;
  icon: 'all' | 'route';
}

@Component({
  selector: 'app-accueil',
  imports: [Header, Footer, OfferCard, TranslatePipe, RouterLink],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil {
  private readonly filtersService = inject(OfferFiltersService);
  private readonly language = inject(LanguageService);
  private readonly catalogService = inject(ClientOfferCatalogService);

  private readonly destinationScroll = viewChild<ElementRef<HTMLElement>>('destinationScroll');

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly showScrollTop = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 15;

  protected readonly offers = signal<Offer[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);

  private activeFilterKey = '';

  protected readonly destinationFilters: DestinationFilter[] = OFFER_DESTINATION_FILTERS.map(
    (dest) => ({
      ...dest,
      icon: dest.value ? ('route' as const) : ('all' as const),
    }),
  );

  constructor() {
    afterNextRender(() => this.updateScrollTopVisibility());

    effect(() => {
      const page = this.currentPage();
      const filterKey = JSON.stringify(this.filtersService.filters());
      untracked(() => {
        const filtersChanged =
          this.activeFilterKey !== '' && filterKey !== this.activeFilterKey;

        if (filtersChanged && page !== 1) {
          this.activeFilterKey = filterKey;
          this.currentPage.set(1);
          return;
        }

        this.activeFilterKey = filterKey;
        this.loadOffers(page);
      });
    });
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.updateScrollTopVisibility();
  }

  protected readonly selectedDestination = computed(
    () => this.filtersService.filters().destinationRoute,
  );

  protected readonly selectedDestinationLabelKey = computed(() => {
    const value = this.selectedDestination();
    const match = this.destinationFilters.find((dest) => dest.value === value);
    return match?.labelKey ?? 'home.destination.all';
  });

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.totalItems();
    if (total === 0) {
      return this.language.translate('home.noResults');
    }
    return this.language.translate('home.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected selectDestination(value: '' | OfferDestinationRoute): void {
    this.filtersService.patch({ destinationRoute: value });
  }

  protected scrollDestinations(direction: 'left' | 'right'): void {
    const el = this.destinationScroll()?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction === 'right' ? 220 : -220, behavior: 'smooth' });
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
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

  private loadOffers(page = this.currentPage()): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.catalogService
      .loadOffres(buildClientOffresQueryFromFilters(this.filtersService.filters(), page, this.pageSize))
      .subscribe({
      next: (result) => {
        this.offers.set(result.items);
        this.currentPage.set(result.currentPage);
        this.totalPages.set(result.lastPage);
        this.totalItems.set(result.total);
        this.resultsFrom.set(result.from);
        this.resultsTo.set(result.to);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.offers.set([]);
        this.totalItems.set(0);
        this.totalPages.set(1);
        this.resultsFrom.set(0);
        this.resultsTo.set(0);
        this.errorMessage.set(this.resolveLoadError(error));
        this.loading.set(false);
      },
    });
  }

  private resolveLoadError(error: HttpErrorResponse): string {
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'home.loadError';
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
