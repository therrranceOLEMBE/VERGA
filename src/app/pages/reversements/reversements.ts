import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgenceReversement, AgenceReversementStatut } from '../../models/agence-reversement.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { parseAgenceReversementsListResponse } from '../../utils/agence-reversement.util';

@Component({
  selector: 'app-reversements',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './reversements.html',
  styleUrl: './reversements.css',
})
export class Reversements implements OnInit {
  private readonly language = inject(LanguageService);
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly filterStatut = signal<AgenceReversementStatut | ''>('');
  protected readonly filterPeriode = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 15;

  protected readonly reversements = signal<AgenceReversement[]>([]);
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
      return this.language.translate('backoffice.reversements.empty');
    }
    return this.language.translate('backoffice.reversements.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statutOptions: Array<{ value: AgenceReversementStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'backoffice.reversements.filterStatusAll' },
    { value: 'en_attente', labelKey: 'backoffice.reversements.status.en_attente' },
    { value: 'effectué', labelKey: 'backoffice.reversements.status.effectue' },
  ];

  ngOnInit(): void {
    this.loadReversements();
  }

  protected resetFilters(): void {
    this.filterStatut.set('');
    this.filterPeriode.set('');
    this.currentPage.set(1);
    this.loadReversements();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadReversements();
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadReversements();
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
      return 'backoffice.reversements.status.en_attente';
    }
    if (statut === 'effectué') {
      return 'backoffice.reversements.status.effectue';
    }
    return 'backoffice.reversements.status.unknown';
  }

  protected statusClass(statut: string): string {
    if (statut === 'effectué') {
      return 'bg-verga-success-muted text-verga-success';
    }
    if (statut === 'en_attente') {
      return 'bg-amber-50 text-amber-700';
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
    this.downloadFile(html, 'reversements-agence.xls', 'application/vnd.ms-excel;charset=utf-8');
  }

  protected exportPdf(): void {
    const rows = this.buildExportRows();
    if (rows.length <= 1) {
      return;
    }

    const title = this.language.translate('backoffice.reversements.title');
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

  private loadReversements(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.reversements.authRequired');
      this.reversements.set([]);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.unauthenticated.set(false);

    const statut = this.filterStatut();
    const periode = this.filterPeriode().trim();

    this.agenceSession
      .loadReversements({
        statut: statut || undefined,
        periode: periode || undefined,
        page: this.currentPage(),
        per_page: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const page = parseAgenceReversementsListResponse(response);
          this.reversements.set(page.items);
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
            this.errorMessage.set('backoffice.reversements.authRequired');
          } else {
            this.errorMessage.set(this.resolveLoadError(error as HttpErrorResponse));
          }
          this.reversements.set([]);
          this.loading.set(false);
        },
      });
  }

  private buildExportRows(): string[][] {
    const t = (key: string) => this.language.translate(key);
    const header = [
      t('backoffice.reversements.colId'),
      t('backoffice.reversements.colAmount'),
      t('backoffice.reversements.colPeriod'),
      t('backoffice.reversements.colStatus'),
      t('backoffice.reversements.colEffectueLe'),
      t('backoffice.reversements.colCreatedAt'),
    ];

    const data = this.reversements().map((item) => [
      item.id,
      item.montant,
      item.periode,
      item.statut ? t(this.statusKey(item.statut)) : '—',
      item.effectueLe,
      item.createdAt,
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
      return 'backoffice.reversements.authRequired';
    }
    if (error.status === 403) {
      return 'backoffice.reversements.accessDenied';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.reversements.loadError';
  }
}
