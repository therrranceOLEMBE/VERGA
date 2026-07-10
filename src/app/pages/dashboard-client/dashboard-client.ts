import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientDashboardPeriode } from '../../models/client-dashboard.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import {
  ClientDashboardStatusCount,
  ClientDashboardView,
  parseClientDashboardResponse,
} from '../../utils/client-dashboard.util';

interface PeriodOption {
  value: ClientDashboardPeriode;
  labelKey: string;
}

interface StatusBarItem extends ClientDashboardStatusCount {
  percent: number;
}

interface QuickLink {
  labelKey: string;
  path: string;
  icon: 'orders' | 'payments' | 'parcels' | 'claims' | 'home' | 'profile';
  hintKey: string;
}

@Component({
  selector: 'app-dashboard-client',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './dashboard-client.html',
  styleUrl: './dashboard-client.css',
})
export class DashboardClient implements OnInit {
  private readonly clientSession = inject(ClientSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly selectedPeriode = signal<ClientDashboardPeriode>('mois');
  protected readonly dashboard = signal<ClientDashboardView | null>(null);

  protected readonly periodOptions: PeriodOption[] = [
    { value: 'mois', labelKey: 'backoffice.dashboard.periodeMonth' },
    { value: 'mois_dernier', labelKey: 'backoffice.dashboard.periodeLastMonth' },
    { value: 'trimestre', labelKey: 'backoffice.dashboard.periodeQuarter' },
    { value: 'semestre', labelKey: 'backoffice.dashboard.periodeHalfYear' },
    { value: 'annee', labelKey: 'backoffice.dashboard.periodeYear' },
    { value: 'tout', labelKey: 'backoffice.dashboard.periodeAll' },
  ];

  protected readonly quickLinks: QuickLink[] = [
    {
      labelKey: 'clientBackoffice.nav.commandes',
      path: '/espace-client/commandes',
      icon: 'orders',
      hintKey: 'clientBackoffice.dashboard.quickOrdersHint',
    },
    {
      labelKey: 'clientBackoffice.nav.paiements',
      path: '/espace-client/paiements',
      icon: 'payments',
      hintKey: 'clientBackoffice.dashboard.quickPaymentsHint',
    },
    {
      labelKey: 'clientBackoffice.nav.colis',
      path: '/espace-client/colis',
      icon: 'parcels',
      hintKey: 'clientBackoffice.dashboard.quickParcelsHint',
    },
    {
      labelKey: 'clientBackoffice.nav.reclamations',
      path: '/espace-client/reclamations',
      icon: 'claims',
      hintKey: 'clientBackoffice.dashboard.quickClaimsHint',
    },
    {
      labelKey: 'clientBackoffice.dashboard.browseOffers',
      path: '/accueil',
      icon: 'home',
      hintKey: 'clientBackoffice.dashboard.quickOffersHint',
    },
    {
      labelKey: 'clientBackoffice.nav.profile',
      path: '/espace-client/profil',
      icon: 'profile',
      hintKey: 'clientBackoffice.dashboard.quickProfileHint',
    },
  ];

  protected readonly displayName = computed(() => {
    const profilName = this.dashboard()?.profilName?.trim();
    if (profilName) {
      return profilName;
    }
    return this.clientSession.fullName || '—';
  });

  protected readonly selectedPeriodLabel = computed(() => {
    const match = this.periodOptions.find((option) => option.value === this.selectedPeriode());
    return match?.labelKey ?? 'backoffice.dashboard.periodeMonth';
  });

  protected readonly commandesStatusBars = computed(() =>
    this.toStatusBars(this.dashboard()?.commandesParStatut ?? []),
  );

  protected readonly colisStatusBars = computed(() =>
    this.toStatusBars(this.dashboard()?.colisParStatut ?? []),
  );

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected selectPeriode(periode: ClientDashboardPeriode): void {
    if (this.selectedPeriode() === periode || this.loading()) {
      return;
    }
    this.selectedPeriode.set(periode);
    this.loadDashboard();
  }

  protected statusClass(statut: string): string {
    if (statut === 'confirmée') {
      return 'cdash-badge cdash-badge--success';
    }
    if (statut === 'annulée') {
      return 'cdash-badge cdash-badge--muted';
    }
    return 'cdash-badge cdash-badge--primary';
  }

  private loadDashboard(): void {
    if (!this.clientSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('clientBackoffice.dashboard.authRequired');
      return;
    }

    this.unauthenticated.set(false);
    this.loading.set(true);
    this.errorMessage.set('');

    this.clientSession.loadDashboard(this.selectedPeriode()).subscribe({
      next: (response) => {
        this.dashboard.set(parseClientDashboardResponse(response));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No client token') {
          this.unauthenticated.set(true);
          this.errorMessage.set('clientBackoffice.dashboard.authRequired');
        } else {
          this.errorMessage.set(this.resolveLoadError(error as HttpErrorResponse));
        }
        this.loading.set(false);
      },
    });
  }

  private toStatusBars(items: ClientDashboardStatusCount[]): StatusBarItem[] {
    const total = items.reduce((sum, item) => sum + item.count, 0);
    return items.map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));
  }

  private resolveLoadError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'clientBackoffice.dashboard.authRequired';
    }
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }
    if (error.status === 422) {
      return 'clientBackoffice.dashboard.invalidPeriod';
    }
    return 'clientBackoffice.dashboard.loadError';
  }
}
