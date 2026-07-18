import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgencePaiement, AgencePaiementStatut } from '../../models/agence-paiement.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { parseAgencePaiementsListResponse } from '../../utils/agence-paiement.util';

@Component({
  selector: 'app-paiements',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './paiements.html',
  styleUrl: './paiements.css',
})
export class Paiements implements OnInit {
  private readonly language = inject(LanguageService);
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly filterSearch = signal('');
  protected readonly filterStatut = signal<AgencePaiementStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 15;

  protected readonly paiements = signal<AgencePaiement[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.totalItems();
    if (total === 0) {
      return this.language.translate('backoffice.payments.empty');
    }
    return this.language.translate('backoffice.payments.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statutOptions: Array<{ value: AgencePaiementStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'backoffice.payments.filterStatusAll' },
    { value: 'en_attente', labelKey: 'backoffice.payments.status.en_attente' },
    { value: 'validé', labelKey: 'backoffice.payments.status.valide' },
    { value: 'remboursé', labelKey: 'backoffice.payments.status.rembourse' },
    { value: 'échec', labelKey: 'backoffice.payments.status.echec' },
  ];

  ngOnInit(): void {
    this.loadPaiements();
  }

  protected resetFilters(): void {
    this.filterSearch.set('');
    this.filterStatut.set('');
    this.currentPage.set(1);
    this.loadPaiements();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadPaiements();
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPaiements();
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected statusKey(statut: string): string {
    if (statut === 'en_attente') {
      return 'backoffice.payments.status.en_attente';
    }
    if (statut === 'validé') {
      return 'backoffice.payments.status.valide';
    }
    if (statut === 'remboursé') {
      return 'backoffice.payments.status.rembourse';
    }
    if (statut === 'échec') {
      return 'backoffice.payments.status.echec';
    }
    return 'backoffice.payments.status.unknown';
  }

  protected statusClass(statut: string): string {
    if (statut === 'validé') {
      return 'bg-verga-success-muted text-verga-success';
    }
    if (statut === 'en_attente') {
      return 'bg-verga-primary-muted text-verga-primary';
    }
    if (statut === 'remboursé') {
      return 'bg-amber-50 text-amber-700';
    }
    if (statut === 'échec') {
      return 'bg-verga-surface text-verga-muted';
    }
    return 'bg-verga-surface text-verga-muted';
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
    this.downloadFile(html, 'paiements-agence.xls', 'application/vnd.ms-excel;charset=utf-8');
  }

  protected exportPdf(): void {
    const rows = this.buildExportRows();
    if (rows.length <= 1) {
      return;
    }

    const title = this.language.translate('backoffice.payments.title');
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

  private loadPaiements(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.payments.authRequired');
      this.paiements.set([]);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.unauthenticated.set(false);

    const statut = this.filterStatut();
    this.agenceSession
      .loadPaiements({
        search: this.filterSearch().trim() || undefined,
        statut: statut || undefined,
        page: this.currentPage(),
        per_page: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const page = parseAgencePaiementsListResponse(response);
          console.log('[AgencePaiements] Paiements récupérés:', page.items);
          console.log('[AgencePaiements] Pagination:', {
            currentPage: page.currentPage,
            lastPage: page.lastPage,
            total: page.total,
            from: page.from,
            to: page.to,
          });
          this.paiements.set(page.items);
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
            this.errorMessage.set('backoffice.payments.authRequired');
          } else {
            this.errorMessage.set(this.resolveLoadError(error as HttpErrorResponse));
          }
          this.paiements.set([]);
          this.loading.set(false);
        },
      });
  }

  private buildExportRows(): string[][] {
    const t = (key: string) => this.language.translate(key);
    const header = [
      t('backoffice.payments.colCodeVerga'),
      t('backoffice.payments.colCommande'),
      t('backoffice.payments.colAmount'),
      t('backoffice.payments.colStatus'),
      t('backoffice.payments.colDate'),
    ];

    const data = this.paiements().map((paiement) => [
      paiement.codeVerga,
      paiement.commande,
      paiement.montant,
      paiement.statut ? t(this.statusKey(paiement.statut)) : '—',
      paiement.date,
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
      return 'backoffice.payments.authRequired';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.payments.loadError';
  }
}
