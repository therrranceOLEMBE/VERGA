import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ClientBackofficeSidebar } from '../../components/client-backoffice-sidebar/client-backoffice-sidebar';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-client-backoffice-layout',
  imports: [RouterOutlet, RouterLink, ClientBackofficeSidebar, TranslatePipe],
  templateUrl: './client-backoffice-layout.html',
  styleUrl: './client-backoffice-layout.css',
})
export class ClientBackofficeLayout implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly clientSession = inject(ClientSessionService);
  private readonly transactionService = inject(TransactionService);
  private readonly navSub: Subscription;

  protected readonly sidebarOpen = signal(false);

  constructor() {
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.closeSidebar());
  }

  ngOnInit(): void {
    this.clientSession.loadProfile().subscribe({
      next: () => {
        const client = this.clientSession.client();
        if (client.email) {
          this.transactionService.ensureClientDemoData({
            name: this.clientSession.fullName,
            email: client.email,
            phone: client.phone,
          });
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.navSub.unsubscribe();
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
