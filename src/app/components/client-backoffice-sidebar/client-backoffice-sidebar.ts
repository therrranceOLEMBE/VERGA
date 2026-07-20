import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthRedirectService } from '../../services/auth-redirect.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';

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
  private readonly authRedirect = inject(AuthRedirectService);
  private readonly clientSession = inject(ClientSessionService);
  private readonly particulierService = inject(ParticulierService);

  readonly open = input(false);
  readonly navigate = output<void>();

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
    const token = this.clientSession.getToken();
    const finishLogout = (): void => {
      this.clientSession.clearSession();
      this.onNavigate();
      this.authRedirect.redirectToLogin('client');
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
}
