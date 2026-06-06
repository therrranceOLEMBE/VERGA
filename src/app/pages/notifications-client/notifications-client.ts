import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface ClientNotificationItem {
  id: string;
  titleKey: string;
  descKey: string;
  date: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications-client',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './notifications-client.html',
  styleUrl: './notifications-client.css',
})
export class NotificationsClient {
  protected emailNotif = true;
  protected smsNotif = true;
  protected shipmentNotif = true;
  protected promoNotif = false;

  protected readonly notifications = signal<ClientNotificationItem[]>([
    { id: '1', titleKey: 'clientBackoffice.notifications.item1Title', descKey: 'clientBackoffice.notifications.item1Desc', date: '2026-06-04', read: false },
    { id: '2', titleKey: 'clientBackoffice.notifications.item2Title', descKey: 'clientBackoffice.notifications.item2Desc', date: '2026-06-03', read: false },
    { id: '3', titleKey: 'clientBackoffice.notifications.item3Title', descKey: 'clientBackoffice.notifications.item3Desc', date: '2026-06-01', read: true },
  ]);

  protected onSavePreferences(event: Event): void {
    event.preventDefault();
  }

  protected markAllRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }
}
