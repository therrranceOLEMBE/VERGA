import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';
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
  iconUrl: string;
}

interface HeroSlide {
  imageUrl: string;
  imageAltKey: string;
  captionKey: string;
}

interface FlagDestination {
  code: string;
  labelKey: string;
}

@Component({
  selector: 'app-accueil',
  imports: [Header, Footer, OfferCard, TranslatePipe, RouterLink],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil implements OnInit {
  private readonly filtersService = inject(OfferFiltersService);
  private readonly language = inject(LanguageService);
  private readonly catalogService = inject(ClientOfferCatalogService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly destinationScroll = viewChild<ElementRef<HTMLElement>>('destinationScroll');

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly showScrollTop = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 15;
  protected readonly activeSlide = signal(0);
  protected readonly sliderPaused = signal(false);

  protected readonly offers = signal<Offer[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);

  private activeFilterKey = '';

  /** Images Unsplash — fret maritime, aérien, conteneurs, entrepôts */
  protected readonly heroSlides: HeroSlide[] = [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1920&q=80',
      imageAltKey: 'home.slider.altShip',
      captionKey: 'home.slider.captionShip',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
      imageAltKey: 'home.slider.altContainers',
      captionKey: 'home.slider.captionContainers',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80',
      imageAltKey: 'home.slider.altAir',
      captionKey: 'home.slider.captionAir',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1920&q=80',
      imageAltKey: 'home.slider.altPort',
      captionKey: 'home.slider.captionPort',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1920&q=80',
      imageAltKey: 'home.slider.altWarehouse',
      captionKey: 'home.slider.captionWarehouse',
    },
  ];

  protected readonly destinationFilters: DestinationFilter[] = OFFER_DESTINATION_FILTERS.map(
    (dest) => ({
      ...dest,
      iconUrl: this.destinationIconUrl(dest.value),
    }),
  );

  /** Destinations affichées en bandeau défilant (style marketplace internationale). */
  protected readonly flagDestinations: FlagDestination[] = [
    { code: 'ga', labelKey: 'home.flags.gabon' },
    { code: 'cn', labelKey: 'home.flags.china' },
    { code: 'fr', labelKey: 'home.flags.france' },
    { code: 'sn', labelKey: 'home.flags.senegal' },
    { code: 'ma', labelKey: 'home.flags.morocco' },
    { code: 'us', labelKey: 'home.flags.usa' },
    { code: 'ca', labelKey: 'home.flags.canada' },
    { code: 'bf', labelKey: 'home.flags.burkina' },
    { code: 'ci', labelKey: 'home.flags.ivoryCoast' },
    { code: 'cm', labelKey: 'home.flags.cameroon' },
    { code: 'cg', labelKey: 'home.flags.congo' },
    { code: 'be', labelKey: 'home.flags.belgium' },
    { code: 'de', labelKey: 'home.flags.germany' },
    { code: 'gb', labelKey: 'home.flags.uk' },
    { code: 'ae', labelKey: 'home.flags.uae' },
    { code: 'tr', labelKey: 'home.flags.turkey' },
  ];

  protected flagImageUrl(code: string): string {
    return `https://flagcdn.com/w80/${code}.png`;
  }

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

  ngOnInit(): void {
    interval(6000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.sliderPaused()) {
          this.nextSlide();
        }
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

  private destinationIconUrl(value: '' | OfferDestinationRoute): string {
    const base = '/icons/destinations';
    switch (value) {
      case '':
        return `${base}/all.svg`;
      case 'gabon-chine':
        return `${base}/ship.svg`;
      case 'gabon-france':
      case 'gabon-maroc':
      case 'gabon-etats-unis':
      case 'gabon-canada':
        return `${base}/plane.svg`;
      case 'gabon-senegal':
      case 'gabon-burkina':
        return `${base}/truck.svg`;
      case 'libreville-port-gentil':
      case 'libreville-franceville':
        return `${base}/pin.svg`;
      default:
        return `${base}/globe.svg`;
    }
  }

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

  protected goToSlide(index: number): void {
    if (index < 0 || index >= this.heroSlides.length) {
      return;
    }
    this.activeSlide.set(index);
  }

  protected nextSlide(): void {
    this.activeSlide.update((current) => (current + 1) % this.heroSlides.length);
  }

  protected previousSlide(): void {
    this.activeSlide.update(
      (current) => (current - 1 + this.heroSlides.length) % this.heroSlides.length,
    );
  }

  protected pauseSlider(): void {
    this.sliderPaused.set(true);
  }

  protected resumeSlider(): void {
    this.sliderPaused.set(false);
  }

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
