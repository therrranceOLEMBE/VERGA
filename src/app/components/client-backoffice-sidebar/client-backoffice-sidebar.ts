import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface ClientNavItem {
  labelKey: string;
  path: string;
}

@Component({
  selector: 'app-client-backoffice-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './client-backoffice-sidebar.html',
  styleUrl: './client-backoffice-sidebar.css',
})
export class ClientBackofficeSidebar {
  readonly open = input(false);
  readonly navigate = output<void>();
  readonly logoutRequest = output<void>();
  readonly loggingOut = input(false);

  protected readonly navItems: ClientNavItem[] = [
    { labelKey: 'clientBackoffice.nav.dashboard', path: '/espace-client/dashboard' },
    { labelKey: 'clientBackoffice.nav.commandes', path: '/espace-client/commandes' },
    { labelKey: 'clientBackoffice.nav.paiements', path: '/espace-client/paiements' },
    { labelKey: 'clientBackoffice.nav.colis', path: '/espace-client/colis' },
    { labelKey: 'clientBackoffice.nav.reclamations', path: '/espace-client/reclamations' },
    { labelKey: 'clientBackoffice.nav.profile', path: '/espace-client/profil' },
    { labelKey: 'clientBackoffice.nav.password', path: '/espace-client/mot-de-passe' },
  ];

  protected onNavigate(): void {
    this.navigate.emit();
  }

  protected logout(): void {
    if (this.loggingOut()) {
      return;
    }
    this.logoutRequest.emit();
  }
}
