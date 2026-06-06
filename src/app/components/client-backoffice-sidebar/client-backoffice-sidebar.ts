import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface ClientNavItem {
  labelKey: string;
  path: string;
  icon: 'dashboard' | 'transactions' | 'profile' | 'notifications';
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

  protected readonly navItems: ClientNavItem[] = [
    { labelKey: 'clientBackoffice.nav.dashboard', path: '/espace-client/dashboard', icon: 'dashboard' },
    { labelKey: 'clientBackoffice.nav.transactions', path: '/espace-client/historique-transactions', icon: 'transactions' },
    { labelKey: 'clientBackoffice.nav.profile', path: '/espace-client/profil', icon: 'profile' },
    { labelKey: 'clientBackoffice.nav.notifications', path: '/espace-client/notifications', icon: 'notifications' },
  ];

  protected onNavigate(): void {
    this.navigate.emit();
  }
}
