import { Injectable } from '@angular/core';
import { Offer } from '../models/offer.model';

interface OfferCorridor {
  departure: string;
  arrival: string;
  location: string;
  category: string;
  pricingType: Offer['pricingType'];
  price: string;
}

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly seedOffers: Offer[] = [
    {
      id: '1',
      title: 'Fret maritime Gabon → Chine',
      likes: 42,
      date: 'lun. 15 juin 2026 | 08h00 GMT',
      price: '5 000 F CFA / kg',
      location: 'Libreville, Gabon',
      address: 'Zone portuaire d’Owendo, Libreville',
      category: 'Fret maritime',
      publisherName: 'Verga Transit GA',
      publisherHandle: '@VERGA_GA',
      publisherInitials: 'VG',
      logoBg: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
      description:
        'Envoi groupé maritime vers Shanghai et Guangzhou. Départs bi-mensuels, suivi colis en temps réel.',
      pricingType: 'kilo',
      departureCountry: 'Gabon',
      arrivalCountry: 'Chine',
      verified: true,
    },
    {
      id: '2',
      title: 'Import Chine → Gabon',
      likes: 28,
      date: 'ven. 20 juin 2026 | 10h00 GMT',
      price: '1 250 000 F CFA',
      location: 'Shanghai, Chine',
      address: 'Zone franche de Pudong, Shanghai',
      category: 'Fret maritime',
      publisherName: 'Dragon Freight',
      publisherHandle: '@DRAGON_FREIGHT',
      publisherInitials: 'DF',
      logoBg: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
      description:
        'Réexpédition depuis la Chine vers Libreville. Conteneur 20 ou 40 pieds, documents douaniers inclus.',
      pricingType: 'container',
      departureCountry: 'Chine',
      arrivalCountry: 'Gabon',
      promotion: true,
    },
    {
      id: '3',
      title: 'Fret aérien Gabon → France',
      likes: 51,
      date: 'mar. 17 juin 2026 | 11h00 GMT',
      price: '8 200 F CFA / kg',
      location: 'Libreville, Gabon',
      address: 'Aéroport Léon-Mba, Libreville',
      category: 'Fret aérien',
      publisherName: 'Euro Transit GA',
      publisherHandle: '@EURO_TRANSIT_GA',
      publisherInitials: 'ET',
      logoBg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      description:
        'Envoi express vers Paris, Lyon et Marseille. Idéal pour colis urgents et effets personnels.',
      pricingType: 'kilo',
      departureCountry: 'Gabon',
      arrivalCountry: 'France',
      verified: true,
    },
    {
      id: '4',
      title: 'Retour France → Gabon',
      likes: 19,
      date: 'jeu. 26 juin 2026 | 08h00 GMT',
      price: '3 800 F CFA / kg',
      location: 'Le Havre, France',
      address: 'Terminal portuaire, Le Havre',
      category: 'Fret maritime',
      publisherName: 'Atlantique Shipping',
      publisherHandle: '@ATLANTIQUE_SHIP',
      publisherInitials: 'AS',
      logoBg: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
      description:
        'Ramenez vos achats et effets personnels de France vers Libreville. Départs mensuels depuis le Havre.',
      pricingType: 'kilo',
      departureCountry: 'France',
      arrivalCountry: 'Gabon',
    },
    {
      id: '5',
      title: 'Colis groupé Gabon → Sénégal',
      likes: 35,
      date: 'sam. 21 juin 2026 | 09h00 GMT',
      price: '4 500 F CFA / kg',
      location: 'Libreville, Gabon',
      address: 'Zone logistique de Nzeng-Ayong',
      category: 'Fret maritime',
      publisherName: 'Afrique Ouest Cargo',
      publisherHandle: '@AFRIQUE_OUEST',
      publisherInitials: 'AO',
      logoBg: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
      description:
        'Liaison régulière Libreville → Dakar. Parfait pour marchandises, textiles et produits alimentaires secs.',
      pricingType: 'kilo',
      departureCountry: 'Gabon',
      arrivalCountry: 'Sénégal',
      verified: true,
    },
    {
      id: '6',
      title: 'Fret express Sénégal → Gabon',
      likes: 22,
      date: 'mer. 11 juin 2026 | 14h00 GMT',
      price: '6 800 F CFA / kg',
      location: 'Dakar, Sénégal',
      address: 'Port autonome de Dakar',
      category: 'Fret aérien',
      publisherName: 'Senegal Gabon Link',
      publisherHandle: '@SN_GA_LINK',
      publisherInitials: 'SG',
      logoBg: 'linear-gradient(160deg, #0f172a 0%, #5eadd6 45%, #1e3a5f 100%)',
      description:
        'Service rapide Dakar → Libreville. Suivi GPS et notification à chaque étape.',
      pricingType: 'kilo',
      departureCountry: 'Sénégal',
      arrivalCountry: 'Gabon',
      promotion: true,
    },
    {
      id: '7',
      title: 'Fret maritime Gabon → Maroc',
      likes: 31,
      date: 'ven. 13 juin 2026 | 16h00 GMT',
      price: '5 200 F CFA / kg',
      location: 'Libreville, Gabon',
      address: 'Port d’Owendo, Libreville',
      category: 'Fret maritime',
      publisherName: 'Maghreb Transit',
      publisherHandle: '@MAGHREB_TRANSIT',
      publisherInitials: 'MT',
      logoBg: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
      description:
        'Liaison maritime Libreville → Casablanca. Consolidation en entrepôt et livraison à domicile possible.',
      pricingType: 'kilo',
      departureCountry: 'Gabon',
      arrivalCountry: 'Maroc',
      verified: true,
    },
    {
      id: '8',
      title: 'Import Maroc → Gabon',
      likes: 14,
      date: 'lun. 30 juin 2026 | 07h00 GMT',
      price: '980 000 F CFA',
      location: 'Casablanca, Maroc',
      address: 'Port de Casablanca',
      category: 'Fret maritime',
      publisherName: 'Méditerranée Cargo',
      publisherHandle: '@MED_CARGO',
      publisherInitials: 'MC',
      logoBg: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)',
      description:
        'Conteneur complet Casablanca → Port-Gentil. Dédouanement assisté à l’arrivée.',
      pricingType: 'container',
      departureCountry: 'Maroc',
      arrivalCountry: 'Gabon',
    },
    {
      id: '9',
      title: 'Fret aérien Gabon → États-Unis',
      likes: 44,
      date: 'mar. 24 juin 2026 | 09h00 GMT',
      price: '12 500 F CFA / kg',
      location: 'Libreville, Gabon',
      address: 'Aéroport Léon-Mba, Libreville',
      category: 'Fret aérien',
      publisherName: 'Atlantic Express',
      publisherHandle: '@ATLANTIC_EXP',
      publisherInitials: 'AE',
      logoBg: 'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 100%)',
      description:
        'Envoi vers New York, Houston et Miami. Assurance tous risques incluse.',
      pricingType: 'kilo',
      departureCountry: 'Gabon',
      arrivalCountry: 'États-Unis',
      verified: true,
      promotion: true,
    },
    {
      id: '10',
      title: 'Retour États-Unis → Gabon',
      likes: 18,
      date: 'sam. 28 juin 2026 | 10h00 GMT',
      price: '7 800 F CFA / kg',
      location: 'New York, États-Unis',
      address: 'JFK Cargo Terminal, New York',
      category: 'Fret maritime',
      publisherName: 'US Africa Freight',
      publisherHandle: '@US_AFRICA',
      publisherInitials: 'UF',
      logoBg: 'linear-gradient(135deg, #713f12 0%, #d97706 100%)',
      description:
        'Réexpédition depuis les ports américains vers Libreville. Option économique pour gros volumes.',
      pricingType: 'kilo',
      departureCountry: 'États-Unis',
      arrivalCountry: 'Gabon',
    },
    {
      id: '11',
      title: 'Fret aérien Canada → Gabon',
      likes: 27,
      date: 'jeu. 19 juin 2026 | 15h00 GMT',
      price: '11 200 F CFA / kg',
      location: 'Montréal, Canada',
      address: 'Aéroport Montréal-Trudeau',
      category: 'Fret aérien',
      publisherName: 'Canada Gabon Express',
      publisherHandle: '@CA_GABON_EXP',
      publisherInitials: 'CG',
      logoBg: 'linear-gradient(135deg, #831843 0%, #ec4899 100%)',
      description:
        'Liaison Montréal et Toronto → Libreville. Points de dépôt à Montréal, Toronto et Québec.',
      pricingType: 'kilo',
      departureCountry: 'Canada',
      arrivalCountry: 'Gabon',
      verified: true,
    },
    {
      id: '12',
      title: 'Déménagement Gabon → Canada',
      likes: 12,
      date: 'mer. 18 juin 2026 | 08h00 GMT',
      price: '20 000 F CFA / m³',
      location: 'Libreville, Gabon',
      address: 'Zone logistique de Nzeng-Ayong',
      category: 'Fret maritime',
      publisherName: 'Move Africa',
      publisherHandle: '@MOVE_AFRICA',
      publisherInitials: 'MA',
      logoBg: 'linear-gradient(135deg, #3f6212 0%, #84cc16 100%)',
      description:
        'Transport de meubles et cartons Libreville → Montréal. Emballage professionnel et inventaire détaillé.',
      pricingType: 'metreCube',
      departureCountry: 'Gabon',
      arrivalCountry: 'Canada',
      promotion: true,
    },
  ];

  private readonly offers: Offer[] = this.buildCatalog();

  private buildCatalog(): Offer[] {
    const targetCount = 125;
    const extras = this.generateExtraOffers(this.seedOffers.length + 1, targetCount - this.seedOffers.length);
    return [...this.seedOffers, ...extras];
  }

  private generateExtraOffers(startId: number, count: number): Offer[] {
    const corridors: OfferCorridor[] = [
      { departure: 'Gabon', arrival: 'Chine', location: 'Libreville, Gabon', category: 'Fret maritime', pricingType: 'kilo', price: '5 000 F CFA / kg' },
      { departure: 'Chine', arrival: 'Gabon', location: 'Shanghai, Chine', category: 'Fret maritime', pricingType: 'container', price: '1 250 000 F CFA' },
      { departure: 'Gabon', arrival: 'France', location: 'Libreville, Gabon', category: 'Fret aérien', pricingType: 'kilo', price: '8 200 F CFA / kg' },
      { departure: 'France', arrival: 'Gabon', location: 'Paris, France', category: 'Fret maritime', pricingType: 'kilo', price: '3 800 F CFA / kg' },
      { departure: 'Gabon', arrival: 'Sénégal', location: 'Libreville, Gabon', category: 'Fret maritime', pricingType: 'kilo', price: '4 500 F CFA / kg' },
      { departure: 'Sénégal', arrival: 'Gabon', location: 'Dakar, Sénégal', category: 'Fret aérien', pricingType: 'kilo', price: '6 800 F CFA / kg' },
      { departure: 'Gabon', arrival: 'Maroc', location: 'Port-Gentil, Gabon', category: 'Fret maritime', pricingType: 'kilo', price: '5 200 F CFA / kg' },
      { departure: 'Maroc', arrival: 'Gabon', location: 'Casablanca, Maroc', category: 'Fret maritime', pricingType: 'container', price: '980 000 F CFA' },
      { departure: 'Gabon', arrival: 'États-Unis', location: 'Libreville, Gabon', category: 'Fret aérien', pricingType: 'kilo', price: '12 500 F CFA / kg' },
      { departure: 'États-Unis', arrival: 'Gabon', location: 'New York, États-Unis', category: 'Fret maritime', pricingType: 'kilo', price: '7 800 F CFA / kg' },
      { departure: 'Gabon', arrival: 'Canada', location: 'Libreville, Gabon', category: 'Fret aérien', pricingType: 'kilo', price: '11 200 F CFA / kg' },
      { departure: 'Canada', arrival: 'Gabon', location: 'Montréal, Canada', category: 'Fret maritime', pricingType: 'metreCube', price: '20 000 F CFA / m³' },
    ];

    const publishers = [
      { name: 'Verga Transit GA', handle: '@VERGA_GA', initials: 'VG', logoBg: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)' },
      { name: 'Dragon Freight', handle: '@DRAGON_FREIGHT', initials: 'DF', logoBg: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)' },
      { name: 'Euro Transit GA', handle: '@EURO_TRANSIT_GA', initials: 'ET', logoBg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' },
      { name: 'Atlantique Shipping', handle: '@ATLANTIQUE_SHIP', initials: 'AS', logoBg: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' },
      { name: 'Afrique Ouest Cargo', handle: '@AFRIQUE_OUEST', initials: 'AO', logoBg: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)' },
      { name: 'Maghreb Transit', handle: '@MAGHREB_TRANSIT', initials: 'MT', logoBg: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)' },
    ];

    const days = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

    return Array.from({ length: count }, (_, index) => {
      const id = startId + index;
      const corridor = corridors[index % corridors.length];
      const publisher = publishers[index % publishers.length];
      const day = days[index % days.length];
      const hour = 8 + (index % 10);

      return {
        id: String(id),
        title: `Fret ${corridor.departure} → ${corridor.arrival} #${id}`,
        likes: 8 + (index * 7) % 140,
        date: `${day} ${(index % 28) + 1} juin 2026 | ${hour}h00 GMT`,
        price: corridor.price,
        location: corridor.location,
        address: `Zone logistique ${corridor.departure}`,
        category: corridor.category,
        publisherName: publisher.name,
        publisherHandle: publisher.handle,
        publisherInitials: publisher.initials,
        logoBg: publisher.logoBg,
        description: `Offre de transport ${corridor.departure} vers ${corridor.arrival}. Suivi colis, assurance et assistance douanière disponibles.`,
        pricingType: corridor.pricingType,
        departureCountry: corridor.departure,
        arrivalCountry: corridor.arrival,
        verified: index % 3 === 0,
        promotion: index % 5 === 0,
      } satisfies Offer;
    });
  }

  getAll(): Offer[] {
    return [...this.offers];
  }

  getById(id: string): Offer | undefined {
    return this.offers.find((o) => o.id === id);
  }
}
