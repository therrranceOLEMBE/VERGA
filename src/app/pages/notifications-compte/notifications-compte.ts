import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface NotificationItem {
  id: string;
  titleKey: string;
  descKey: string;
  date: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications-compte',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './notifications-compte.html',
  styleUrl: './notifications-compte.css',
})
export class NotificationsCompte {
  protected emailNotif = true;
  protected smsNotif = false;
  protected offerNotif = true;
  protected transactionNotif = true;

  protected readonly notifications = signal<NotificationItem[]>([
    { id: '1', titleKey: 'backoffice.notifications.item1Title', descKey: 'backoffice.notifications.item1Desc', date: '2026-06-04', read: false },
    { id: '2', titleKey: 'backoffice.notifications.item2Title', descKey: 'backoffice.notifications.item2Desc', date: '2026-06-03', read: true },
    { id: '3', titleKey: 'backoffice.notifications.item3Title', descKey: 'backoffice.notifications.item3Desc', date: '2026-06-01', read: true },
  ]);

  protected onSavePreferences(event: Event): void {
    event.preventDefault();
  }

  protected markAllRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }
}
