export type PaymentStatus = 'SUCCES' | 'ECHEC' | 'EN_ATTENTE';

export interface Payment {
  id: string;
  transactionId: string;
  merchantBillingId: string;
  bambooBillingId: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  date: string;
  statut: PaymentStatus;
  message: string;
}
