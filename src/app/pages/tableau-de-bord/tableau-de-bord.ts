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
  formatDashboardMoney,
  parseAgenceDashboardResponse,
} from '../../utils/agence-dashboard.util';

interface DashboardMetric {
  labelKey: string;
  value: string;
  icon: 'offers' | 'pending' | 'confirmed' | 'parcels' | 'transit' | 'claims' | 'payments' | 'commissions' | 'revenue' | 'payouts';
}

interface DashboardHighlight extends DashboardMetric {
  accent: 'primary' | 'success' | 'neutral';
}

interface MetricGroup {
  titleKey: string;
  descriptionKey: string;
  metrics: DashboardMetric[];
}

interface PeriodOption {
  value: AgenceDashboardPeriode;
  labelKey: string;
}

interface QuickLink {
  labelKey: string;
  path: string;
  icon: 'commandes' | 'finances' | 'colis' | 'offers';
}

interface StatusBarItem extends AgenceDashboardStatusCount {
  percent: number;
  tone: 'primary' | 'success' | 'warning' | 'muted';
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

  protected readonly quickLinks: QuickLink[] = [
    { labelKey: 'backoffice.dashboard.quickCommandes', path: '/backoffice/commandes', icon: 'commandes' },
    { labelKey: 'backoffice.dashboard.quickFinances', path: '/backoffice/finances', icon: 'finances' },
    { labelKey: 'backoffice.dashboard.quickColis', path: '/backoffice/support-logistique', icon: 'colis' },
    { labelKey: 'backoffice.dashboard.quickOffers', path: '/backoffice/historique-offres', icon: 'offers' },
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
        icon: 'revenue',
      },
      {
        labelKey: 'backoffice.dashboard.totalOrders',
        value: this.formatCount(stats.nb_commandes),
        accent: 'success',
        icon: 'confirmed',
      },
      {
        labelKey: 'backoffice.dashboard.activeOffers',
        value: this.formatCount(stats.nb_offres_actives),
        accent: 'neutral',
        icon: 'offers',
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
        descriptionKey: 'backoffice.dashboard.sectionOperationsHint',
        metrics: [
          { labelKey: 'backoffice.dashboard.totalOffers', value: this.formatCount(stats.nb_offres), icon: 'offers' },
          { labelKey: 'backoffice.dashboard.pendingOrders', value: this.formatCount(stats.nb_commandes_en_attente), icon: 'pending' },
          { labelKey: 'backoffice.dashboard.confirmedOrders', value: this.formatCount(stats.nb_commandes_confirmees), icon: 'confirmed' },
          { labelKey: 'backoffice.dashboard.totalParcels', value: this.formatCount(stats.nb_colis), icon: 'parcels' },
          { labelKey: 'backoffice.dashboard.parcelsInTransit', value: this.formatCount(stats.nb_colis_en_transit), icon: 'transit' },
          { labelKey: 'backoffice.dashboard.openClaims', value: this.formatCount(stats.nb_reclamations_ouvertes), icon: 'claims' },
        ],
      },
      {
        titleKey: 'backoffice.dashboard.sectionFinance',
        descriptionKey: 'backoffice.dashboard.sectionFinanceHint',
        metrics: [
          { labelKey: 'backoffice.dashboard.totalPayments', value: formatDashboardMoney(stats.total_paiements), icon: 'payments' },
          { labelKey: 'backoffice.dashboard.totalCommissions', value: formatDashboardMoney(stats.total_commissions), icon: 'commissions' },
          { labelKey: 'backoffice.dashboard.netRevenue', value: formatDashboardMoney(stats.revenu_net_estime), icon: 'revenue' },
          { labelKey: 'backoffice.dashboard.pendingPayouts', value: formatDashboardMoney(stats.reversements_en_attente), icon: 'payouts' },
        ],
      },
    ];
  });

  protected readonly commandesStatusBars = computed(() =>
    this.toStatusBars(this.dashboard()?.commandesParStatut ?? []),
  );

  protected readonly colisStatusBars = computed(() => this.toStatusBars(this.dashboard()?.colisParStatut ?? []));

  protected readonly selectedPeriodLabel = computed(() => {
    const periode = this.selectedPeriode();
    const option = this.periodOptions.find((item) => item.value === periode);
    return option?.labelKey ?? 'backoffice.dashboard.periodeMonth';
  });

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

  protected statusBadgeClass(statut: string): string {
    const value = statut.trim().toLowerCase();
    if (value.includes('confirm') || value.includes('valid') || value.includes('actif') || value.includes('livré') || value.includes('livre')) {
      return 'dash-badge dash-badge--success';
    }
    if (value.includes('attente') || value.includes('pending') || value.includes('en cours')) {
      return 'dash-badge dash-badge--warning';
    }
    if (value.includes('annul') || value.includes('échec') || value.includes('echec') || value.includes('refus')) {
      return 'dash-badge dash-badge--danger';
    }
    return 'dash-badge';
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
    const tones: StatusBarItem['tone'][] = ['primary', 'success', 'warning', 'muted'];
    const total = items.reduce((sum, item) => sum + item.count, 0);
    return items.map((item, index) => ({
      ...item,
      percent: this.statusPercent(item.count, total),
      tone: tones[index % tones.length],
    }));
  }

  private statusPercent(count: number, total: number): number {
    if (total <= 0) {
      return 0;
    }
    return Math.round((count / total) * 100);
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
