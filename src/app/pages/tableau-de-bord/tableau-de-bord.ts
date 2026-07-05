import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgenceDashboardPeriode } from '../../models/agence-dashboard.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import {
  AgenceDashboardStatusCount,
  AgenceDashboardView,
  formatDashboardKg,
  formatDashboardMoney,
  parseAgenceDashboardResponse,
} from '../../utils/agence-dashboard.util';

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
  value: AgenceDashboardPeriode;
  labelKey: string;
}

interface StatusBarItem extends AgenceDashboardStatusCount {
  percent: number;
}

@Component({
  selector: 'app-tableau-de-bord',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './tableau-de-bord.html',
  styleUrl: './tableau-de-bord.css',
})
export class TableauDeBord implements OnInit {
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly selectedPeriode = signal<AgenceDashboardPeriode>('mois');
  protected readonly dashboard = signal<AgenceDashboardView | null>(null);

  protected readonly periodOptions: PeriodOption[] = [
    { value: 'mois', labelKey: 'backoffice.dashboard.periodeMonth' },
    { value: 'mois_dernier', labelKey: 'backoffice.dashboard.periodeLastMonth' },
    { value: 'trimestre', labelKey: 'backoffice.dashboard.periodeQuarter' },
    { value: 'semestre', labelKey: 'backoffice.dashboard.periodeHalfYear' },
    { value: 'annee', labelKey: 'backoffice.dashboard.periodeYear' },
    { value: 'tout', labelKey: 'backoffice.dashboard.periodeAll' },
  ];

  protected readonly highlights = computed<DashboardHighlight[]>(() => {
    const stats = this.dashboard()?.stats;
    if (!stats) {
      return [];
    }

    return [
      {
        labelKey: 'backoffice.dashboard.netRevenue',
        value: formatDashboardMoney(stats.revenu_net_estime),
        accent: 'primary',
      },
      {
        labelKey: 'backoffice.dashboard.totalOrders',
        value: this.formatCount(stats.nb_commandes),
        accent: 'success',
      },
      {
        labelKey: 'backoffice.dashboard.activeOffers',
        value: this.formatCount(stats.nb_offres_actives),
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
        titleKey: 'backoffice.dashboard.sectionOperations',
        metrics: [
          { labelKey: 'backoffice.dashboard.totalOffers', value: this.formatCount(stats.nb_offres) },
          { labelKey: 'backoffice.dashboard.availableCapacity', value: formatDashboardKg(stats.capacite_disponible_totale) },
          { labelKey: 'backoffice.dashboard.pendingOrders', value: this.formatCount(stats.nb_commandes_en_attente) },
          { labelKey: 'backoffice.dashboard.confirmedOrders', value: this.formatCount(stats.nb_commandes_confirmees) },
          { labelKey: 'backoffice.dashboard.totalParcels', value: this.formatCount(stats.nb_colis) },
          { labelKey: 'backoffice.dashboard.parcelsInTransit', value: this.formatCount(stats.nb_colis_en_transit) },
          { labelKey: 'backoffice.dashboard.openClaims', value: this.formatCount(stats.nb_reclamations_ouvertes) },
        ],
      },
      {
        titleKey: 'backoffice.dashboard.sectionFinance',
        metrics: [
          { labelKey: 'backoffice.dashboard.totalPayments', value: formatDashboardMoney(stats.total_paiements) },
          { labelKey: 'backoffice.dashboard.totalCommissions', value: formatDashboardMoney(stats.total_commissions) },
          { labelKey: 'backoffice.dashboard.netRevenue', value: formatDashboardMoney(stats.revenu_net_estime) },
          { labelKey: 'backoffice.dashboard.pendingPayouts', value: formatDashboardMoney(stats.reversements_en_attente) },
        ],
      },
    ];
  });

  protected readonly commandesStatusBars = computed(() =>
    this.toStatusBars(this.dashboard()?.commandesParStatut ?? []),
  );

  protected readonly colisStatusBars = computed(() => this.toStatusBars(this.dashboard()?.colisParStatut ?? []));

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected selectPeriode(periode: AgenceDashboardPeriode): void {
    if (this.selectedPeriode() === periode || this.loading()) {
      return;
    }
    this.selectedPeriode.set(periode);
    this.loadDashboard();
  }

  protected statusPercent(count: number, total: number): number {
    if (total <= 0) {
      return 0;
    }
    return Math.round((count / total) * 100);
  }

  private loadDashboard(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.dashboard.authRequired');
      return;
    }

    this.unauthenticated.set(false);
    this.loading.set(true);
    this.errorMessage.set('');

    this.agenceSession.loadDashboard(this.selectedPeriode()).subscribe({
      next: (response) => {
        this.dashboard.set(parseAgenceDashboardResponse(response));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.unauthenticated.set(true);
          this.errorMessage.set('backoffice.dashboard.authRequired');
        } else {
          this.errorMessage.set(this.resolveLoadError(error as HttpErrorResponse));
        }
        this.loading.set(false);
      },
    });
  }

  private toStatusBars(items: AgenceDashboardStatusCount[]): StatusBarItem[] {
    const total = items.reduce((sum, item) => sum + item.count, 0);
    return items.map((item) => ({
      ...item,
      percent: this.statusPercent(item.count, total),
    }));
  }

  private formatCount(value: number | null | undefined): string {
    return (value ?? 0).toLocaleString('fr-FR');
  }

  private resolveLoadError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.dashboard.authRequired';
    }
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }
    if (error.status === 422) {
      return 'backoffice.dashboard.invalidPeriod';
    }
    return 'backoffice.dashboard.loadError';
  }
}
