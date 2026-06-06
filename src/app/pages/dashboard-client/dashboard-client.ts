import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ClientSessionService } from '../../services/client-session.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard-client',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './dashboard-client.html',
  styleUrl: './dashboard-client.css',
})
export class DashboardClient {
  private readonly clientSession = inject(ClientSessionService);
  private readonly transactionService = inject(TransactionService);

  protected readonly clientName = computed(() => this.clientSession.fullName);

  private readonly clientTransactions = computed(() =>
    this.transactionService.getByClientEmail(this.clientSession.client().email),
  );

  protected readonly metrics = computed(() => {
    const list = this.clientTransactions();
    const purchases = list.filter((tx) => tx.status === 'achete').length;
    const reservations = list.filter((tx) => tx.status === 'reserve').length;

    return [
      { labelKey: 'clientBackoffice.dashboard.totalTransactions', value: String(list.length) },
      { labelKey: 'clientBackoffice.dashboard.purchases', value: String(purchases) },
      { labelKey: 'clientBackoffice.dashboard.reservations', value: String(reservations) },
    ];
  });

  protected readonly recentTransactions = computed(() =>
    this.clientTransactions().slice(0, 3),
  );

  protected statusKey(status: string): string {
    return `backoffice.transactions.status.${status}`;
  }
}
