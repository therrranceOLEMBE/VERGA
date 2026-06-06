import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FiltersModal } from '../filters-modal/filters-modal';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface MenuLink {
  labelKey: string;
  path: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, FiltersModal, TranslatePipe],
  templateUrl: './header.html',
})
export class Header {
  protected readonly menuOpen = signal(false);
  protected readonly filtersOpen = signal(false);

  protected readonly menuLinks: MenuLink[] = [
    { labelKey: 'nav.login', path: '/connexion' },
    { labelKey: 'nav.signup', path: '/inscription' },
    { labelKey: 'nav.faq', path: '/faq' },
    { labelKey: 'nav.contact', path: '/nous-contacter' },
    { labelKey: 'nav.pricing', path: '/tarifs' },
    { labelKey: 'nav.about', path: '/qui-sommes-nous' },
  ];

  protected openFilters(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.filtersOpen.set(true);
  }

  protected closeFilters(): void {
    this.filtersOpen.set(false);
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
