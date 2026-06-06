import { Injectable } from '@angular/core';
import { Offer } from '../models/offer.model';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly offers: Offer[] = [
    {
      id: '1',
      title: 'BLF',
      likes: 25,
      date: 'sam. 27 juin 2026 | 15h00 GMT',
      price: '5 000 F CFA / kg',
      location: "Abidjan, Côte d'Ivoire",
      address:
        "Parc des expositions d'Abidjan, Boulevard de l'Aéroport, Port-Bouët, Abidjan",
      category: 'Festival',
      publisherName: 'Organisation SCY',
      publisherHandle: '@ORGANISATION_SCY',
      publisherInitials: 'OS',
      logoBg: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
      description:
        "Le Black Legacy Festival revient pour une édition exceptionnelle à Abidjan. Concerts live, showcases, networking et expériences immersives au cœur du parc des expositions. Réservez tôt pour profiter des meilleurs tarifs et des places VIP.",
      pricingType: 'kilo',
      verified: true,
    },
    {
      id: '2',
      title: 'FUN SHOW',
      likes: 97,
      date: 'sam. 27 juin 2026 | 15h00 GMT',
      location: "Abidjan, Côte d'Ivoire",
      address: 'Palais de la culture, Treichville, Abidjan',
      category: 'Concert',
      publisherName: 'Event Pro CI',
      publisherHandle: '@EVENTPRO_CI',
      publisherInitials: 'EP',
      logoBg: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
      description:
        'Une soirée électro-pop inoubliable avec les têtes d’affiche de la scène ivoirienne et internationale. Son premium, lumières LED et scène 360° pour une expérience totale. Billets limités — ne tardez pas.',
      price: '1 250 000 F CFA',
      pricingType: 'container',
    },
    {
      id: '3',
      title: 'NAZA EN CONCERT LIVE AU PARC',
      likes: 142,
      date: 'sam. 13 juin 2026 | 14h00 GMT',
      price: '25 000 F CFA / m³',
      location: "Abidjan, Côte d'Ivoire",
      address:
        "Parc des expositions d'Abidjan, Boulevard de l'Aéroport, Port-Bouët, Abidjan",
      category: 'Concert',
      publisherName: 'ULTRACOM GROUP',
      publisherHandle: '@ULTRACOM_GROUP',
      publisherInitials: 'UG',
      logoBg: 'linear-gradient(160deg, #0f172a 0%, #5eadd6 45%, #1e3a5f 100%)',
      description:
        "NAZA débarque en live au parc des expositions pour un show XXL. Ambiance festive, scène géante, invités surprise et zone fan dédiée. Venez vivre l'énergie du concert le plus attendu de la saison à Abidjan.",
      pricingType: 'metreCube',
      verified: true,
      promotion: true,
    },
    {
      id: '4',
      title: 'FUN SHOW',
      likes: 97,
      date: 'sam. 27 juin 2026 | 15h00 GMT',
      price: '5 000 F CFA / kg',
      location: "Abidjan, Côte d'Ivoire",
      address: 'Zone 4, Marcory, Abidjan',
      category: 'Soirée',
      publisherName: 'Africa Productions',
      publisherHandle: '@AFRICA_PRODUCTIONS',
      publisherInitials: 'AP',
      logoBg: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
      description:
        'Soirée premium avec DJ sets, lounge et cocktails. Dress code chic, accès coupe-file pour les billets Gold. Parfait pour célébrer entre amis ou en équipe après le travail.',
      pricingType: 'kilo',
      promotion: true,
    },
  ];

  getAll(): Offer[] {
    return [...this.offers];
  }

  getById(id: string): Offer | undefined {
    return this.offers.find((o) => o.id === id);
  }
}
