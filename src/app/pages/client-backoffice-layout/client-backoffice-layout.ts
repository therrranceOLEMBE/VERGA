import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ClientBackofficeSidebar } from '../../components/client-backoffice-sidebar/client-backoffice-sidebar';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthRedirectService } from '../../services/auth-redirect.service';
import { ClientSessionService } from '../../services/client-session.service';
import { ParticulierService } from '../../services/particulier.service';
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
  private readonly authRedirect = inject(AuthRedirectService);
  private readonly particulierService = inject(ParticulierService);
  private readonly transactionService = inject(TransactionService);
  private readonly navSub: Subscription;
  private logoutTimer: number | null = null;

  protected readonly sidebarOpen = signal(false);
  protected readonly loggingOut = signal(false);

  constructor() {
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeSidebar();
        this.authRedirect.ensureClientAccess(this.router.url);
      });
  }

  ngOnInit(): void {
    if (!this.authRedirect.ensureClientAccess(this.router.url)) {
      return;
    }

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
    if (this.logoutTimer != null) {
      window.clearTimeout(this.logoutTimer);
    }
  }

  @HostListener('window:pageshow', ['$event'])
  protected onPageShow(event: PageTransitionEvent): void {
    if (event.persisted) {
      this.authRedirect.ensureClientAccess(this.router.url);
    }
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected onLogoutRequest(): void {
    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);
    this.closeSidebar();

    const startedAt = Date.now();
    const minDisplayMs = 2800;
    const token = this.clientSession.getToken();

    const finishLogout = (): void => {
      const wait = Math.max(0, minDisplayMs - (Date.now() - startedAt));
      this.logoutTimer = window.setTimeout(() => {
        this.clientSession.clearSession();
        this.authRedirect.redirectToLogin('client');
      }, wait);
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
