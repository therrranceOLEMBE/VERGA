import { Routes } from '@angular/router';

import { Accueil } from './pages/accueil/accueil';

import { BackofficeLayout } from './pages/backoffice-layout/backoffice-layout';

import { ClientBackofficeLayout } from './pages/client-backoffice-layout/client-backoffice-layout';

import { Commandes } from './pages/commandes/commandes';

import { Connexion } from './pages/connexion/connexion';

import { CreerCollaborateur } from './pages/creer-collaborateur/creer-collaborateur';

import { CreerOffre } from './pages/creer-offre/creer-offre';

import { CreerTypeOffre } from './pages/creer-type-offre/creer-type-offre';

import { ColisClient } from './pages/colis-client/colis-client';

import { CommandesClient } from './pages/commandes-client/commandes-client';

import { DashboardClient } from './pages/dashboard-client/dashboard-client';

import { PaiementsClient } from './pages/paiements-client/paiements-client';

import { HistoriqueOffres } from './pages/historique-offres/historique-offres';

import { HistoriqueTypesOffres } from './pages/historique-types-offres/historique-types-offres';

import { ListeCollaborateurs } from './pages/liste-collaborateurs/liste-collaborateurs';

import { DetailOffre } from './pages/detail-offre/detail-offre';

import { Faq } from './pages/faq/faq';

import { Inscription } from './pages/inscription/inscription';

import { MotDePasseClient } from './pages/mot-de-passe-client/mot-de-passe-client';

import { MotDePasse } from './pages/mot-de-passe/mot-de-passe';

import { NotificationsCompte } from './pages/notifications-compte/notifications-compte';

import { NotificationsClient } from './pages/notifications-client/notifications-client';

import { NousContacter } from './pages/nous-contacter/nous-contacter';

import { Profil } from './pages/profil/profil';

import { ProfilClient } from './pages/profil-client/profil-client';

import { ReclamationsClient } from './pages/reclamations-client/reclamations-client';

import { QuiSommesNous } from './pages/qui-sommes-nous/qui-sommes-nous';

import { TableauDeBord } from './pages/tableau-de-bord/tableau-de-bord';

import { Tarifs } from './pages/tarifs/tarifs';

import { Reversements } from './pages/reversements/reversements';

import { Finances } from './pages/finances/finances';

import { Paiements } from './pages/paiements/paiements';

import { Reclamations } from './pages/reclamations/reclamations';

import { SupportLogistique } from './pages/support-logistique/support-logistique';

import { clientAuthChildGuard, clientAuthGuard } from './guards/client-auth-guard';
import { agenceAuthChildGuard, agenceAuthGuard } from './guards/agence-auth-guard';



export const routes: Routes = [

  { path: '', redirectTo: 'accueil', pathMatch: 'full' },

  { path: 'accueil', component: Accueil },

  { path: 'offre/:id', component: DetailOffre },

  { path: 'connexion', component: Connexion },

  { path: 'inscription', component: Inscription },

  { path: 'faq', component: Faq },

  { path: 'nous-contacter', component: NousContacter },

  { path: 'tarifs', component: Tarifs },

  { path: 'qui-sommes-nous', component: QuiSommesNous },

  {

    path: 'backoffice',

    component: BackofficeLayout,

    canActivate: [agenceAuthGuard],

    canActivateChild: [agenceAuthChildGuard],

    children: [

      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },

      { path: 'tableau-de-bord', component: TableauDeBord },

      { path: 'creer-offre', component: CreerOffre },

      { path: 'historique-offres', component: HistoriqueOffres },

      { path: 'creer-type-offre', component: CreerTypeOffre },

      { path: 'historique-types-offres', component: HistoriqueTypesOffres },

      { path: 'commandes', component: Commandes },

      { path: 'transactions', redirectTo: 'paiements', pathMatch: 'full' },

      { path: 'finances', component: Finances },

      { path: 'reversements', component: Reversements },

      { path: 'paiements', component: Paiements },

      { path: 'reclamations', component: Reclamations },

      { path: 'support-logistique', component: SupportLogistique },

      { path: 'creer-collaborateur', component: CreerCollaborateur },

      { path: 'liste-collaborateurs', component: ListeCollaborateurs },

      { path: 'compte/profil', component: Profil },

      { path: 'compte/notifications', component: NotificationsCompte },

      { path: 'compte/mot-de-passe', component: MotDePasse },

    ],

  },

  {

    path: 'espace-client',

    component: ClientBackofficeLayout,

    canActivate: [clientAuthGuard],

    canActivateChild: [clientAuthChildGuard],

    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: DashboardClient },

      { path: 'commandes', component: CommandesClient },

      { path: 'paiements', component: PaiementsClient },

      { path: 'colis', component: ColisClient },

      { path: 'reclamations', component: ReclamationsClient },

      { path: 'historique-transactions', redirectTo: 'paiements', pathMatch: 'full' },

      { path: 'profil', component: ProfilClient },

      { path: 'mot-de-passe', component: MotDePasseClient },

      { path: 'notifications', component: NotificationsClient },

    ],

  },

  { path: '**', redirectTo: 'accueil' },

];

