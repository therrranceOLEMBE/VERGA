import { Language } from '../i18n/translations';

export interface LegalSection {
  id: string;
  title: Record<Language, string>;
  paragraphs: Record<Language, string[]>;
}

export interface LegalDocument {
  path: string;
  title: Record<Language, string>;
  lead: Record<Language, string>;
  updated: Record<Language, string>;
  sections: LegalSection[];
}

export const PRIVACY_DOCUMENT: LegalDocument = {
  path: '/politique-de-confidentialite',
  title: {
    fr: 'Politique de confidentialité',
    en: 'Privacy policy',
  },
  lead: {
    fr: 'Comment Verga collecte, utilise et protège vos données lorsque vous utilisez la plateforme de mise en relation fret et logistique.',
    en: 'How Verga collects, uses and protects your data when you use the freight and logistics matching platform.',
  },
  updated: {
    fr: 'Dernière mise à jour : juillet 2026',
    en: 'Last updated: July 2026',
  },
  sections: [
    {
      id: 'who',
      title: { fr: 'Qui est responsable', en: 'Who is responsible' },
      paragraphs: {
        fr: [
          'Verga exploite une plateforme digitale de mise en relation entre agences de transit / logistique et clients (particuliers ou entreprises) pour publier, rechercher, réserver et payer des offres de transport.',
          'Pour toute question relative à vos données : contact@verga.com, ou via la page « Nous contacter ». Adresse de référence : Cité SYNATRESOR, Abatta Cocody, Abidjan, Côte d’Ivoire.',
        ],
        en: [
          'Verga operates a digital matching platform between transit / logistics agencies and clients (individuals or businesses) to publish, search, book and pay for shipping offers.',
          'For any question about your data: contact@verga.com, or via the “Contact us” page. Reference address: Cité SYNATRESOR, Abatta Cocody, Abidjan, Ivory Coast.',
        ],
      },
    },
    {
      id: 'data',
      title: { fr: 'Données collectées', en: 'Data we collect' },
      paragraphs: {
        fr: [
          'Compte : identité, e-mail, téléphone, mot de passe (stocké de façon sécurisée), type de compte (particulier ou agence), informations d’entreprise et de gérant le cas échéant.',
          'Commandes et envois : détails d’offre, quantités selon le type d’offre défini par l’agence, description de marchandise, photos éventuelles, coordonnées de contact, historique de commandes, paiements et colis.',
          'Technique : logs de connexion, adresse IP, type d’appareil / navigateur, préférences de langue, données nécessaires au bon fonctionnement et à la sécurité du service.',
          'Paiements : les règlements sont traités via Bamboo Pay. Verga ne demande pas de saisir vos données bancaires complètes dans le formulaire d’offre ; les références de transaction utiles au suivi peuvent être conservées.',
        ],
        en: [
          'Account: identity, email, phone, password (stored securely), account type (individual or agency), company and manager details when applicable.',
          'Orders and shipments: offer details, quantities according to the offer type set by the agency, cargo description, optional photos, contact details, order, payment and parcel history.',
          'Technical: login logs, IP address, device / browser type, language preferences, data needed for service operation and security.',
          'Payments: settlements are processed via Bamboo Pay. Verga does not ask you to enter full bank details in the offer form; transaction references useful for tracking may be retained.',
        ],
      },
    },
    {
      id: 'purposes',
      title: { fr: 'Finalités', en: 'Purposes' },
      paragraphs: {
        fr: [
          'Fournir le service : créer des comptes, publier et consulter des offres, estimer les montants, créer des commandes, rediriger vers le paiement, suivre les colis et gérer les réclamations.',
          'Assurer la relation commerciale entre agences et clients, la facturation / commissions liées aux ventes réalisées via Verga, et le support.',
          'Sécuriser la plateforme (prévention de fraude, abus, accès non autorisés) et respecter nos obligations légales.',
        ],
        en: [
          'Provide the service: create accounts, publish and browse offers, estimate amounts, create orders, redirect to payment, track parcels and manage claims.',
          'Support the commercial relationship between agencies and clients, billing / commissions linked to sales made via Verga, and support.',
          'Secure the platform (fraud, abuse, unauthorized access prevention) and meet our legal obligations.',
        ],
      },
    },
    {
      id: 'sharing',
      title: { fr: 'Partage des données', en: 'Data sharing' },
      paragraphs: {
        fr: [
          'Avec l’agence concernée : les informations nécessaires à l’exécution de la commande et au suivi logistique.',
          'Avec des prestataires techniques (hébergement, paiement Bamboo Pay, outils d’exploitation) uniquement dans la mesure utile au service, sous obligations de confidentialité adaptées.',
          'Nous ne vendons pas vos données personnelles. Une communication peut avoir lieu si la loi l’exige ou pour protéger les droits de Verga, des utilisateurs ou de tiers.',
        ],
        en: [
          'With the relevant agency: information needed to fulfill the order and logistics tracking.',
          'With technical providers (hosting, Bamboo Pay payment, operations tools) only as needed for the service, under appropriate confidentiality duties.',
          'We do not sell your personal data. Disclosure may occur if required by law or to protect the rights of Verga, users or third parties.',
        ],
      },
    },
    {
      id: 'retention',
      title: { fr: 'Conservation & sécurité', en: 'Retention & security' },
      paragraphs: {
        fr: [
          'Les données sont conservées le temps nécessaire aux finalités ci-dessus, puis archivées ou supprimées selon les délais légaux et opérationnels (comptabilité, litiges, preuves de transaction).',
          'Des mesures techniques et organisationnelles raisonnables limitent l’accès aux données. Aucun système n’étant infaillible, signalez tout incident suspect au support.',
        ],
        en: [
          'Data is kept for as long as needed for the purposes above, then archived or deleted according to legal and operational timelines (accounting, disputes, transaction evidence).',
          'Reasonable technical and organizational measures limit data access. No system is infallible — report any suspicious incident to support.',
        ],
      },
    },
    {
      id: 'rights',
      title: { fr: 'Vos droits', en: 'Your rights' },
      paragraphs: {
        fr: [
          'Selon le droit applicable, vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou vous opposer à certains traitements, et retirer un consentement lorsque celui-ci est la base du traitement.',
          'Pour exercer vos droits, écrivez à contact@verga.com ou utilisez « Nous contacter ». Nous pourrons vérifier votre identité avant de répondre.',
          'Vous pouvez aussi mettre à jour certaines informations depuis votre espace (profil particulier ou agence).',
        ],
        en: [
          'Under applicable law, you may request access, correction, erasure, restriction or object to certain processing, and withdraw consent when consent is the legal basis.',
          'To exercise your rights, email contact@verga.com or use “Contact us”. We may verify your identity before responding.',
          'You can also update some information from your space (individual or agency profile).',
        ],
      },
    },
    {
      id: 'cookies',
      title: { fr: 'Cookies & langue', en: 'Cookies & language' },
      paragraphs: {
        fr: [
          'Verga utilise des mécanismes locaux (par exemple préférence de langue) pour améliorer l’expérience. Des cookies ou équivalents techniques peuvent être nécessaires au fonctionnement de la session.',
          'Vous pouvez paramétrer votre navigateur pour limiter certains cookies ; cela peut affecter certaines fonctionnalités.',
        ],
        en: [
          'Verga uses local mechanisms (for example language preference) to improve the experience. Cookies or technical equivalents may be required for session operation.',
          'You can configure your browser to limit some cookies; this may affect certain features.',
        ],
      },
    },
    {
      id: 'updates',
      title: { fr: 'Modifications', en: 'Changes' },
      paragraphs: {
        fr: [
          'Cette politique peut évoluer. La date de mise à jour en tête de page fait foi. En cas de changement important, nous pourrons vous en informer via la plateforme ou par e-mail lorsque c’est pertinent.',
        ],
        en: [
          'This policy may change. The update date at the top of the page prevails. For material changes, we may notify you via the platform or email when relevant.',
        ],
      },
    },
  ],
};

