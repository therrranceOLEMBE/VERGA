import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { OfferCard } from '../../components/offer-card/offer-card';
import { OfferFiltersService } from '../../services/offer-filters.service';
import { LanguageService } from '../../services/language.service';
import { OfferService } from '../../services/offer.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { OfferDestinationRoute } from '../../models/offer.model';
import { matchesDestinationRoute } from '../../utils/offer-destination.util';

interface DestinationFilter {
  value: '' | OfferDestinationRoute;
  labelKey: string;
  icon: 'all' | 'route';
}

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

  private readonly destinationScroll = viewChild<ElementRef<HTMLElement>>('destinationScroll');

  protected readonly showScrollTop = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 50;

  protected readonly destinationFilters: DestinationFilter[] = [
    { value: '', labelKey: 'home.destination.all', icon: 'all' },
    { value: 'gabon-chine', labelKey: 'home.destination.gabonChine', icon: 'route' },
    { value: 'gabon-france', labelKey: 'home.destination.gabonFrance', icon: 'route' },
    { value: 'gabon-senegal', labelKey: 'home.destination.gabonSenegal', icon: 'route' },
    { value: 'gabon-maroc', labelKey: 'home.destination.gabonMaroc', icon: 'route' },
    { value: 'gabon-etats-unis', labelKey: 'home.destination.gabonEtatsUnis', icon: 'route' },
    { value: 'gabon-canada', labelKey: 'home.destination.gabonCanada', icon: 'route' },
    { value: 'gabon-burkina', labelKey: 'home.destination.gabonBurkina', icon: 'route' },
    { value: 'libreville-port-gentil', labelKey: 'home.destination.librevillePortGentil', icon: 'route' },
    { value: 'libreville-franceville', labelKey: 'home.destination.librevilleFranceville', icon: 'route' },
  ];

  constructor() {
    afterNextRender(() => this.updateScrollTopVisibility());

    effect(() => {
      const maxPage = this.totalPages();
      if (this.currentPage() > maxPage) {
        this.currentPage.set(maxPage);
      }
    });
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.updateScrollTopVisibility();
  }

  protected readonly selectedDestination = computed(
    () => this.filtersService.filters().destination,
  );

  protected readonly filteredOffers = computed(() => {
    this.language.lang();
    const f = this.filtersService.filters();
    let list = [...this.offerService.getAll()];

    if (f.destination) {
      const route = f.destination as OfferDestinationRoute;
      list = list.filter((o) => matchesDestinationRoute(o, route));
    }
    if (f.verifiedOnly) {
      list = list.filter((o) => o.verified);
    }
    if (f.location) {
      const q = f.location.toLowerCase();
      list = list.filter((o) => o.location.toLowerCase().includes(q));
    }
    if (f.category) {
      const map: Record<string, string[]> = {
        maritime: ['Fret maritime'],
        aerien: ['Fret aérien'],
        routier: ['Transport routier'],
        entreposage: ['Logistique & entreposage'],
      };
      const allowed = map[f.category] ?? [];
      if (allowed.length) {
        list = list.filter((o) =>
          allowed.some((c) => o.category.toLowerCase().includes(c.toLowerCase())),
        );
      }
    }

    return list;
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOffers().length / this.pageSize)),
  );

  protected readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  protected readonly activePage = computed(() =>
    Math.min(this.currentPage(), this.totalPages()),
  );

  protected readonly displayedOffers = computed(() => {
    const list = this.filteredOffers();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.filteredOffers().length;
    if (total === 0) {
      return this.language.translate('home.noResults');
    }
    const page = this.activePage();
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return this.language.translate('home.results', { start, end, total });
  });

  protected selectDestination(value: '' | OfferDestinationRoute): void {
    this.filtersService.apply({ ...this.filtersService.filters(), destination: value });
    this.currentPage.set(1);
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
