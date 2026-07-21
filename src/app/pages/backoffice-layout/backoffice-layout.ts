import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { BackofficeSidebar } from '../../components/backoffice-sidebar/backoffice-sidebar';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { AgenceService } from '../../services/agence.service';
import { AuthRedirectService } from '../../services/auth-redirect.service';

@Component({
  selector: 'app-backoffice-layout',
  imports: [RouterOutlet, RouterLink, BackofficeSidebar, TranslatePipe],
  templateUrl: './backoffice-layout.html',
  styleUrl: './backoffice-layout.css',
})
export class BackofficeLayout implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authRedirect = inject(AuthRedirectService);
  private readonly agenceSession = inject(AgenceSessionService);
  private readonly agenceService = inject(AgenceService);
  private readonly navSub: Subscription;
  private logoutTimer: number | null = null;

  protected readonly sidebarOpen = signal(false);
  protected readonly loggingOut = signal(false);
  protected readonly agencyProfile = this.agenceSession.agence;

  constructor() {
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeSidebar();
        this.authRedirect.ensureAgenceAccess(this.router.url);
      });
  }

  ngOnInit(): void {
    if (!this.authRedirect.ensureAgenceAccess(this.router.url)) {
      return;
    }

    this.agenceSession.loadProfile().subscribe({
      error: () => {
        // profil indisponible : la sidebar retombera sur le logo par défaut
      },
    });
  }

  ngOnDestroy(): void {
    this.navSub.unsubscribe();
    if (this.logoutTimer !== null) {
      window.clearTimeout(this.logoutTimer);
    }
  }

  @HostListener('window:pageshow', ['$event'])
  protected onPageShow(event: PageTransitionEvent): void {
    if (event.persisted) {
      this.authRedirect.ensureAgenceAccess(this.router.url);
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
    const token = this.agenceSession.getToken();
    const finishLogout = (): void => {
      const wait = Math.max(0, 2800 - (Date.now() - startedAt));
      this.logoutTimer = window.setTimeout(() => {
        this.agenceSession.clearSession();
        this.authRedirect.redirectToLogin('agence');
      }, wait);
    };

    if (!token) {
      finishLogout();
      return;
    }

    this.agenceService.logout(token).subscribe({
      next: finishLogout,
      error: finishLogout,
    });
  }
}
