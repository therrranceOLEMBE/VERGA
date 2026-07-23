import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgenceColis, AgenceColisDetail, AgenceColisStatut } from '../../models/agence-colis.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { parseAgenceColisDetailResponse, parseAgenceColisListResponse, isAgenceColisStatut } from '../../utils/agence-colis.util';

@Component({
  selector: 'app-support-logistique',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './support-logistique.html',
  styleUrl: './support-logistique.css',
})
export class SupportLogistique implements OnInit {
  private readonly language = inject(LanguageService);
  private readonly agenceSession = inject(AgenceSessionService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly filterSearch = signal('');
  protected readonly filterStatut = signal<AgenceColisStatut | ''>('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 15;

  protected readonly colis = signal<AgenceColis[]>([]);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly resultsFrom = signal(0);
  protected readonly resultsTo = signal(0);

  protected readonly detailOpen = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');
  protected readonly selectedColis = signal<AgenceColisDetail | null>(null);

  protected readonly advanceOpen = signal(false);
  protected readonly advanceLoading = signal(false);
  protected readonly advanceError = signal('');
  protected readonly advanceComment = signal('');
  protected readonly advanceTarget = signal<AgenceColis | null>(null);
  protected readonly updatingColisId = signal('');

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.totalItems();
    if (total === 0) {
      return this.language.translate('backoffice.supportLogistics.empty');
    }
    return this.language.translate('backoffice.supportLogistics.results', {
      start: this.resultsFrom(),
      end: this.resultsTo(),
      total,
    });
  });

  protected readonly statutOptions: Array<{ value: AgenceColisStatut | ''; labelKey: string }> = [
    { value: '', labelKey: 'backoffice.supportLogistics.filterStatusAll' },
    { value: 'chez_client', labelKey: 'backoffice.supportLogistics.status.chez_client' },
    { value: 'déposé', labelKey: 'backoffice.supportLogistics.status.depose' },
    { value: 'en_transit', labelKey: 'backoffice.supportLogistics.status.en_transit' },
    { value: 'arrivé', labelKey: 'backoffice.supportLogistics.status.arrive' },
    { value: 'récupéré', labelKey: 'backoffice.supportLogistics.status.recupere' },
  ];

  ngOnInit(): void {
    this.loadColis();
  }

  protected resetFilters(): void {
    this.filterSearch.set('');
    this.filterStatut.set('');
    this.currentPage.set(1);
    this.loadColis();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadColis();
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadColis();
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected statusKey(statut: string): string {
    if (statut === 'chez_client') {
      return 'backoffice.supportLogistics.status.chez_client';
    }
    if (statut === 'déposé') {
      return 'backoffice.supportLogistics.status.depose';
    }
    if (statut === 'en_transit') {
      return 'backoffice.supportLogistics.status.en_transit';
    }
    if (statut === 'arrivé') {
      return 'backoffice.supportLogistics.status.arrive';
    }
    if (statut === 'récupéré') {
      return 'backoffice.supportLogistics.status.recupere';
    }
    return 'backoffice.supportLogistics.status.unknown';
  }

  protected statusClass(statut: string): string {
    if (statut === 'récupéré') {
      return 'bg-verga-success-muted text-verga-success';
    }
    if (statut === 'arrivé') {
      return 'bg-verga-primary-muted text-verga-primary';
    }
    if (statut === 'en_transit') {
      return 'bg-amber-50 text-amber-700';
    }
    if (statut === 'chez_client') {
      return 'bg-sky-50 text-sky-700';
    }
    return 'bg-verga-surface text-verga-muted';
  }

  protected openDetail(item: AgenceColis): void {
    this.detailOpen.set(true);
    this.selectedColis.set({ ...item, historique: [] });
    this.detailLoading.set(true);
    this.detailError.set('');

    this.agenceSession.loadColisDetail(item.id).subscribe({
      next: (response) => {
        this.selectedColis.set(parseAgenceColisDetailResponse(response));
        this.detailLoading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.detailError.set('backoffice.supportLogistics.authRequired');
          this.detailLoading.set(false);
          return;
        }
        const httpError = error as HttpErrorResponse;
        if (httpError.status === 404) {
          this.selectedColis.set({ ...item, historique: [] });
          this.detailLoading.set(false);
          return;
        }
        this.detailError.set(this.resolveDetailError(httpError));
        this.detailLoading.set(false);
      },
    });
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.selectedColis.set(null);
    this.detailLoading.set(false);
    this.detailError.set('');
  }

