import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgenceCommande, AgenceCommandeDetail, AgenceCommandeStatut } from '../../models/agence-commande.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { parseAgenceCommandeDetailResponse, parseAgenceCommandesListResponse } from '../../utils/agence-commande.util';

@Component({
  selector: 'app-commandes',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './commandes.html',
  styleUrl: './commandes.css',
})
export class Commandes implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly language = inject(LanguageService);
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly filterSearch = signal('');
  protected readonly filterStatut = signal<AgenceCommandeStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 15;

  protected readonly commandes = signal<AgenceCommande[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);

  protected readonly detailOpen = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');
  protected readonly selectedCommande = signal<AgenceCommandeDetail | null>(null);

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.totalItems();
    if (total === 0) {
      return this.language.translate('backoffice.commandes.empty');
    }
    return this.language.translate('backoffice.commandes.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statutOptions: Array<{ value: AgenceCommandeStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'backoffice.commandes.filterStatusAll' },
    { value: 'en_attente', labelKey: 'backoffice.commandes.status.en_attente' },
    { value: 'réservée', labelKey: 'backoffice.commandes.status.reservee' },
    { value: 'confirmée', labelKey: 'backoffice.commandes.status.confirmee' },
    { value: 'annulée', labelKey: 'backoffice.commandes.status.annulee' },
  ];

  ngOnInit(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    if (search) {
      this.filterSearch.set(search);
    }
    this.loadCommandes();
  }

  protected resetFilters(): void {
    this.filterSearch.set('');
    this.filterStatut.set('');
    this.currentPage.set(1);
    this.loadCommandes();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadCommandes();
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCommandes();
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected openDetail(commande: AgenceCommande): void {
    this.detailOpen.set(true);
    this.selectedCommande.set(null);
    this.detailLoading.set(true);
    this.detailError.set('');

    this.agenceSession.loadCommande(commande.id).subscribe({
      next: (response) => {
        this.selectedCommande.set(parseAgenceCommandeDetailResponse(response));
        this.detailLoading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.detailError.set('backoffice.commandes.authRequired');
        } else {
          this.detailError.set(this.resolveDetailError(error as HttpErrorResponse));
        }
        this.detailLoading.set(false);
      },
    });
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.selectedCommande.set(null);
    this.detailLoading.set(false);
    this.detailError.set('');
  }

  protected onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDetail();
    }
  }

  protected statusKey(statut: string): string {
    const normalized = statut.trim().toLowerCase();
    if (normalized === 'confirmée' || normalized === 'confirmee') {
      return 'backoffice.commandes.status.confirmee';
    }
    if (normalized === 'annulée' || normalized === 'annulee') {
      return 'backoffice.commandes.status.annulee';
    }
    if (normalized === 'réservée' || normalized === 'reservee') {
      return 'backoffice.commandes.status.reservee';
    }
    if (normalized === 'en_attente') {
      return 'backoffice.commandes.status.en_attente';
    }
    return 'backoffice.commandes.status.unknown';
  }

  protected statusClass(statut: string): string {
    const normalized = statut.trim().toLowerCase();
    if (normalized === 'confirmée' || normalized === 'confirmee') {
      return 'bg-verga-success-muted text-verga-success';
    }
    if (normalized === 'annulée' || normalized === 'annulee') {
      return 'bg-verga-surface text-verga-muted';
    }
    if (normalized === 'réservée' || normalized === 'reservee') {
      return 'bg-verga-primary-muted text-verga-primary';
    }
    return 'bg-amber-50 text-amber-800';
  }

  protected exportExcel(): void {
    const rows = this.buildExportRows();
    if (rows.length <= 1) {
      return;
    }

    const tableRows = rows
      .map(
        (row, index) =>
          `<tr>${row.map((cell) => (index === 0 ? `<th>${this.escapeHtml(cell)}</th>` : `<td>${this.escapeHtml(cell)}</td>`)).join('')}</tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1">${tableRows}</table></body></html>`;
    this.downloadFile(html, 'commandes-agence.xls', 'application/vnd.ms-excel;charset=utf-8');
  }

  protected exportPdf(): void {
    const rows = this.buildExportRows();
    if (rows.length <= 1) {
      return;
    }

    const title = this.language.translate('backoffice.commandes.title');
    const tableRows = rows
      .map(
        (row, index) =>
          `<tr>${row.map((cell) => (index === 0 ? `<th>${this.escapeHtml(cell)}</th>` : `<td>${this.escapeHtml(cell)}</td>`)).join('')}</tr>`,
      )
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${this.escapeHtml(title)}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
  h1 { font-size: 20px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  th { background: #f3f4f6; }
</style>
</head>
<body>
<h1>${this.escapeHtml(title)}</h1>
<table>${tableRows}</table>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  private loadCommandes(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.commandes.authRequired');
      this.commandes.set([]);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.unauthenticated.set(false);

    const statut = this.filterStatut();
    this.agenceSession
      .loadCommandes({
        search: this.filterSearch().trim() || undefined,
        statut: statut || undefined,
        page: this.currentPage(),
        per_page: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const page = parseAgenceCommandesListResponse(response);
          this.commandes.set(page.items);
          this.currentPage.set(page.currentPage);
          this.totalPages.set(page.lastPage);
          this.totalItems.set(page.total);
          this.resultsFrom.set(page.from);
          this.resultsTo.set(page.to);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse | Error) => {
          if (error instanceof Error && error.message === 'No agence token') {
            this.unauthenticated.set(true);
            this.errorMessage.set('backoffice.commandes.authRequired');
          } else {
            this.errorMessage.set(this.resolveLoadError(error as HttpErrorResponse));
          }
          this.commandes.set([]);
          this.loading.set(false);
        },
      });
  }

  private buildExportRows(): string[][] {
    const t = (key: string) => this.language.translate(key);
    const header = [
      t('backoffice.commandes.colCode'),
      t('backoffice.commandes.colClient'),
      t('backoffice.commandes.colQuantity'),
      t('backoffice.commandes.colAmount'),
      t('backoffice.commandes.colStatus'),
      t('backoffice.commandes.colDate'),
    ];

    const data = this.commandes().map((commande) => [
      commande.code,
      commande.client || '—',
      commande.quantite,
      commande.montant,
      t(this.statusKey(commande.statut)),
      commande.date,
    ]);

    return [header, ...data];
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob(['\ufeff', content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private resolveLoadError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.commandes.authRequired';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.commandes.loadError';
  }

  private resolveDetailError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.commandes.authRequired';
    }
    if (error.status === 404) {
      return 'backoffice.commandes.detailNotFound';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.commandes.detailLoadError';
  }
}
