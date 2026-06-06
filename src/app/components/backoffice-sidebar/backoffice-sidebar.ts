import { Component, HostListener, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface NavItem {
  labelKey: string;
  path: string;
  icon: 'dashboard' | 'transactions' | 'logistics';
}

interface OfferItem {
  labelKey: string;
  path: string;
  icon: 'create' | 'history';
}

interface CollaboratorItem {
  labelKey: string;
  path: string;
  icon: 'create' | 'list';
}

interface AccountItem {
  labelKey: string;
  path: string;
  icon: 'profile' | 'notifications' | 'password';
}

@Component({
  selector: 'app-backoffice-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './backoffice-sidebar.html',
  styleUrl: './backoffice-sidebar.css',
})
export class BackofficeSidebar {
  private readonly router = inject(Router);
  readonly open = input(false);
  readonly navigate = output<void>();
  protected readonly offersOpen = signal(false);
  protected readonly collaboratorsOpen = signal(false);
  protected readonly accountOpen = signal(false);

  protected readonly mainNav: NavItem[] = [
    { labelKey: 'backoffice.nav.dashboard', path: '/backoffice/tableau-de-bord', icon: 'dashboard' },
    { labelKey: 'backoffice.nav.transactions', path: '/backoffice/transactions', icon: 'transactions' },
    { labelKey: 'backoffice.nav.supportLogistics', path: '/backoffice/support-logistique', icon: 'logistics' },
  ];

  protected readonly offersNav: OfferItem[] = [
    { labelKey: 'backoffice.nav.createOffer', path: '/backoffice/creer-offre', icon: 'create' },
    { labelKey: 'backoffice.nav.offerHistory', path: '/backoffice/historique-offres', icon: 'history' },
  ];

  protected readonly collaboratorsNav: CollaboratorItem[] = [
    { labelKey: 'backoffice.nav.createCollaborator', path: '/backoffice/creer-collaborateur', icon: 'create' },
    { labelKey: 'backoffice.nav.collaboratorList', path: '/backoffice/liste-collaborateurs', icon: 'list' },
  ];

  protected readonly accountNav: AccountItem[] = [
    { labelKey: 'backoffice.nav.profile', path: '/backoffice/compte/profil', icon: 'profile' },
    { labelKey: 'backoffice.nav.notifications', path: '/backoffice/compte/notifications', icon: 'notifications' },
    { labelKey: 'backoffice.nav.password', path: '/backoffice/compte/mot-de-passe', icon: 'password' },
  ];

  protected toggleOffers(event: Event): void {
    event.stopPropagation();
    this.offersOpen.update((open) => !open);
    this.closeCollaborators();
    this.closeAccount();
  }

  protected toggleCollaborators(event: Event): void {
    event.stopPropagation();
    this.collaboratorsOpen.update((open) => !open);
    this.closeOffers();
    this.closeAccount();
  }

  protected toggleAccount(event: Event): void {
    event.stopPropagation();
    this.accountOpen.update((open) => !open);
    this.closeOffers();
    this.closeCollaborators();
  }

  protected closeOffers(): void {
    this.offersOpen.set(false);
  }

  protected closeCollaborators(): void {
    this.collaboratorsOpen.set(false);
  }

  protected closeAccount(): void {
    this.accountOpen.set(false);
  }

  protected onNavigate(): void {
    this.closeOffers();
    this.closeCollaborators();
    this.closeAccount();
    this.navigate.emit();
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.closeOffers();
    this.closeCollaborators();
    this.closeAccount();
  }

  protected isOffersSectionActive(): boolean {
    const url = this.router.url;
    return this.offersNav.some((item) => url.startsWith(item.path));
  }

  protected isCollaboratorsSectionActive(): boolean {
    const url = this.router.url;
    return this.collaboratorsNav.some((item) => url.startsWith(item.path));
  }

  protected isAccountSectionActive(): boolean {
    const url = this.router.url;
    return this.accountNav.some((item) => url.startsWith(item.path));
  }
}
