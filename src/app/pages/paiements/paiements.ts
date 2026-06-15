import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Payment, PaymentStatus } from '../../models/payment.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-paiements',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './paiements.html',
  styleUrl: './paiements.css',
})
export class Paiements {
  private readonly language = inject(LanguageService);
  private readonly paymentService = inject(PaymentService);

  protected readonly filterClient = signal('');
  protected readonly filterReference = signal('');
  protected readonly filterStatus = signal('');
  protected readonly filterDate = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 5;

  protected readonly statusOptions = [
    { value: '', labelKey: 'backoffice.payments.allStatuses' },
    { value: 'SUCCES', labelKey: 'backoffice.payments.status.succes' },
    { value: 'EN_ATTENTE', labelKey: 'backoffice.payments.status.pending' },
    { value: 'ECHEC', labelKey: 'backoffice.payments.status.failed' },
  ];

  protected readonly filteredPayments = computed(() => {
    const client = this.filterClient().trim().toLowerCase();
    const reference = this.filterReference().trim().toLowerCase();
    const status = this.filterStatus();
    const date = this.filterDate();

    return this.paymentService.list().filter((payment) => {
      if (client && !payment.clientName.toLowerCase().includes(client)) {
        return false;
      }
      if (
        reference &&
        !payment.bambooBillingId.toLowerCase().includes(reference) &&
        !payment.transactionId.toLowerCase().includes(reference)
      ) {
        return false;
      }
      if (status && payment.statut !== status) {
        return false;
      }
      if (date && payment.date !== date) {
        return false;
      }
      return true;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredPayments().length / this.pageSize)),
  );

  protected readonly displayedPayments = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.filteredPayments().slice(start, start + this.pageSize);
  });

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const total = this.filteredPayments().length;
    if (total === 0) {
      return '';
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return this.language.translate('backoffice.payments.results', { start, end, total });
  });

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected resetFilters(): void {
    this.filterClient.set('');
    this.filterReference.set('');
    this.filterStatus.set('');
    this.filterDate.set('');
    this.currentPage.set(1);
  }

  protected previousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  protected nextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }

  protected statusKey(status: PaymentStatus): string {
    switch (status) {
      case 'SUCCES':
        return 'backoffice.payments.status.succes';
      case 'EN_ATTENTE':
        return 'backoffice.payments.status.pending';
      case 'ECHEC':
        return 'backoffice.payments.status.failed';
    }
  }

  protected isSuccess(status: PaymentStatus): boolean {
    return status === 'SUCCES';
  }

  protected isPending(status: PaymentStatus): boolean {
    return status === 'EN_ATTENTE';
  }

  protected isFailed(status: PaymentStatus): boolean {
    return status === 'ECHEC';
  }
}
