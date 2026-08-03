import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FiltersModal } from '../filters-modal/filters-modal';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';
import { OfferFiltersService } from '../../services/offer-filters.service';
import { ParticulierService } from '../../services/particulier.service';
import { countActiveOfferFilters } from '../../utils/client-offre-filters.util';

interface MenuLink {
  labelKey: string;
  path: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, FiltersModal, TranslatePipe, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly router = inject(Router);
  private readonly clientSession = inject(ClientSessionService);
  private readonly particulierService = inject(ParticulierService);
  private readonly filtersService = inject(OfferFiltersService);

  protected readonly menuOpen = signal(false);
  protected readonly filtersOpen = signal(false);
  protected readonly loggingOut = signal(false);
  protected readonly searchQuery = signal(this.filtersService.filters().search);

  protected readonly activeFiltersCount = computed(() =>
    countActiveOfferFilters(this.filtersService.filters()),
  );

  /** Re-évalué dès que la session client change. */
  protected readonly isClientAuthenticated = this.clientSession.isLoggedIn;

  constructor() {
    // Garde la barre de recherche synchronisée (ex. reset « Toutes » depuis l’accueil).
    effect(() => {
      this.searchQuery.set(this.filtersService.filters().search);
    });
  }

  private readonly guestMenuLinks: MenuLink[] = [
    { labelKey: 'nav.login', path: '/connexion' },
    { labelKey: 'nav.signup', path: '/inscription' },
    { labelKey: 'nav.faq', path: '/faq' },
    { labelKey: 'nav.contact', path: '/nous-contacter' },
    { labelKey: 'nav.pricing', path: '/tarifs' },
    { labelKey: 'nav.about', path: '/qui-sommes-nous' },
  ];

  private readonly clientMenuLinks: MenuLink[] = [
    { labelKey: 'clientBackoffice.nav.dashboard', path: '/espace-client/dashboard' },
    { labelKey: 'clientBackoffice.nav.commandes', path: '/espace-client/commandes' },
    { labelKey: 'clientBackoffice.nav.colis', path: '/espace-client/colis' },
    { labelKey: 'nav.faq', path: '/faq' },
    { labelKey: 'nav.contact', path: '/nous-contacter' },
    { labelKey: 'nav.pricing', path: '/tarifs' },
    { labelKey: 'nav.about', path: '/qui-sommes-nous' },
  ];

  protected readonly menuLinks = computed(() =>
    this.isClientAuthenticated() ? this.clientMenuLinks : this.guestMenuLinks,
  );

  protected openFilters(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.filtersOpen.set(true);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
  }

  protected onFiltersApplied(): void {
    this.searchQuery.set(this.filtersService.filters().search);
    this.navigateToAccueilIfNeeded();
  }

  protected submitSearch(): void {
    const changed = this.filtersService.patch({ search: this.searchQuery().trim() });
    if (!changed) {
      return;
    }
    this.navigateToAccueilIfNeeded();
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitSearch();
    }
  }

  private navigateToAccueilIfNeeded(): void {
    if (!this.router.url.startsWith('/accueil')) {
      void this.router.navigate(['/accueil']);
    }
  }

  protected toggleMenu(event: Event): void {
    event.stopPropagation();
    this.filtersOpen.set(false);
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected closeMenuAfterNavigate(): void {
    setTimeout(() => this.closeMenu(), 0);
  }

  protected logout(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);
    this.closeMenu();

    const startedAt = Date.now();
    const minimumAnimationMs = 1800;
    const token = this.clientSession.getToken();
    const finishLogout = (): void => {
      const remainingMs = Math.max(0, minimumAnimationMs - (Date.now() - startedAt));

      window.setTimeout(() => {
        this.clientSession.clearSession();
        this.loggingOut.set(false);
        void this.router.navigateByUrl('/accueil');
      }, remainingMs);
    };

    if (!token) {
      finishLogout();
      return;
    }

    this.particulierService.logout(token).subscribe({
      next: () => finishLogout(),
      error: () => finishLogout(),
    });
  }

  @HostListener('document:click', ['$event'])
  protected closeMenuOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-menu-root]')) {
      this.menuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    this.filtersOpen.set(false);
    this.menuOpen.set(false);
  }
}
