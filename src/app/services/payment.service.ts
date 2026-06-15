import { Injectable, signal } from '@angular/core';
import { Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly payments = signal<Payment[]>([
    {
      id: '1',
      transactionId: '3c4eda28-0203-4094-b4e3-b61ac44071f4',
      merchantBillingId: 'SEEG-PP-20260612111425660-8C27FA77',
      bambooBillingId: 'TXN-2026-SNV-00562',
      clientName: 'MME. MATHILDE ROSELINE MABYOGHOMALIPANGOU',
      clientEmail: 'mathilde.mabyoghomali@gmail.com',
      amount: '5 000 F CFA',
      date: '2026-06-12',
      statut: 'SUCCES',
      message: 'Paiement effectué avec succès',
    },
    {
      id: '2',
      transactionId: 'a91bc2de-4411-4f8a-9c12-7e5d8a901234',
      merchantBillingId: 'SEEG-PP-20260610104512345-A1B2C3D4',
      bambooBillingId: 'TXN-2026-SNV-00548',
      clientName: 'Jean-Baptiste N.',
      clientEmail: 'jb.nguessan@outlook.fr',
      amount: '10 000 F CFA',
      date: '2026-06-10',
      statut: 'SUCCES',
      message: 'Paiement effectué avec succès',
    },
    {
      id: '3',
      transactionId: 'f2e8c1a0-7788-4b2c-9d1e-334455667788',
      merchantBillingId: 'SEEG-PP-20260608153298765-E5F6G7H8',
      bambooBillingId: 'TXN-2026-SNV-00531',
      clientName: 'Marie Diallo',
      clientEmail: 'marie.diallo@gmail.com',
      amount: '3 500 F CFA',
      date: '2026-06-08',
      statut: 'EN_ATTENTE',
      message: 'Paiement en cours de traitement',
    },
    {
      id: '4',
      transactionId: '11223344-5566-7788-99aa-bbccddeeff00',
      merchantBillingId: 'SEEG-PP-20260605121054321-I9J0K1L2',
      bambooBillingId: 'TXN-2026-SNV-00512',
      clientName: 'Sophie Amani',
      clientEmail: 'sophie.amani@yahoo.fr',
      amount: '7 500 F CFA',
      date: '2026-06-05',
      statut: 'ECHEC',
      message: 'Paiement refusé par la banque',
    },
    {
      id: '5',
      transactionId: '99887766-5544-3322-1100-aabbccddeeff',
      merchantBillingId: 'SEEG-PP-20260528140876543-M3N4O5P6',
      bambooBillingId: 'TXN-2026-SNV-00498',
      clientName: 'Amadou Traoré',
      clientEmail: 'amadou.traore@hotmail.ca',
      amount: '15 000 F CFA',
      date: '2026-05-28',
      statut: 'SUCCES',
      message: 'Paiement effectué avec succès',
    },
  ]);

  list(): Payment[] {
    return this.payments();
  }
}
