import { Language } from '../i18n/translations';

export type FaqAudience = 'client' | 'agence' | 'general';
export type FaqFilter = 'all' | FaqAudience;

export interface FaqItem {
  id: string;
  audience: FaqAudience;
  category: { fr: string; en: string };
  question: Record<Language, string>;
  answer: Record<Language, string>;
}

export const FAQ_ITEMS: FaqItem[] = [
  // ─── Client — recherche & offre ───
  {
    id: 'c-search',
    audience: 'client',
    category: { fr: 'Recherche', en: 'Search' },
    question: {
      fr: 'Comment trouver une offre de transport sur Verga ?',
      en: 'How do I find a shipping offer on Verga?',
    },
    answer: {
      fr: 'Sur la page d’accueil, parcourez le catalogue ou affinez avec les filtres : destination, type d’offre, dates. Cliquez sur une carte pour ouvrir le détail (itinéraire, prix, agence, capacité). Depuis la carte ou le détail, vous pouvez acheter ou réserver selon l’offre.',
      en: 'On the home page, browse the catalog or refine with filters: destination, offer type, dates. Open a card for details (route, price, agency, capacity). From the card or detail page you can buy or reserve depending on the offer.',
    },
  },
  {
    id: 'c-buy-vs-reserve',
    audience: 'client',
    category: { fr: 'Achat & réservation', en: 'Buy & reserve' },
    question: {
      fr: 'Quelle est la différence entre « Acheter » et « Réserver » ?',
      en: 'What is the difference between “Buy” and “Reserve”?',
    },
    answer: {
      fr: 'Acheter = paiement de la quantité totale tout de suite, puis confirmation après validation du paiement. Réserver = uniquement si l’offre a une capacité limitée : vous bloquez une quantité et payez une partie maintenant ; le solde se règle plus tard depuis vos commandes. Les offres à capacité illimitée n’affichent pas « Réserver ».',
      en: 'Buy = pay the full quantity now, then confirmation after payment validation. Reserve = only when capacity is limited: you lock a quantity and pay part now; the balance is paid later from your orders. Unlimited-capacity offers do not show “Reserve”.',
    },
  },
  {
    id: 'c-guest',
    audience: 'client',
    category: { fr: 'Achat & réservation', en: 'Buy & reserve' },
    question: {
      fr: 'Puis-je commander sans créer de compte ?',
      en: 'Can I place an order without an account?',
    },
    answer: {
      fr: 'Oui. En invité, renseignez prénom, nom, téléphone, quantité et description de la marchandise. Pour suivre commandes, paiements et colis dans l’espace client, créez un compte : les commandes liées à votre e-mail / session seront plus faciles à retrouver.',
      en: 'Yes. As a guest, provide first name, last name, phone, quantity and cargo description. To track orders, payments and parcels in the client area, create an account — linked orders are easier to find.',
    },
  },
  {
    id: 'c-quantity',
    audience: 'client',
    category: { fr: 'Achat & réservation', en: 'Buy & reserve' },
    question: {
      fr: 'Comment saisir la quantité sur une offre ?',
      en: 'How do I enter the quantity on an offer?',
    },
    answer: {
      fr: 'Chaque offre a un type défini par l’agence (avec son unité et ses règles : quantité entière ou non, minimum, etc.). L’unité affichée n’est donc pas toujours le kg, le m³ ou le conteneur : elle dépend de ce que l’agence a créé. Indiquez la quantité demandée dans cette unité ; Verga calcule une estimation (sous-total, commission, total) et vérifie le stock disponible avant le paiement. Sur certains types, la quantité peut être imposée (par exemple fixée à 1).',
      en: 'Each offer has a type defined by the agency (with its unit and rules: integer quantity or not, minimum, etc.). The displayed unit is therefore not always kg, m³ or container — it depends on what the agency created. Enter the quantity in that unit; Verga estimates subtotal, commission and total, and checks available stock before payment. On some types, quantity may be fixed (for example set to 1).',
    },
  },
  {
    id: 'c-estimate',
    audience: 'client',
    category: { fr: 'Paiement', en: 'Payment' },
    question: {
      fr: 'Comment est calculé le montant à payer ?',
      en: 'How is the amount to pay calculated?',
    },
    answer: {
      fr: 'Le montant s’appuie sur le prix de l’offre et la quantité. Une estimation affiche le sous-total, les frais de service Verga (5 % côté client) et le total avant redirection vers Bamboo Pay. En réservation, vous payez d’abord la quantité choisie maintenant ; le reste apparaît comme solde sur la commande.',
      en: 'The amount is based on the offer price and quantity. An estimate shows subtotal, Verga service fees (5% on the client side) and total before redirecting to Bamboo Pay. With a reservation you first pay the quantity chosen now; the rest appears as balance on the order.',
    },
  },
  {
    id: 'c-bamboo',
    audience: 'client',
    category: { fr: 'Paiement', en: 'Payment' },
    question: {
      fr: 'Quels moyens de paiement sont acceptés ?',
      en: 'Which payment methods are accepted?',
    },
    answer: {
      fr: 'Après validation de la commande, vous êtes redirigé vers Bamboo Pay pour régler de façon sécurisée. Si le lien de paiement n’apparaît pas, réessayez ou contactez le support depuis « Nous contacter ».',
      en: 'After confirming the order you are redirected to Bamboo Pay for secure payment. If the payment link does not appear, try again or contact support via “Contact us”.',
    },
  },
  {
    id: 'c-balance',
    audience: 'client',
    category: { fr: 'Paiement', en: 'Payment' },
    question: {
      fr: 'Comment payer le solde d’une réservation ?',
      en: 'How do I pay the balance of a reservation?',
    },
    answer: {
      fr: 'Connectez-vous à l’espace client → Commandes. Si la commande est « réservée » avec une quantité restante, utilisez « Payer le solde ». Un nouveau paiement Bamboo Pay est lancé. Impossible si la commande n’est pas réservée, si tout est déjà payé, ou si un paiement est déjà en attente.',
      en: 'Sign in to the client area → Orders. If the order is “reserved” with remaining quantity, use “Pay balance”. A new Bamboo Pay payment starts. It is blocked if the order is not reserved, everything is already paid, or a payment is already pending.',
    },
  },
  {
    id: 'c-stock',
    audience: 'client',
    category: { fr: 'Achat & réservation', en: 'Buy & reserve' },
    question: {
      fr: 'Que faire si le stock est insuffisant ?',
      en: 'What if stock is insufficient?',
    },
    answer: {
      fr: 'Si la quantité demandée dépasse la capacité disponible, l’estimation bloque la commande. Réduisez la quantité, choisissez une autre offre, ou contactez l’agence / le support pour une alternative.',
      en: 'If the requested quantity exceeds available capacity, the estimate blocks the order. Reduce quantity, pick another offer, or contact the agency / support for an alternative.',
    },
  },
  {
    id: 'c-cargo',
    audience: 'client',
    category: { fr: 'Achat & réservation', en: 'Buy & reserve' },
    question: {
      fr: 'Dois-je décrire ma marchandise et ajouter des photos ?',
      en: 'Do I need to describe my cargo and add photos?',
    },
    answer: {
      fr: 'La description de la marchandise est obligatoire pour que l’agence prépare le transport. Les photos sont optionnelles mais utiles (emballage, dimensions, état). Le téléphone est requis pour vous joindre rapidement.',
      en: 'Cargo description is required so the agency can prepare shipping. Photos are optional but helpful (packaging, size, condition). Phone is required so you can be reached quickly.',
    },
  },
  {
    id: 'c-statuses',
    audience: 'client',
    category: { fr: 'Commandes', en: 'Orders' },
    question: {
      fr: 'Que signifient les statuts de ma commande ?',
      en: 'What do my order statuses mean?',
    },
    answer: {
      fr: 'En attente : commande créée, paiement ou validation en cours. Réservée : place bloquée, solde éventuel à régler. Confirmée : paiement validé / commande confirmée côté agence. Annulée : la commande n’est plus active. Suivez le détail dans l’espace client.',
      en: 'Pending: order created, payment or validation in progress. Reserved: slot locked, possible balance to pay. Confirmed: payment validated / agency-confirmed. Cancelled: order no longer active. Track details in the client area.',
    },
  },
  {
    id: 'c-parcel',
    audience: 'client',
    category: { fr: 'Colis', en: 'Parcels' },
    question: {
      fr: 'Comment suivre mon colis ?',
      en: 'How do I track my parcel?',
    },
    answer: {
      fr: 'Dans Espace client → Colis, consultez référence, commande liée et statut : chez le client, déposé, en transit, arrivé, récupéré. L’historique montre les étapes. Vous pouvez aussi ouvrir la commande associée depuis le suivi.',
      en: 'In Client area → Parcels, see reference, linked order and status: with client, deposited, in transit, arrived, collected. History shows each step. You can also open the related order from tracking.',
    },
  },
  {
    id: 'c-claim',
    audience: 'client',
    category: { fr: 'Réclamations', en: 'Claims' },
    question: {
      fr: 'Comment ouvrir une réclamation ?',
      en: 'How do I open a claim?',
    },
    answer: {
      fr: 'Depuis une commande dans votre espace, créez une réclamation (objet + description). Elle est liée à la commande et à l’agence. Suivez l’avancement (ouverte, en cours, résolue, fermée) dans Réclamations.',
      en: 'From an order in your area, create a claim (subject + description). It is linked to the order and agency. Track progress (open, in progress, resolved, closed) under Claims.',
    },
  },
  {
    id: 'c-payments-history',
    audience: 'client',
    category: { fr: 'Paiement', en: 'Payment' },
    question: {
      fr: 'Où voir mes paiements (validé, échec, remboursé) ?',
      en: 'Where can I see my payments (validated, failed, refunded)?',
    },
    answer: {
      fr: 'Espace client → Paiements liste vos transactions avec code Verga, commande liée, montant, statut et date. Les filtres aident à retrouver un paiement en attente, validé, échoué ou remboursé.',
      en: 'Client area → Payments lists your transactions with Verga code, linked order, amount, status and date. Filters help find pending, validated, failed or refunded payments.',
    },
  },
  {
    id: 'c-account',
    audience: 'client',
    category: { fr: 'Compte', en: 'Account' },
    question: {
      fr: 'Comment créer un compte particulier et accéder à mon espace ?',
      en: 'How do I create a personal account and access my space?',
    },
    answer: {
      fr: 'Inscrivez-vous en tant que particulier, puis connectez-vous. Vous arrivez dans l’espace client (tableau de bord, commandes, paiements, colis, réclamations, profil). Le compte entreprise (agence) est un parcours distinct.',
      en: 'Sign up as an individual, then sign in. You land in the client area (dashboard, orders, payments, parcels, claims, profile). The company (agency) account is a separate path.',
    },
  },

  // ─── Agence ───
  {
    id: 'a-publish',
    audience: 'agence',
    category: { fr: 'Offres', en: 'Offers' },
    question: {
      fr: 'Comment publier une offre de transport ?',
      en: 'How do I publish a shipping offer?',
    },
    answer: {
      fr: 'Dans le backoffice : Créer une offre. Renseignez titre, type d’offre, prix (> 0), origine, destination, dates, description, statut (active/inactive). Choisissez capacité totale ou capacité illimitée. Après création, l’offre apparaît dans l’historique et, si active, dans le catalogue public.',
      en: 'In the backoffice: Create offer. Fill title, offer type, price (> 0), origin, destination, dates, description, status (active/inactive). Choose total capacity or unlimited. After creation it appears in history and, if active, in the public catalog.',
    },
  },
  {
    id: 'a-capacity',
    audience: 'agence',
    category: { fr: 'Offres', en: 'Offers' },
    question: {
      fr: 'Capacité limitée ou illimitée : quel impact pour les clients ?',
      en: 'Limited or unlimited capacity: what is the impact for clients?',
    },
    answer: {
      fr: 'Capacité limitée : stock suivi, clients peuvent Réserver (acompte + solde). Capacité illimitée : pas de bouton Réserver, achat direct. Vérifiez capacité disponible lors des modifications pour éviter les refus « stock insuffisant ».',
      en: 'Limited capacity: stock is tracked; clients can Reserve (deposit + balance). Unlimited: no Reserve button, direct buy only. Check available capacity when editing to avoid “insufficient stock” refusals.',
    },
  },
  {
    id: 'a-types',
    audience: 'agence',
    category: { fr: 'Offres', en: 'Offers' },
    question: {
      fr: 'À quoi servent les types d’offre ?',
      en: 'What are offer types for?',
    },
    answer: {
      fr: 'Les types d’offre sont créés par l’agence (ou proposés par la plateforme). Chacun définit l’unité de vente, si la quantité est entière, le minimum éventuel, et d’autres contraintes. Ce n’est pas limité au kg, au m³ ou au conteneur : l’agence choisit le type adapté à son service. Réutilisez un type existant ou créez-en un avant / pendant la publication pour que le client saisisse correctement sa quantité.',
      en: 'Offer types are created by the agency (or provided by the platform). Each one defines the sales unit, whether quantity is integer, any minimum, and other constraints. This is not limited to kg, m³ or container: the agency chooses the type that fits its service. Reuse an existing type or create one before/while publishing so clients enter quantity correctly.',
    },
  },
  {
    id: 'a-edit',
    audience: 'agence',
    category: { fr: 'Offres', en: 'Offers' },
    question: {
      fr: 'Comment modifier, désactiver ou supprimer une offre ?',
      en: 'How do I edit, deactivate or delete an offer?',
    },
    answer: {
      fr: 'Historique des offres : filtrez (active, inactive, archivée), ouvrez le détail, modifiez les champs ou changez le statut. La suppression est possible selon les actions prévues. Une offre inactive n’est plus proposée à la vente publique.',
      en: 'Offer history: filter (active, inactive, archived), open details, edit fields or change status. Deletion is available where provided. An inactive offer is no longer sold publicly.',
    },
  },
  {
    id: 'a-dates',
    audience: 'agence',
    category: { fr: 'Offres', en: 'Offers' },
    question: {
      fr: 'Date de dépôt des colis et date de départ : quelle différence ?',
      en: 'Parcel drop-off date vs departure date: what is the difference?',
    },
    answer: {
      fr: 'La date de départ indique quand le transport part. La date de dépôt (si renseignée) indique jusqu’à quand / quand les clients doivent déposer leurs colis. Affichez-les clairement pour réduire les retards et réclamations.',
      en: 'Departure date is when transport leaves. Drop-off date (if set) tells clients when they must deposit parcels. Show them clearly to reduce delays and claims.',
    },
  },
  {
    id: 'a-orders',
    audience: 'agence',
    category: { fr: 'Commandes', en: 'Orders' },
    question: {
      fr: 'Comment gérer les commandes reçues ?',
      en: 'How do I manage incoming orders?',
    },
    answer: {
      fr: 'Backoffice → Commandes : liste filtrable (en attente, réservée, confirmée, annulée). Le détail montre client, offre, quantités payées/restantes, montants, paiements et colis. Exportez en Excel ou PDF si besoin.',
      en: 'Backoffice → Orders: filterable list (pending, reserved, confirmed, cancelled). Detail shows client, offer, paid/remaining quantities, amounts, payments and parcels. Export to Excel or PDF if needed.',
    },
  },
  {
    id: 'a-parcel',
    audience: 'agence',
    category: { fr: 'Logistique', en: 'Logistics' },
    question: {
      fr: 'Comment faire avancer le statut d’un colis ?',
      en: 'How do I advance a parcel status?',
    },
    answer: {
      fr: 'Support logistique : ouvrez le colis et passez au statut suivant dans l’ordre (chez le client → déposé → en transit → arrivé → récupéré), avec commentaire optionnel. Le client voit la mise à jour dans son suivi. Un lien « Voir la commande » mène à la commande liée.',
      en: 'Logistics support: open the parcel and move to the next status in order (with client → deposited → in transit → arrived → collected), with an optional comment. The client sees updates in tracking. “View order” opens the linked order.',
    },
  },
  {
    id: 'a-claims',
    audience: 'agence',
    category: { fr: 'Réclamations', en: 'Claims' },
    question: {
      fr: 'Comment traiter une réclamation client ?',
      en: 'How do I handle a client claim?',
    },
    answer: {
      fr: 'Dans Réclamations, ouvrez le dossier, consultez la commande liée, puis faites avancer le statut (ouverte → en cours → résolue → fermée) selon les transitions autorisées. Vous pouvez aussi créer une réclamation depuis une commande si nécessaire.',
      en: 'In Claims, open the case, review the linked order, then advance status (open → in progress → resolved → closed) per allowed transitions. You can also create a claim from an order if needed.',
    },
  },
  {
    id: 'a-finance',
    audience: 'agence',
    category: { fr: 'Finances', en: 'Finance' },
    question: {
      fr: 'Où voir mes paiements et reversements ?',
      en: 'Where do I see payments and payouts?',
    },
    answer: {
      fr: 'Paiements : historique des encaissements liés aux commandes (validé, en attente, échec, remboursé). Finances / Reversements : Verga reverse les montants encaissés pour l’agence chaque fin de mois (après commissions). Publier une offre est gratuit ; les règles de commission et de prix au kilo sont détaillées dans les Conditions générales.',
      en: 'Payments: history of collections linked to orders (validated, pending, failed, refunded). Finance / Payouts: Verga pays out amounts collected for the agency at the end of each month (after commissions). Publishing an offer is free; commission and per-kilo price rules are detailed in the Terms.',
    },
  },
  {
    id: 'a-failed-pay',
    audience: 'agence',
    category: { fr: 'Finances', en: 'Finance' },
    question: {
      fr: 'Que faire si un paiement client est en échec ou remboursé ?',
      en: 'What if a client payment fails or is refunded?',
    },
    answer: {
      fr: 'Consultez le statut dans Paiements et le détail de la commande. Un échec peut laisser la commande en attente : le client peut réessayer. Un remboursement apparaît dans l’historique. Pour un litige, utilisez la réclamation ou contactez le support Verga.',
      en: 'Check status in Payments and order detail. A failure may leave the order pending: the client can retry. A refund appears in history. For a dispute, use a claim or contact Verga support.',
    },
  },

  // ─── Général ───
  {
    id: 'g-accounts',
    audience: 'general',
    category: { fr: 'Comptes', en: 'Accounts' },
    question: {
      fr: 'Compte particulier ou compte entreprise : lequel choisir ?',
      en: 'Personal or company account: which should I choose?',
    },
    answer: {
      fr: 'Particulier : rechercher, acheter/réserver, payer, suivre colis et réclamations. Entreprise (agence) : publier des offres, gérer commandes, logistique, paiements et finances. Les sessions sont distinctes : connectez-vous avec le bon type de compte.',
      en: 'Individual: search, buy/reserve, pay, track parcels and claims. Company (agency): publish offers, manage orders, logistics, payments and finance. Sessions are separate: sign in with the right account type.',
    },
  },
  {
    id: 'g-pricing',
    audience: 'general',
    category: { fr: 'Tarifs', en: 'Pricing' },
    question: {
      fr: 'Publier une offre est-il gratuit ? Qui paie la commission ?',
      en: 'Is publishing an offer free? Who pays the commission?',
    },
    answer: {
      fr: 'La publication est gratuite. L’agence verse à Verga 5 % du montant reçu sur chaque paiement ou réservation (2,5 % si les prix sont homologués). Le client paie 5 % de frais de service à Verga. Sur Gabon↔Chine et Gabon↔France, le kilo est fixé à 8 500 FCFA. Ces règles figurent dans les Conditions générales et peuvent évoluer.',
      en: 'Publishing is free. The agency pays Verga 5% of the amount received on each payment or reservation (2.5% if prices are homologated). The client pays a 5% service fee to Verga. On Gabon↔China and Gabon↔France, the kilo is set at 8,500 FCFA. These rules are in the Terms and may change.',
    },
  },
  {
    id: 'g-security',
    audience: 'general',
    category: { fr: 'Sécurité', en: 'Security' },
    question: {
      fr: 'Les paiements sont-ils sécurisés ?',
      en: 'Are payments secure?',
    },
    answer: {
      fr: 'Les règlements passent par Bamboo Pay après création de la commande. Verga ne vous demande pas de saisir vos données bancaires dans le formulaire d’offre. Conservez vos codes Verga / références pour le suivi.',
      en: 'Payments go through Bamboo Pay after order creation. Verga does not ask for bank details in the offer form. Keep your Verga codes / references for tracking.',
    },
  },
  {
    id: 'g-support',
    audience: 'general',
    category: { fr: 'Support', en: 'Support' },
    question: {
      fr: 'Comment contacter le support Verga ?',
      en: 'How do I contact Verga support?',
    },
    answer: {
      fr: 'Page « Nous contacter » : formulaire, WhatsApp conseiller, e-mail et horaires. La FAQ répond d’abord aux cas fréquents ; pour un litige sur une commande, ouvrez aussi une réclamation dans votre espace.',
      en: '“Contact us” page: form, advisor WhatsApp, email and hours. FAQ covers common cases first; for an order dispute, also open a claim in your space.',
    },
  },
  {
    id: 'g-refund',
    audience: 'general',
    category: { fr: 'Remboursements', en: 'Refunds' },
    question: {
      fr: 'Comment fonctionne un remboursement ?',
      en: 'How do refunds work?',
    },
    answer: {
      fr: 'Un paiement peut apparaître comme remboursé dans l’historique. Les conditions dépendent du motif (annulation, litige, erreur). Contactez le support ou ouvrez une réclamation liée à la commande pour un traitement suivi.',
      en: 'A payment may show as refunded in history. Conditions depend on the reason (cancellation, dispute, error). Contact support or open a claim linked to the order for tracked handling.',
    },
  },
];
