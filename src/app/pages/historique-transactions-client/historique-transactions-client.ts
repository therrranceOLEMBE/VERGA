import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/transaction.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { ClientSessionService } from '../../services/client-session.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-historique-transactions-client',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './historique-transactions-client.html',
  styleUrl: './historique-transactions-client.css',
})
export class HistoriqueTransactionsClient {
  private readonly language = inject(LanguageService);
  private readonly clientSession = inject(ClientSessionService);
  private readonly transactionService = inject(TransactionService);

  protected readonly filterCode = signal('');
  protected readonly filterDate = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 5;

  protected readonly filteredTransactions = computed(() => {
    const code = this.filterCode().trim().toLowerCase();
    const date = this.filterDate();
    const clientEmail = this.clientSession.client().email;

    return this.transactionService.getByClientEmail(clientEmail).filter((tx) => {
      if (code && !tx.code.toLowerCase().includes(code)) return false;
      if (date && tx.date !== date) return false;
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
      return this.language.translate('clientBackoffice.transactions.empty');
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return this.language.translate('clientBackoffice.transactions.results', { start, end, total });
  });

  protected resetFilters(): void {
    this.filterCode.set('');
    this.filterDate.set('');
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

  protected quantityLabel(tx: Transaction): string {
    if (tx.cubicMeters) {
      return `${tx.cubicMeters} m³`;
    }
    if (tx.kilos > 0) {
      return `${tx.kilos} kg`;
    }
    return '—';
  }
}
