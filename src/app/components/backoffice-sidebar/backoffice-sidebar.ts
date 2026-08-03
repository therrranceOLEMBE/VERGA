import { Component, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import {
  filterPathsByRole,
  getAgenceHomePath,
} from '../../utils/agence-permissions.util';

interface NavItem {
  labelKey: string;
  path: string;
  icon: 'dashboard' | 'commandes' | 'logistics' | 'payments' | 'finances' | 'reversements' | 'reclamations';
}

interface OfferItem {
  labelKey: string;
  path: string;
  icon: 'create' | 'history' | 'createType' | 'typeHistory';
}

interface CollaboratorItem {
  labelKey: string;
  path: string;
  icon: 'create' | 'list';
}

interface AccountItem {
  labelKey: string;
  path: string;
  icon: 'profile' | 'password';
}

const MAIN_NAV: NavItem[] = [
  { labelKey: 'backoffice.nav.dashboard', path: '/backoffice/tableau-de-bord', icon: 'dashboard' },
  { labelKey: 'backoffice.nav.commandes', path: '/backoffice/commandes', icon: 'commandes' },
  { labelKey: 'backoffice.nav.finances', path: '/backoffice/finances', icon: 'finances' },
  { labelKey: 'backoffice.nav.reversements', path: '/backoffice/reversements', icon: 'reversements' },
  { labelKey: 'backoffice.nav.payments', path: '/backoffice/paiements', icon: 'payments' },
  { labelKey: 'backoffice.nav.reclamations', path: '/backoffice/reclamations', icon: 'reclamations' },
  { labelKey: 'backoffice.nav.parcelTracking', path: '/backoffice/support-logistique', icon: 'logistics' },
];

const OFFERS_NAV: OfferItem[] = [
  { labelKey: 'backoffice.nav.createOffer', path: '/backoffice/creer-offre', icon: 'create' },
  { labelKey: 'backoffice.nav.offerHistory', path: '/backoffice/historique-offres', icon: 'history' },
  { labelKey: 'backoffice.nav.createTypeOffre', path: '/backoffice/creer-type-offre', icon: 'createType' },
  { labelKey: 'backoffice.nav.typeOffreHistory', path: '/backoffice/historique-types-offres', icon: 'typeHistory' },
];

const COLLABORATORS_NAV: CollaboratorItem[] = [
  { labelKey: 'backoffice.nav.createCollaborator', path: '/backoffice/creer-collaborateur', icon: 'create' },
  { labelKey: 'backoffice.nav.collaboratorList', path: '/backoffice/liste-collaborateurs', icon: 'list' },
];

const ACCOUNT_NAV: AccountItem[] = [
  { labelKey: 'backoffice.nav.profile', path: '/backoffice/compte/profil', icon: 'profile' },
  { labelKey: 'backoffice.nav.password', path: '/backoffice/compte/mot-de-passe', icon: 'password' },
];

@Component({
  selector: 'app-backoffice-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './backoffice-sidebar.html',
  styleUrl: './backoffice-sidebar.css',
})
export class BackofficeSidebar {
  private readonly router = inject(Router);
  private readonly agenceSession = inject(AgenceSessionService);
  readonly open = input(false);
  readonly loggingOut = input(false);
  readonly navigate = output<void>();
  readonly logoutRequest = output<void>();
  protected readonly agencyLogoUrl = this.agenceSession.agence;
  protected readonly offersOpen = signal(false);
  protected readonly collaboratorsOpen = signal(false);
  protected readonly accountOpen = signal(false);

  private readonly roleSlug = this.agenceSession.currentRoleSlug;
  private readonly permissionsReady = this.agenceSession.arePermissionsReady;

  protected readonly homePath = computed(() => getAgenceHomePath(this.roleSlug()));
  protected readonly mainNav = computed(() =>
    filterPathsByRole(MAIN_NAV, this.roleSlug(), this.permissionsReady()),
  );
  protected readonly offersNav = computed(() =>
    filterPathsByRole(OFFERS_NAV, this.roleSlug(), this.permissionsReady()),
  );
  protected readonly collaboratorsNav = computed(() =>
    filterPathsByRole(COLLABORATORS_NAV, this.roleSlug(), this.permissionsReady()),
  );
  protected readonly accountNav = computed(() =>
    filterPathsByRole(ACCOUNT_NAV, this.roleSlug(), this.permissionsReady()),
  );
  protected readonly showCollaboratorsSection = computed(() => this.collaboratorsNav().length > 0);
  protected readonly showOffersSection = computed(() => this.offersNav().length > 0);

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
    return this.offersNav().some((item) => url.startsWith(item.path));
  }

  protected isCollaboratorsSectionActive(): boolean {
    const url = this.router.url;
    return this.collaboratorsNav().some((item) => url.startsWith(item.path));
  }

  protected isAccountSectionActive(): boolean {
    const url = this.router.url;
    return this.accountNav().some((item) => url.startsWith(item.path));
  }

  protected logout(): void {
    if (this.loggingOut()) {
      return;
    }
    this.logoutRequest.emit();
  }
}
