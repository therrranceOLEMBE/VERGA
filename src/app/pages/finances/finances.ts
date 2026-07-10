import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgenceSoldeView } from '../../models/agence-solde.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';
import { extractApiErrorMessage } from '../../utils/api-error.util';
import { parseAgenceSoldeResponse } from '../../utils/agence-solde.util';

interface FinanceMetric {
  labelKey: string;
  value: string;
  hintKey: string;
  accent: 'primary' | 'success' | 'warning' | 'neutral';
}

@Component({
  selector: 'app-finances',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './finances.html',
  styleUrl: './finances.css',
})
export class Finances implements OnInit {
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly unauthenticated = signal(false);
  protected readonly solde = signal<AgenceSoldeView | null>(null);

  protected readonly highlights = computed<FinanceMetric[]>(() => {
    const data = this.solde();
    if (!data) {
      return [];
    }

    return [
      {
        labelKey: 'backoffice.finances.availableBalance',
        value: data.disponible,
        hintKey: 'backoffice.finances.availableBalanceHint',
        accent: 'primary',
      },
      {
        labelKey: 'backoffice.finances.balance',
        value: data.solde,
        hintKey: 'backoffice.finances.balanceHint',
        accent: 'success',
      },
      {
        labelKey: 'backoffice.finances.pendingPayouts',
        value: data.reversementsEnAttente,
        hintKey: 'backoffice.finances.pendingPayoutsHint',
        accent: 'warning',
      },
    ];
  });

  protected readonly breakdown = computed<FinanceMetric[]>(() => {
    const data = this.solde();
    if (!data) {
      return [];
    }

    return [
      {
        labelKey: 'backoffice.finances.validPayments',
        value: data.paiementsValides,
        hintKey: 'backoffice.finances.validPaymentsHint',
        accent: 'neutral',
      },
      {
        labelKey: 'backoffice.finances.payouts',
        value: data.reversements,
        hintKey: 'backoffice.finances.payoutsHint',
        accent: 'neutral',
      },
      {
        labelKey: 'backoffice.finances.balance',
        value: data.solde,
        hintKey: 'backoffice.finances.balanceHint',
        accent: 'neutral',
      },
      {
        labelKey: 'backoffice.finances.pendingPayouts',
        value: data.reversementsEnAttente,
        hintKey: 'backoffice.finances.pendingPayoutsHint',
        accent: 'neutral',
      },
      {
        labelKey: 'backoffice.finances.availableBalance',
        value: data.disponible,
        hintKey: 'backoffice.finances.availableBalanceHint',
        accent: 'neutral',
      },
    ];
  });

  ngOnInit(): void {
    this.loadSolde();
  }

  protected refresh(): void {
    if (this.loading()) {
      return;
    }
    this.loadSolde();
  }

  private loadSolde(): void {
    if (!this.agenceSession.isAuthenticated()) {
      this.loading.set(false);
      this.unauthenticated.set(true);
      this.errorMessage.set('backoffice.finances.authRequired');
      return;
    }

    this.unauthenticated.set(false);
    this.loading.set(true);
    this.errorMessage.set('');

    this.agenceSession.loadSolde().subscribe({
      next: (response) => {
        this.solde.set(parseAgenceSoldeResponse(response));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'No agence token') {
          this.unauthenticated.set(true);
          this.errorMessage.set('backoffice.finances.authRequired');
        } else {
          this.errorMessage.set(this.resolveLoadError(error as HttpErrorResponse));
        }
        this.loading.set(false);
      },
    });
  }

  private resolveLoadError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'backoffice.finances.authRequired';
    }
    if (error.status === 403) {
      return 'backoffice.finances.accessDenied';
    }
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }
    return 'backoffice.finances.loadError';
  }
}
