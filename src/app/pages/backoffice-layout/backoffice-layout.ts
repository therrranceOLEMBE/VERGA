import { Component, inject, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { BackofficeSidebar } from '../../components/backoffice-sidebar/backoffice-sidebar';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-backoffice-layout',
  imports: [RouterOutlet, RouterLink, BackofficeSidebar, TranslatePipe],
  templateUrl: './backoffice-layout.html',
  styleUrl: './backoffice-layout.css',
})
export class BackofficeLayout implements OnDestroy {
  private readonly router = inject(Router);
  private readonly navSub: Subscription;

  protected readonly sidebarOpen = signal(false);

  constructor() {
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.closeSidebar());
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
