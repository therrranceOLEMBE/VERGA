import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ClientBackofficeSidebar } from '../../components/client-backoffice-sidebar/client-backoffice-sidebar';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthRedirectService } from '../../services/auth-redirect.service';
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
  private readonly authRedirect = inject(AuthRedirectService);
  private readonly transactionService = inject(TransactionService);
  private readonly navSub: Subscription;

  protected readonly sidebarOpen = signal(false);

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
}