export const TERMS_DOCUMENT: LegalDocument = {
  path: '/conditions-generales',
  title: {
    fr: 'Conditions générales',
    en: 'Terms and conditions',
  },
  lead: {
    fr: 'Règles d’utilisation de Verga pour les clients et les agences : comptes, offres, commandes, paiements et responsabilités.',
    en: 'Rules for using Verga for clients and agencies: accounts, offers, orders, payments and responsibilities.',
  },
  updated: {
    fr: 'Dernière mise à jour : juillet 2026',
    en: 'Last updated: July 2026',
  },
  sections: [
    {
      id: 'object',
      title: { fr: 'Objet du service', en: 'Service purpose' },
      paragraphs: {
        fr: [
          'Verga met en relation des agences de transit et de logistique qui publient des offres de transport avec des clients qui recherchent, comparent, réservent ou achètent ces services, puis paient en ligne de manière sécurisée.',
          'Verga n’est pas le transporteur : l’exécution du fret relève de l’agence et des conditions propres à chaque offre.',
        ],
        en: [
          'Verga matches transit and logistics agencies that publish shipping offers with clients who search, compare, reserve or buy those services, then pay online securely.',
          'Verga is not the carrier: freight performance is the agency’s responsibility under each offer’s terms.',
        ],
      },
    },
    {
      id: 'accounts',
      title: { fr: 'Comptes', en: 'Accounts' },
      paragraphs: {
        fr: [
          'Deux types de comptes : particulier (espace client) et entreprise / agence (backoffice). Vous êtes responsable de l’exactitude des informations et de la confidentialité de vos identifiants.',
          'Toute agence qui crée un compte sur Verga accepte sans réserve les présentes conditions générales, y compris les règles de tarification au kilo, les commissions et les modalités de reversement décrites ci-dessous.',
          'Verga peut suspendre un compte en cas d’usage frauduleux, abusif ou contraire aux présentes conditions.',
        ],
        en: [
          'Two account types: individual (client area) and company / agency (backoffice). You are responsible for accurate information and keeping credentials confidential.',
          'Any agency that creates an account on Verga fully accepts these terms, including the per-kilo pricing rules, commissions and payout terms set out below.',
          'Verga may suspend an account in case of fraudulent, abusive or non-compliant use.',
        ],
      },
    },
    {
      id: 'offers',
      title: { fr: 'Offres publiées par les agences', en: 'Offers published by agencies' },
      paragraphs: {
        fr: [
          'L’agence définit le contenu de l’offre : titre, type d’offre (unité et règles de quantité), prix, capacité limitée ou illimitée, origine, destination, dates, description et statut.',
          'Les types d’offre ne se limitent pas au kg, au m³ ou au conteneur : l’unité dépend de ce que l’agence crée. L’agence garantit la loyauté des informations publiées.',
          'Publier une offre sur Verga est gratuit. Les commissions et, le cas échéant, le prix plancher au kilo applicables sont précisés dans la section « Tarification & commissions ».',
        ],
        en: [
          'The agency defines offer content: title, offer type (unit and quantity rules), price, limited or unlimited capacity, origin, destination, dates, description and status.',
          'Offer types are not limited to kg, m³ or container: the unit depends on what the agency creates. The agency warrants the accuracy of published information.',
          'Publishing an offer on Verga is free. Applicable commissions and, where relevant, the minimum per-kilo price are set out in “Pricing & commissions”.',
        ],
      },
    },
    {
      id: 'pricing',
      title: { fr: 'Tarification & commissions', en: 'Pricing & commissions' },
      paragraphs: {
        fr: [
          'Prix au kilo (corridors concernés) : pour les offres facturées au kilo à destination ou en provenance de Gabon–Chine, Chine–Gabon, Gabon–France ou France–Gabon, l’agence s’engage à pratiquer un prix de 8 500 FCFA le kilo. En créant un compte et en publiant sur ces destinations, l’agence accepte cette règle de plateforme.',
          'Commission agence (5 %) : sur chaque transaction (chaque fois qu’un client paie ou réserve une offre via Verga), l’agence accepte de verser à Verga une commission égale à 5 % du montant reçu par l’agence au titre de cette transaction.',
          'Destinations à prix homologués (2,5 %) : lorsque les prix sont homologués, la commission due par l’agence à Verga est de 2,5 % du montant reçu par l’agence sur chaque transaction.',
          'Frais de service client (5 %) : le client verse à Verga des frais de service correspondant à 5 % de commission, calculés sur la base applicable affichée avant paiement (estimation de commande).',
          'Évolution des tarifs : les commissions, frais de service et règles de prix plancher (notamment le kilo à 8 500 FCFA) sont susceptibles d’être modifiés par Verga. La version en vigueur des présentes conditions, et le cas échéant la page Tarifs, font foi. Les utilisateurs seront informés des changements importants dans la mesure du raisonnable.',
        ],
        en: [
          'Per-kilo price (covered corridors): for offers billed per kilo to or from Gabon–China, China–Gabon, Gabon–France or France–Gabon, the agency undertakes to charge 8,500 FCFA per kilo. By creating an account and publishing on these routes, the agency accepts this platform rule.',
          'Agency commission (5%): on each transaction (each time a client pays or reserves an offer via Verga), the agency agrees to pay Verga a commission equal to 5% of the amount received by the agency for that transaction.',
          'Homologated-price destinations (2.5%): where prices are homologated, the agency commission due to Verga is 2.5% of the amount received by the agency on each transaction.',
          'Client service fee (5%): the client pays Verga a service fee equal to a 5% commission, based on the applicable amount shown before payment (order estimate).',
          'Fee changes: commissions, service fees and floor-price rules (including 8,500 FCFA per kilo) may be changed by Verga. The current version of these terms, and where applicable the Pricing page, prevail. Users will be informed of material changes where reasonably possible.',
        ],
      },
    },
    {
      id: 'orders',
      title: { fr: 'Commandes client', en: 'Client orders' },
      paragraphs: {
        fr: [
          'Acheter : paiement immédiat de la quantité choisie. Réserver (capacité limitée uniquement) : le client indique la quantité totale souhaitée, puis la part qu’il achète immédiatement dans cette quantité ; il paie cette part tout de suite. La quantité restante peut être achetée plus tard depuis l’espace client.',
          'Avant paiement, une estimation (sous-total, frais de service / commission Verga, total) est affichée. Si le stock est insuffisant, la commande peut être refusée.',
          'La description de marchandise est obligatoire ; les photos sont optionnelles. Une commande peut être créée en invité, sous réserve des champs requis.',
        ],
        en: [
          'Buy: immediate payment of the chosen quantity. Reserve (limited capacity only): the client enters the total quantity wanted, then the portion bought immediately within that total, and pays that portion now. The remaining quantity may be purchased later from the client area.',
          'Before payment, an estimate (subtotal, Verga service fee / commission, total) is shown. If stock is insufficient, the order may be refused.',
          'Cargo description is required; photos are optional. An order may be placed as a guest, subject to required fields.',
        ],
      },
    },
    {
      id: 'payment',
      title: { fr: 'Paiements', en: 'Payments' },
      paragraphs: {
        fr: [
          'Les paiements sont réalisés via Bamboo Pay après création de la commande. Les statuts (en attente, validé, échec, remboursé) apparaissent dans les historiques client et agence.',
          'Chaque paiement ou réservation payante sur une offre constitue une transaction au sens des présentes conditions et déclenche l’application des commissions et frais de service décrits ci-dessus.',
          'Un paiement en échec peut laisser la commande en attente ; le client peut réessayer lorsque c’est possible. Les remboursements suivent le motif (annulation, litige, erreur) et le traitement associé.',
        ],
        en: [
          'Payments are made via Bamboo Pay after order creation. Statuses (pending, validated, failed, refunded) appear in client and agency histories.',
          'Each payment or paid reservation on an offer is a transaction under these terms and triggers the commissions and service fees described above.',
          'A failed payment may leave the order pending; the client may retry when possible. Refunds follow the reason (cancellation, dispute, error) and related handling.',
        ],
      },
    },
    {
      id: 'payouts',
      title: { fr: 'Reversements aux agences', en: 'Agency payouts' },
      paragraphs: {
        fr: [
          'Les sommes encaissées pour le compte de l’agence via la plateforme Verga (après déduction des commissions et frais dus à Verga, le cas échéant) font l’objet d’un reversement à l’agence.',
          'Verga effectue les reversements chaque fin de mois, selon le calendrier opérationnel de la plateforme et sous réserve de la validation des paiements concernés.',
          'Le détail des montants, commissions et reversements est consultable dans l’espace agence (finances / reversements / paiements).',
        ],
        en: [
          'Amounts collected for the agency via the Verga platform (after deducting commissions and fees due to Verga, where applicable) are paid out to the agency.',
          'Verga makes payouts at the end of each month, according to the platform’s operational schedule and subject to validation of the relevant payments.',
          'Amounts, commissions and payouts can be reviewed in the agency space (finance / payouts / payments).',
        ],
      },
    },
    {
      id: 'logistics',
      title: { fr: 'Colis & réclamations', en: 'Parcels & claims' },
      paragraphs: {
        fr: [
          'Le suivi des colis (chez le client, déposé, en transit, arrivé, récupéré) est mis à jour par l’agence. Le client consulte l’historique dans son espace.',
          'Une réclamation peut être ouverte depuis une commande (client ou agence) et traitée jusqu’à clôture. Elle ne remplace pas les recours légaux éventuels.',
        ],
        en: [
          'Parcel tracking (with client, deposited, in transit, arrived, collected) is updated by the agency. Clients view history in their space.',
          'A claim may be opened from an order (client or agency) and handled through closure. It does not replace any available legal remedies.',
        ],
      },
    },
    {
      id: 'liability',
      title: { fr: 'Responsabilités', en: 'Liability' },
      paragraphs: {
        fr: [
          'Verga fournit la plateforme technique de mise en relation et de paiement. L’agence reste responsable de l’exécution du transport, de la capacité annoncée, du respect du prix plancher au kilo lorsqu’il s’applique, et des réglementations applicables.',
          'Le client reste responsable de l’exactitude des informations sur la marchandise et du respect des règles d’expédition.',
          'Dans les limites autorisées par la loi, Verga n’est pas responsable des dommages indirects ni des litiges exclusivement liés à l’exécution du fret entre client et agence.',
        ],
        en: [
          'Verga provides the technical matching and payment platform. The agency remains responsible for transport performance, announced capacity, compliance with the per-kilo floor price when it applies, and applicable regulations.',
          'The client remains responsible for accurate cargo information and shipping rules compliance.',
          'To the extent allowed by law, Verga is not liable for indirect damages or disputes solely related to freight performance between client and agency.',
        ],
      },
    },
    {
      id: 'ip',
      title: { fr: 'Propriété intellectuelle', en: 'Intellectual property' },
      paragraphs: {
        fr: [
          'La marque Verga, l’interface et les contenus propres à la plateforme sont protégés. Toute reproduction non autorisée est interdite. Les contenus d’offres restent sous la responsabilité de l’agence qui les publie.',
        ],
        en: [
          'The Verga brand, interface and platform-owned content are protected. Unauthorized reproduction is prohibited. Offer content remains the responsibility of the publishing agency.',
        ],
      },
    },
    {
      id: 'law',
      title: { fr: 'Droit applicable', en: 'Governing law' },
      paragraphs: {
        fr: [
          'Les présentes conditions sont régies par le droit applicable au Gabon, sous réserve des règles impératives de protection du consommateur éventuellement plus favorables.',
          'Pour tout litige, privilégiez d’abord le support Verga et la procédure de réclamation. À défaut d’accord, les tribunaux compétents pourront être saisis.',
        ],
        en: [
          'These terms are governed by the law applicable in Gabon, subject to any mandatory consumer protection rules that may be more favorable.',
          'For any dispute, first use Verga support and the claim process. Failing agreement, the competent courts may be seized.',
        ],
      },
    },
    {
      id: 'accept',
      title: { fr: 'Acceptation', en: 'Acceptance' },
      paragraphs: {
        fr: [
          'L’utilisation de Verga (inscription, publication d’offre, commande, paiement) vaut acceptation des présentes conditions et de la politique de confidentialité.',
          'Pour les agences, la création du compte vaut notamment acceptation des règles de prix au kilo sur les corridors indiqués, des commissions (5 % ou 2,5 % selon le cas), des frais de service client et du calendrier de reversement en fin de mois.',
          'Verga peut mettre à jour ces conditions ; la date indiquée en tête de page fait foi.',
        ],
        en: [
          'Using Verga (sign-up, publishing an offer, ordering, payment) means acceptance of these terms and the privacy policy.',
          'For agencies, creating an account especially means accepting the per-kilo price rules on the listed corridors, commissions (5% or 2.5% as applicable), client service fees and end-of-month payout schedule.',
          'Verga may update these terms; the date at the top of the page prevails.',
        ],
      },
    },
  ],
};
