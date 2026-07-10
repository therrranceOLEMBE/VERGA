import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientDashboardPeriode } from '../../models/client-dashboard.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { formatDashboardMoney } from '../../utils/agence-dashboard.util';
import {
  ClientDashboardStatusCount,
  ClientDashboardView,
  parseClientDashboardResponse,
} from '../../utils/client-dashboard.util';

interface DashboardMetric {
  labelKey: string;
  value: string;
}

interface DashboardHighlight extends DashboardMetric {
  accent: 'primary' | 'success' | 'neutral';
}

interface MetricGroup {
  titleKey: string;
  metrics: DashboardMetric[];
}

interface PeriodOption {
  value: ClientDashboardPeriode;
  labelKey: string;
}

interface StatusBarItem extends ClientDashboardStatusCount {
  percent: number;
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

  protected readonly displayName = computed(() => {
    const profilName = this.dashboard()?.profilName?.trim();
    if (profilName) {
      return profilName;
    }
    return this.clientSession.fullName || '—';
  });

  protected readonly highlights = computed<DashboardHighlight[]>(() => {
    const stats = this.dashboard()?.stats;
    if (!stats) {
      return [];
    }

    return [
      {
        labelKey: 'clientBackoffice.dashboard.totalSpent',
        value: formatDashboardMoney(stats.total_depense),
        accent: 'primary',
      },
      {
        labelKey: 'clientBackoffice.dashboard.totalOrders',
        value: this.formatCount(stats.nb_commandes),
        accent: 'success',
      },
      {
        labelKey: 'clientBackoffice.dashboard.totalParcels',
        value: this.formatCount(stats.nb_colis),
        accent: 'neutral',
      },
    ];
  });

  protected readonly metricGroups = computed<MetricGroup[]>(() => {
    const stats = this.dashboard()?.stats;
    if (!stats) {
      return [];
    }

    return [
      {
        titleKey: 'clientBackoffice.dashboard.sectionOrders',
        metrics: [
          { labelKey: 'clientBackoffice.dashboard.totalOrders', value: this.formatCount(stats.nb_commandes) },
          { labelKey: 'clientBackoffice.dashboard.pendingOrders', value: this.formatCount(stats.nb_commandes_en_attente) },
          { labelKey: 'clientBackoffice.dashboard.confirmedOrders', value: this.formatCount(stats.nb_commandes_confirmees) },
        ],
      },
      {
        titleKey: 'clientBackoffice.dashboard.sectionParcels',
        metrics: [
          { labelKey: 'clientBackoffice.dashboard.totalParcels', value: this.formatCount(stats.nb_colis) },
          { labelKey: 'clientBackoffice.dashboard.parcelsInTransit', value: this.formatCount(stats.nb_colis_en_transit) },
          { labelKey: 'clientBackoffice.dashboard.parcelsArrived', value: this.formatCount(stats.nb_colis_arrives) },
        ],
      },
      {
        titleKey: 'clientBackoffice.dashboard.sectionClaims',
        metrics: [
          { labelKey: 'clientBackoffice.dashboard.totalClaims', value: this.formatCount(stats.nb_reclamations) },
          { labelKey: 'clientBackoffice.dashboard.openClaims', value: this.formatCount(stats.nb_reclamations_ouvertes) },
        ],
      },
    ];
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
      return 'bg-verga-success-muted text-verga-success';
    }
    if (statut === 'annulée') {
      return 'bg-verga-surface text-verga-muted';
    }
    return 'bg-verga-primary-muted text-verga-primary';
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

  private formatCount(value: number | null | undefined): string {
    return (value ?? 0).toLocaleString('fr-FR');
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
