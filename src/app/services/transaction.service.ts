import { Injectable, signal } from '@angular/core';
import { Offer } from '../models/offer.model';
import { Transaction } from '../models/transaction.model';

interface CreateBookingInput {
  offer: Offer;
  action: 'achete' | 'reserve';
  fullName: string;
  email: string;
  phone: string;
  kilos?: number;
  cubicMeters?: number;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly transactions = signal<Transaction[]>([
    { id: '1', code: 'TRX-2026-00142', name: 'Kouassi Logistics', email: 'contact@kouassi-logistics.ci', phone: '+225 07 12 34 56 78', departureCountry: "Côte d'Ivoire", arrivalCountry: 'France', kilos: 120, cubicMeters: null, packageDescription: 'Équipements informatiques et accessoires', date: '2026-06-04', year: 2026, amount: '780 000 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
    { id: '2', code: 'TRX-2026-00138', name: 'Marie Diallo', email: 'marie.diallo@gmail.com', phone: '+225 05 98 76 54 32', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Sénégal', kilos: 25, cubicMeters: null, packageDescription: 'Vêtements et articles personnels', date: '2026-06-03', year: 2026, amount: '48 500 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: false },
    { id: '3', code: 'TRX-2026-00121', name: 'Transit Express CI', email: 'ops@transit-express.ci', phone: '+225 01 45 67 89 01', departureCountry: "Côte d'Ivoire", arrivalCountry: 'États-Unis', kilos: 350, cubicMeters: null, packageDescription: 'Matériel industriel et pièces détachées', date: '2026-06-01', year: 2026, amount: '2 975 000 F CFA', status: 'reserve', depositedAtAgency: true, arrivedInDestination: false, pickedUpByClient: false },
    { id: '4', code: 'TRX-2025-00987', name: 'Jean-Baptiste N.', email: 'jb.nguessan@outlook.fr', phone: '+33 6 12 34 56 78', departureCountry: 'France', arrivalCountry: "Côte d'Ivoire", kilos: 45, cubicMeters: null, packageDescription: 'Documents administratifs et effets personnels', date: '2025-12-18', year: 2025, amount: '72 000 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
    { id: '5', code: 'TRX-2025-00954', name: 'Africa Freight SARL', email: 'info@africa-freight.com', phone: '+233 24 567 8901', departureCountry: 'Ghana', arrivalCountry: 'Cameroun', kilos: 200, cubicMeters: null, packageDescription: 'Marchandises diverses et fournitures', date: '2025-11-02', year: 2025, amount: '360 000 F CFA', status: 'annule', depositedAtAgency: false, arrivedInDestination: false, pickedUpByClient: false },
    { id: '6', code: 'TRX-2026-00105', name: 'Sophie Amani', email: 'sophie.amani@yahoo.fr', phone: '+225 07 55 44 33 22', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Belgique', kilos: 18, cubicMeters: null, packageDescription: 'Cosmétiques et produits de beauté', date: '2026-05-22', year: 2026, amount: '15 200 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
    { id: '7', code: 'TRX-2026-00098', name: 'Global Transit', email: 'booking@global-transit.ci', phone: '+225 01 23 45 67 89', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Allemagne', kilos: 85, cubicMeters: null, packageDescription: 'Mobilier de bureau léger', date: '2026-05-18', year: 2026, amount: '92 000 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: false },
    { id: '8', code: 'TRX-2026-00087', name: 'Fatou Koné', email: 'fatou.kone@gmail.com', phone: '+223 76 54 32 10', departureCountry: 'Mali', arrivalCountry: "Côte d'Ivoire", kilos: 32, cubicMeters: null, packageDescription: 'Produits alimentaires secs', date: '2026-05-10', year: 2026, amount: '28 400 F CFA', status: 'reserve', depositedAtAgency: false, arrivedInDestination: false, pickedUpByClient: false },
    { id: '9', code: 'TRX-2025-00912', name: 'LogiPro Africa', email: 'sales@logipro-africa.ng', phone: '+234 803 456 7890', departureCountry: 'Nigeria', arrivalCountry: 'France', kilos: 410, cubicMeters: null, packageDescription: 'Textiles et tissus en vrac', date: '2025-10-05', year: 2025, amount: '3 362 000 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
    { id: '10', code: 'TRX-2025-00876', name: 'Amadou Traoré', email: 'amadou.traore@hotmail.ca', phone: '+225 07 88 99 00 11', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Canada', kilos: 55, cubicMeters: null, packageDescription: 'Électronique grand public', date: '2025-09-20', year: 2025, amount: '67 500 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: false, pickedUpByClient: false },
    { id: '11', code: 'TRX-2026-00065', name: 'Express Cargo CI', email: 'support@express-cargo.ci', phone: '+225 05 11 22 33 44', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Maroc', kilos: 0, cubicMeters: null, packageDescription: 'Conteneur 20 pieds — marchandises diverses', date: '2026-04-15', year: 2026, amount: '1 250 000 F CFA', status: 'annule', depositedAtAgency: false, arrivedInDestination: false, pickedUpByClient: false },
    { id: '12', code: 'TRX-2026-00054', name: 'Claire N\'Guessan', email: 'claire.nguessan@gmail.com', phone: '+225 07 33 22 11 00', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Italie', kilos: 15, cubicMeters: null, packageDescription: 'Médicaments et produits pharmaceutiques', date: '2026-04-02', year: 2026, amount: '19 800 F CFA', status: 'achete', depositedAtAgency: false, arrivedInDestination: false, pickedUpByClient: false },
    { id: '13', code: 'TRX-2026-00115', name: 'Marie Diallo', email: 'marie.diallo@gmail.com', phone: '+225 05 98 76 54 32', departureCountry: "Côte d'Ivoire", arrivalCountry: 'France', kilos: 12, cubicMeters: null, packageDescription: 'Cadeaux familiaux et souvenirs', date: '2026-05-28', year: 2026, amount: '18 000 F CFA', status: 'reserve', depositedAtAgency: true, arrivedInDestination: false, pickedUpByClient: false },
    { id: '14', code: 'TRX-2025-00842', name: 'Marie Diallo', email: 'marie.diallo@gmail.com', phone: '+225 05 98 76 54 32', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Belgique', kilos: 8, cubicMeters: null, packageDescription: 'Produits cosmétiques artisanaux', date: '2025-11-14', year: 2025, amount: '12 800 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
    { id: '15', code: 'TRX-2025-00798', name: 'Marie Diallo', email: 'marie.diallo@gmail.com', phone: '+225 05 98 76 54 32', departureCountry: "Côte d'Ivoire", arrivalCountry: 'États-Unis', kilos: 30, cubicMeters: null, packageDescription: 'Artisanat ivoirien', date: '2025-08-05', year: 2025, amount: '225 000 F CFA', status: 'annule', depositedAtAgency: false, arrivedInDestination: false, pickedUpByClient: false },
    { id: '16', code: 'TRX-2026-00076', name: 'Marie Diallo', email: 'marie.diallo@gmail.com', phone: '+225 05 98 76 54 32', departureCountry: 'Mali', arrivalCountry: "Côte d'Ivoire", kilos: 0, cubicMeters: 2.5, packageDescription: 'Meubles légers et décoration', date: '2026-03-18', year: 2026, amount: '62 500 F CFA', status: 'reserve', depositedAtAgency: false, arrivedInDestination: false, pickedUpByClient: false },
    { id: '17', code: 'TRX-2026-00048', name: 'Bamba & Fils SARL', email: 'contact@bamba-fils.ci', phone: '+225 07 44 55 66 77', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Espagne', kilos: 64, cubicMeters: null, packageDescription: 'Fruits secs et épices', date: '2026-02-22', year: 2026, amount: '89 600 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: false },
    { id: '18', code: 'TRX-2025-00721', name: 'Aïcha Sow', email: 'aicha.sow@yahoo.com', phone: '+221 77 123 45 67', departureCountry: 'Sénégal', arrivalCountry: 'France', kilos: 22, cubicMeters: null, packageDescription: 'Bijoux et accessoires de mode', date: '2025-07-30', year: 2025, amount: '35 200 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
    { id: '19', code: 'TRX-2026-00031', name: 'Patrick Ouedraogo', email: 'p.ouedraogo@proton.me', phone: '+226 70 11 22 33', departureCountry: 'Burkina Faso', arrivalCountry: "Côte d'Ivoire", kilos: 0, cubicMeters: 4, packageDescription: 'Matériaux de construction légers', date: '2026-01-15', year: 2026, amount: '100 000 F CFA', status: 'reserve', depositedAtAgency: true, arrivedInDestination: false, pickedUpByClient: false },
    { id: '20', code: 'TRX-2025-00688', name: 'Horizon Transit', email: 'info@horizon-transit.ci', phone: '+225 01 99 88 77 66', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Royaume-Uni', kilos: 0, cubicMeters: null, packageDescription: 'Conteneur 40 pieds — équipements agricoles', date: '2025-06-12', year: 2025, amount: '2 400 000 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
    { id: '21', code: 'TRX-2026-00128', name: 'Marie Diallo', email: 'marie.diallo@gmail.com', phone: '+225 05 98 76 54 32', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Ghana', kilos: 15, cubicMeters: null, packageDescription: 'Produits alimentaires et épices', date: '2026-05-15', year: 2026, amount: '22 500 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
    { id: '22', code: 'TRX-2025-00933', name: 'Marie Diallo', email: 'marie.diallo@gmail.com', phone: '+225 05 98 76 54 32', departureCountry: "Côte d'Ivoire", arrivalCountry: 'Canada', kilos: 20, cubicMeters: null, packageDescription: 'Livres et fournitures scolaires', date: '2025-10-22', year: 2025, amount: '30 000 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: false },
    { id: '23', code: 'TRX-2026-00092', name: 'Marie Diallo', email: 'marie.diallo@gmail.com', phone: '+225 05 98 76 54 32', departureCountry: 'Sénégal', arrivalCountry: "Côte d'Ivoire", kilos: 10, cubicMeters: null, packageDescription: 'Tissus wax et pagnes', date: '2026-04-28', year: 2026, amount: '16 000 F CFA', status: 'reserve', depositedAtAgency: true, arrivedInDestination: false, pickedUpByClient: false },
  ]);

  getAll(): Transaction[] {
    return this.transactions();
  }

  readonly list = this.transactions.asReadonly();

  getByClientEmail(email: string): Transaction[] {
    return this.transactions()
      .filter((tx) => tx.email === email)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  ensureClientDemoData(profile: { name: string; email: string; phone: string }): void {
    if (this.transactions().some((tx) => tx.email === profile.email)) return;

    const demos = this.buildClientDemoTransactions(profile);
    this.transactions.update((list) => [...demos, ...list]);
  }

  createFromBooking(input: CreateBookingInput): void {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    const year = today.getFullYear();
    const seq = this.transactions().length + 1;
    const country = this.extractCountry(input.offer.location);

    const transaction: Transaction = {
      id: String(seq),
      code: `TRX-${year}-${String(10000 + seq).slice(-5)}`,
      name: input.fullName,
      email: input.email,
      phone: input.phone,
      departureCountry: country,
      arrivalCountry: country,
      kilos: input.kilos ?? 0,
      cubicMeters: input.cubicMeters ?? null,
      packageDescription: input.offer.title,
      date,
      year,
      amount: this.computeBookingAmount(input),
      status: input.action,
      depositedAtAgency: false,
      arrivedInDestination: false,
      pickedUpByClient: false,
    };

    this.transactions.update((list) => [transaction, ...list]);
  }

  validateDeposited(id: string): void {
    this.updateTransaction(id, (tx) => {
      if (tx.status === 'annule' || tx.depositedAtAgency) return tx;
      return { ...tx, depositedAtAgency: true };
    });
  }

  validateArrived(id: string): void {
    this.updateTransaction(id, (tx) => {
      if (tx.status === 'annule' || !tx.depositedAtAgency || tx.arrivedInDestination) return tx;
      return { ...tx, arrivedInDestination: true };
    });
  }

  validatePickedUp(id: string): void {
    this.updateTransaction(id, (tx) => {
      if (tx.status === 'annule' || !tx.arrivedInDestination || tx.pickedUpByClient) return tx;
      return { ...tx, pickedUpByClient: true };
    });
  }

  private computeBookingAmount(input: CreateBookingInput): string {
    const rates: Record<Offer['pricingType'], number> = {
      kilo: 1_500,
      metreCube: 25_000,
      container: 1_250_000,
    };
    const rate = rates[input.offer.pricingType];

    if (input.offer.pricingType === 'kilo' && input.kilos) {
      return this.formatAmount(input.kilos * rate);
    }
    if (input.offer.pricingType === 'metreCube' && input.cubicMeters) {
      return this.formatAmount(Math.round(input.cubicMeters * rate));
    }
    return this.formatAmount(rate);
  }

  private formatAmount(value: number): string {
    return `${value.toLocaleString('fr-FR')} F CFA`;
  }

  private buildClientDemoTransactions(profile: {
    name: string;
    email: string;
    phone: string;
  }): Transaction[] {
    const { name, email, phone } = profile;
    const baseId = email.replace(/[^a-z0-9]/gi, '').slice(0, 12);

    return [
      { id: `${baseId}-1`, code: 'TRX-2026-00152', name, email, phone, departureCountry: "Côte d'Ivoire", arrivalCountry: 'France', kilos: 18, cubicMeters: null, packageDescription: 'Vêtements et accessoires', date: '2026-06-01', year: 2026, amount: '27 000 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: false },
      { id: `${baseId}-2`, code: 'TRX-2026-00141', name, email, phone, departureCountry: "Côte d'Ivoire", arrivalCountry: 'Sénégal', kilos: 12, cubicMeters: null, packageDescription: 'Articles ménagers légers', date: '2026-05-20', year: 2026, amount: '18 000 F CFA', status: 'reserve', depositedAtAgency: true, arrivedInDestination: false, pickedUpByClient: false },
      { id: `${baseId}-3`, code: 'TRX-2026-00109', name, email, phone, departureCountry: 'Mali', arrivalCountry: "Côte d'Ivoire", kilos: 0, cubicMeters: 1.8, packageDescription: 'Mobilier et décoration', date: '2026-04-10', year: 2026, amount: '45 000 F CFA', status: 'reserve', depositedAtAgency: false, arrivedInDestination: false, pickedUpByClient: false },
      { id: `${baseId}-4`, code: 'TRX-2025-00891', name, email, phone, departureCountry: "Côte d'Ivoire", arrivalCountry: 'Belgique', kilos: 9, cubicMeters: null, packageDescription: 'Produits cosmétiques', date: '2025-12-05', year: 2025, amount: '14 400 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
      { id: `${baseId}-5`, code: 'TRX-2025-00815', name, email, phone, departureCountry: "Côte d'Ivoire", arrivalCountry: 'États-Unis', kilos: 28, cubicMeters: null, packageDescription: 'Artisanat et souvenirs', date: '2025-09-08', year: 2025, amount: '210 000 F CFA', status: 'annule', depositedAtAgency: false, arrivedInDestination: false, pickedUpByClient: false },
      { id: `${baseId}-6`, code: 'TRX-2026-00083', name, email, phone, departureCountry: "Côte d'Ivoire", arrivalCountry: 'Ghana', kilos: 14, cubicMeters: null, packageDescription: 'Épices et condiments', date: '2026-03-25', year: 2026, amount: '21 000 F CFA', status: 'achete', depositedAtAgency: true, arrivedInDestination: true, pickedUpByClient: true },
    ];
  }

  private extractCountry(location: string): string {
    const parts = location.split(',');
    return parts[parts.length - 1]?.trim() || location;
  }

  private updateTransaction(id: string, updater: (tx: Transaction) => Transaction): void {
    this.transactions.update((list) =>
      list.map((tx) => (tx.id === id ? updater(tx) : tx)),
    );
  }
}
