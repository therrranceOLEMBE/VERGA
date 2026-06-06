import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface MetricCard {
  labelKey: string;
  value: string;
  icon: 'offers' | 'kilos' | 'revenue' | 'subscribers';
}

interface PeriodCounts {
  day: number;
  week: number;
  month: number;
  year: number;
}

@Component({
  selector: 'app-tableau-de-bord',
  imports: [TranslatePipe],
  templateUrl: './tableau-de-bord.html',
  styleUrl: './tableau-de-bord.css',
})
export class TableauDeBord {
  protected readonly metrics: MetricCard[] = [
    { labelKey: 'backoffice.dashboard.activeOffers', value: '12', icon: 'offers' },
    { labelKey: 'backoffice.dashboard.subscribers', value: '248', icon: 'subscribers' },
    { labelKey: 'backoffice.dashboard.kilosMonth', value: '385 kg', icon: 'kilos' },
    { labelKey: 'backoffice.dashboard.kilosYear', value: '2 450 kg', icon: 'kilos' },
    { labelKey: 'backoffice.dashboard.revenueMonth', value: '1,8 M F CFA', icon: 'revenue' },
    { labelKey: 'backoffice.dashboard.revenueYear', value: '18,6 M F CFA', icon: 'revenue' },
  ];

  protected readonly reservationCounts: PeriodCounts = {
    day: 5,
    week: 18,
    month: 42,
    year: 312,
  };

  protected readonly purchaseCounts: PeriodCounts = {
    day: 3,
    week: 12,
    month: 28,
    year: 245,
  };

  protected readonly cancellationCounts: PeriodCounts = {
    day: 1,
    week: 2,
    month: 3,
    year: 18,
  };

  protected readonly periodColumns = [
    { key: 'day' as const, labelKey: 'backoffice.dashboard.periodDay' },
    { key: 'week' as const, labelKey: 'backoffice.dashboard.periodWeek' },
    { key: 'month' as const, labelKey: 'backoffice.dashboard.periodMonth' },
    { key: 'year' as const, labelKey: 'backoffice.dashboard.periodYear' },
  ];

}