  protected onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDetail();
    }
  }

  protected canAdvance(item: AgenceColis | AgenceColisDetail): boolean {
    return Boolean(item.nextStatut?.trim());
  }

  protected canViewCommande(item: AgenceColis | AgenceColisDetail): boolean {
    return Boolean(item.commandeId.trim()) || (item.commande.length > 0 && item.commande !== '—');
  }

  protected viewCommande(item: AgenceColis | AgenceColisDetail): void {
    if (!this.canViewCommande(item)) {
      return;
    }
    void this.router.navigate(['/backoffice/commandes'], {
      queryParams: { search: item.commande !== '—' ? item.commande : item.commandeId },
    });
  }

  protected isUpdating(itemId: string): boolean {
    return this.updatingColisId() === itemId;
  }

  protected advanceActionLabel(nextStatut: string): string {
    return this.language.translate('backoffice.supportLogistics.actionAdvanceTo', {
      statut: this.language.translate(this.statusKey(nextStatut)),
    });
  }

  protected advanceModalSubtitle(target: AgenceColis): string {
    return this.language.translate('backoffice.supportLogistics.advanceModalSubtitle', {
      reference: target.reference,
      statut: this.language.translate(this.statusKey(target.nextStatut)),
    });
  }

  protected openAdvance(item: AgenceColis | AgenceColisDetail): void {
    if (!this.canAdvance(item)) {
      return;
    }
    this.advanceTarget.set({
      id: item.id,
      reference: item.reference,
      commande: item.commande,
      commandeId: item.commandeId,
      commandeQuantite: item.commandeQuantite,
      description: item.description,
      agence: item.agence,
      poids: item.poids,
      volume: item.volume,
      statut: item.statut,
      createdAt: item.createdAt,
      photos: item.photos,
      nextStatut: item.nextStatut,
    });
    this.advanceComment.set('');
    this.advanceError.set('');
    this.advanceOpen.set(true);
  }

  protected closeAdvance(): void {
    this.advanceOpen.set(false);
    this.advanceTarget.set(null);
    this.advanceComment.set('');
    this.advanceError.set('');
    this.advanceLoading.set(false);
  }

  protected onAdvanceBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.advanceLoading()) {
      this.closeAdvance();
    }
  }

  protected confirmAdvance(): void {
    const target = this.advanceTarget();
    if (!target || !this.canAdvance(target)) {
      return;
    }

    const nextStatut = target.nextStatut.trim();
    if (!isAgenceColisStatut(nextStatut)) {
      this.advanceError.set('backoffice.supportLogistics.advanceStatusInvalid');
      return;
    }

    const commentaire = this.advanceComment().trim();
    const payload = {
      statut: nextStatut,
      ...(commentaire ? { commentaire } : {}),
    };

    this.advanceLoading.set(true);
    this.advanceError.set('');
    this.updatingColisId.set(target.id);

    this.agenceSession.advanceColisStatut(target.id, payload).subscribe({
      next: (response) => {
        const updated = parseAgenceColisDetailResponse(response);
        this.applyColisUpdate(updated);
        this.advanceLoading.set(false);
        this.updatingColisId.set('');
        this.closeAdvance();
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.advanceError.set('backoffice.supportLogistics.authRequired');
        } else {
          this.advanceError.set(this.resolveAdvanceError(error as HttpErrorResponse));
        }
        this.advanceLoading.set(false);
        this.updatingColisId.set('');
      },
    });
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
    this.downloadFile(html, 'colis-agence.xls', 'application/vnd.ms-excel;charset=utf-8');
  }

  protected exportPdf(): void {
    const rows = this.buildExportRows();
    if (rows.length <= 1) {
      return;
    }

    const title = this.language.translate('backoffice.supportLogistics.title');
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

  private loadColis(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.supportLogistics.authRequired');
      this.colis.set([]);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.unauthenticated.set(false);

    const statut = this.filterStatut();
    this.agenceSession
      .loadColis({
        search: this.filterSearch().trim() || undefined,
        statut: statut || undefined,
        page: this.currentPage(),
        per_page: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const page = parseAgenceColisListResponse(response);
          console.log('[AgenceColis] Colis récupérés:', page.items);
          console.log('[AgenceColis] Pagination:', {
            currentPage: page.currentPage,
            lastPage: page.lastPage,
            total: page.total,
            from: page.from,
            to: page.to,
          });
          this.colis.set(page.items);
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
            this.errorMessage.set('backoffice.supportLogistics.authRequired');
          } else {
            this.errorMessage.set(this.resolveLoadError(error as HttpErrorResponse));
          }
          this.colis.set([]);
          this.loading.set(false);
        },
      });
  }

  private buildExportRows(): string[][] {
    const t = (key: string) => this.language.translate(key);
    const header = [
      t('backoffice.supportLogistics.colReference'),
      t('backoffice.supportLogistics.colCommande'),
      t('backoffice.supportLogistics.colDescription'),
      t('backoffice.supportLogistics.colPoids'),
      t('backoffice.supportLogistics.colStatus'),
    ];

    const data = this.colis().map((item) => [
      item.reference,
      item.commande,
      item.description,
      item.poids,
      item.statut ? t(this.statusKey(item.statut)) : '—',
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

  private applyColisUpdate(updated: AgenceColisDetail): void {
    const { historique: _historique, ...row } = updated;

    this.colis.update((items) =>
      items.map((item) => (item.id === updated.id ? row : item)),
    );

    if (this.selectedColis()?.id === updated.id) {
      this.selectedColis.set(updated);
    }
  }

  private resolveLoadError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.supportLogistics.authRequired';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.supportLogistics.loadError';
  }

  private resolveDetailError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.supportLogistics.authRequired';
    }
    if (error.status === 404) {
      return 'backoffice.supportLogistics.detailNotFound';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.supportLogistics.detailLoadError';
  }

  private resolveAdvanceError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.supportLogistics.authRequired';
    }
    if (error.status === 404) {
      return 'backoffice.supportLogistics.detailNotFound';
    }
    if (error.status === 422) {
      return 'backoffice.supportLogistics.advanceStatusInvalid';
    }
    const apiMessage = extractApiErrorMessage(error);
    return apiMessage ?? 'backoffice.supportLogistics.advanceStatusError';
  }
}
