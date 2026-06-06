import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/transaction.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-support-logistique',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './support-logistique.html',
  styleUrl: './support-logistique.css',
})
export class SupportLogistique {
  private readonly language = inject(LanguageService);
  private readonly transactionService = inject(TransactionService);

  protected readonly filterName = signal('');
  protected readonly filterCode = signal('');
  protected readonly filterStatus = signal('');
  protected readonly filterDate = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 5;

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

    return this.transactionService.list().filter((tx) => {
      if (name && !tx.name.toLowerCase().includes(name)) return false;
      if (code && !tx.code.toLowerCase().includes(code)) return false;
      if (status && tx.status !== status) return false;
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
      return this.language.translate('backoffice.supportLogistics.empty');
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return this.language.translate('backoffice.supportLogistics.results', { start, end, total });
  });

  protected resetFilters(): void {
    this.filterName.set('');
    this.filterCode.set('');
    this.filterStatus.set('');
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

  protected statusKey(status: Transaction['status']): string {
    return `backoffice.transactions.status.${status}`;
  }

  protected yesNoKey(value: boolean): string {
    return value ? 'backoffice.transactions.yes' : 'backoffice.transactions.no';
  }

  protected canValidateDeposited(tx: Transaction): boolean {
    return tx.status !== 'annule' && !tx.depositedAtAgency;
  }

  protected canValidateArrived(tx: Transaction): boolean {
    return tx.status !== 'annule' && tx.depositedAtAgency && !tx.arrivedInDestination;
  }

  protected canValidatePickedUp(tx: Transaction): boolean {
    return tx.status !== 'annule' && tx.arrivedInDestination && !tx.pickedUpByClient;
  }

  protected validateDeposited(tx: Transaction): void {
    this.transactionService.validateDeposited(tx.id);
  }

  protected validateArrived(tx: Transaction): void {
    this.transactionService.validateArrived(tx.id);
  }

  protected validatePickedUp(tx: Transaction): void {
    this.transactionService.validatePickedUp(tx.id);
  }
}
