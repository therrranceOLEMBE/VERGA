import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/transaction.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transactions',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  private readonly language = inject(LanguageService);
  private readonly transactionService = inject(TransactionService);

  protected readonly filterName = signal('');
  protected readonly filterCode = signal('');
  protected readonly filterStatus = signal('');
  protected readonly filterDate = signal('');
  protected readonly filterYear = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 5;

  protected readonly yearOptions = ['', '2026', '2025', '2024'];

  protected readonly statusOptions = [
    { value: '', labelKey: 'backoffice.transactions.allStatuses' },
    { value: 'achete', labelKey: 'backoffice.transactions.status.achete' },
    { value: 'reserve', labelKey: 'backoffice.transactions.status.reserve' },
    { value: 'annule', labelKey: 'backoffice.transactions.status.annule' },
  ];

  protected readonly filteredTransactions = computed(() => {
    const name = this.filterName().trim().toLowerCase();
    const code = this.filterCode().trim().toLowerCase();
    const status = this.filterStatus();
    const date = this.filterDate();
    const year = this.filterYear();

    return this.transactionService.list().filter((tx) => {
      if (name && !tx.name.toLowerCase().includes(name)) return false;
      if (code && !tx.code.toLowerCase().includes(code)) return false;
      if (status && tx.status !== status) return false;
      if (date && tx.date !== date) return false;
      if (year && String(tx.year) !== year) return false;
      return true;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTransactions().length / this.pageSize)),
  );

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  protected readonly displayedTransactions = computed(() => {
    const list = this.filteredTransactions();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const list = this.filteredTransactions();
    const total = list.length;
    if (total === 0) {
      return this.language.translate('backoffice.transactions.empty');
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return this.language.translate('backoffice.transactions.results', { start, end, total });
  });

  protected resetFilters(): void {
    this.filterName.set('');
    this.filterCode.set('');
    this.filterStatus.set('');
    this.filterDate.set('');
    this.filterYear.set('');
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected statusKey(status: Transaction['status']): string {
    return `backoffice.transactions.status.${status}`;
  }

  protected yesNoKey(value: boolean): string {
    return value ? 'backoffice.transactions.yes' : 'backoffice.transactions.no';
  }

  protected exportCsv(): void {
    const rows = this.buildExportRows();
    if (rows.length <= 1) return;

    const content = rows.map((row) => row.map((cell) => this.escapeCsv(cell)).join(';')).join('\n');
    this.downloadFile(content, 'transactions.csv', 'text/csv;charset=utf-8');
  }

  protected exportExcel(): void {
    const rows = this.buildExportRows();
    if (rows.length <= 1) return;

    const tableRows = rows
      .map(
        (row, index) =>
          `<tr>${row.map((cell) => (index === 0 ? `<th>${this.escapeHtml(cell)}</th>` : `<td>${this.escapeHtml(cell)}</td>`)).join('')}</tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1">${tableRows}</table></body></html>`;
    this.downloadFile(html, 'transactions.xls', 'application/vnd.ms-excel;charset=utf-8');
  }

  protected exportPdf(): void {
    const rows = this.buildExportRows();
    if (rows.length <= 1) return;

    const title = this.language.translate('backoffice.transactions.title');
    const tableRows = rows
      .map(
        (row, index) =>
          `<tr>${row.map((cell) => (index === 0 ? `<th>${this.escapeHtml(cell)}</th>` : `<td>${this.escapeHtml(cell)}</td>`)).join('')}</tr>`,
      )
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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

  private buildExportRows(): string[][] {
    const t = (key: string) => this.language.translate(key);
    const header = [
      t('backoffice.transactions.colCode'),
      t('backoffice.transactions.colName'),
      t('backoffice.transactions.colEmail'),
      t('backoffice.transactions.colPhone'),
      t('backoffice.transactions.colDeparture'),
      t('backoffice.transactions.colArrival'),
      t('backoffice.transactions.colKilos'),
      t('backoffice.transactions.colPackageDescription'),
      t('backoffice.transactions.colDate'),
      t('backoffice.transactions.colYear'),
      t('backoffice.transactions.colAmount'),
      t('backoffice.transactions.colDeposited'),
      t('backoffice.transactions.colArrived'),
      t('backoffice.transactions.colPickedUp'),
      t('backoffice.transactions.colStatus'),
    ];

    const data = this.filteredTransactions().map((tx) => [
      tx.code,
      tx.name,
      tx.email,
      tx.phone,
      tx.departureCountry,
      tx.arrivalCountry,
      `${tx.kilos} kg`,
      tx.packageDescription,
      tx.date,
      String(tx.year),
      tx.amount,
      t(this.yesNoKey(tx.depositedAtAgency)),
      t(this.yesNoKey(tx.arrivedInDestination)),
      t(this.yesNoKey(tx.pickedUpByClient)),
      t(this.statusKey(tx.status)),
    ]);

    return [header, ...data];
  }

  private escapeCsv(value: string): string {
    const normalized = value.replace(/"/g, '""');
    return /[;"\n]/.test(normalized) ? `"${normalized}"` : normalized;
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
}
