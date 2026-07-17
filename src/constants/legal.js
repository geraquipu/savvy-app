import { legalLine, EMAIL_CONTACT, EMAIL_PRIVACY, DOMAIN, COMPANY_NAME, COMPANY_CITY, PUBLICATION_DIRECTOR } from './company';

/**
 * Source unique des textes légaux (CGU, confidentialité, cookies, mentions).
 *
 * Ils étaient auparavant dupliqués entre ProfileScreen et ClientView, et les
 * deux copies s'étaient contredites (SAS d'un côté, auto-entrepreneur de
 * l'autre). Un seul texte, affiché partout.
 *
 * RÈGLE : ce qui est écrit ici doit correspondre à ce que le code fait
 * réellement. Si on ajoute un sous-traitant ou un traceur, il se déclare ici
 * le même jour — c'est la liste que le RGPD (art. 13) impose de tenir à jour.
 */

export const LEGAL_UPDATED = "17 juillet 2026";

export const CGU_SECTIONS = [
  { title:"1. Objet", text:`Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation de la plateforme Savvy, accessible sur ${DOMAIN}, éditée par ${legalLine()}.` },
  { title:"2. Services proposés", text:"Savvy est une marketplace mettant en relation des experts (« Conseillers ») avec des particuliers ou professionnels (« Clients ») souhaitant bénéficier de conseils basés sur une expérience réelle et vécue." },
  { title:"3. Commission Savvy", text:"Savvy prélève une commission de 20% sur chaque transaction réalisée sur la plateforme. Le Conseiller reçoit 80% du montant payé par le Client. Cette commission couvre les frais de plateforme, de paiement sécurisé et de support client." },
  { title:"4. Responsabilités", text:"Savvy agit en tant qu'intermédiaire technique. Les conseils prodigués sont sous la responsabilité exclusive du Conseiller. Savvy ne peut être tenu responsable de la qualité ou des résultats des sessions." },
  { title:"5. Signalement et remboursements", text:"Toute annulation plus de 24h avant la session donne lieu à un remboursement intégral, traité sous 5 jours ouvrés. Si une session n'a pas lieu (Conseiller absent, problème technique), le Client peut la signaler depuis ses réservations. Chaque signalement est examiné individuellement par l'équipe Savvy, qui répond sous 24h et décide du remboursement au cas par cas." },
  { title:"6. Droit de rétractation", text:"Conformément à l'article L221-28 du Code de la consommation, le Client reconnaît que la prestation débute à la date convenue et renonce à son droit de rétractation une fois la session commencée. Avant cela, l'annulation reste possible dans les conditions de l'article 5." },
];

export const PRIVACY_SECTIONS = [
  { title:"1. Responsable du traitement", text:`${legalLine()}. Contact : ${EMAIL_PRIVACY}` },
  { title:"2. Données collectées", text:"Savvy collecte uniquement les données nécessaires au service : nom et prénom, adresse email, photo de profil (optionnelle), données de paiement (traitées et chiffrées par Stripe — Savvy ne stocke jamais les numéros de carte), historique des réservations et sessions, messages échangés avec les Conseillers." },
  { title:"3. Finalités du traitement", text:"Tes données sont utilisées pour : (a) créer et gérer ton compte, (b) traiter les paiements et remboursements, (c) te mettre en relation avec des Conseillers, (d) t'envoyer des confirmations de réservation par email, (e) améliorer la qualité et la fiabilité du service, (f) respecter nos obligations légales et fiscales." },
  { title:"4. Base légale", text:"Le traitement est fondé sur l'exécution du contrat (art. 6.1.b RGPD) pour les données nécessaires au service, sur notre intérêt légitime (art. 6.1.f RGPD) pour la sécurité et le bon fonctionnement de la plateforme, et sur ton consentement (art. 6.1.a RGPD) pour la mesure d'audience." },
  { title:"5. Destinataires des données", text:"Savvy ne vend jamais tes données. Elles sont partagées uniquement avec nos sous-traitants : Stripe (paiements, certifié PCI-DSS), Supabase (base de données et authentification, serveurs en Europe), Resend (emails transactionnels), Sentry (rapports d'erreur techniques, serveurs en Allemagne), Vercel (hébergement et, avec ton accord, mesure d'audience). Les Conseillers voient uniquement ton prénom et ta photo de profil." },
  { title:"6. Transferts hors UE", text:"Certains sous-traitants (Stripe, Vercel) peuvent traiter des données hors de l'UE avec des garanties appropriées (clauses contractuelles types de la Commission européenne). Supabase et Sentry traitent tes données au sein de l'UE." },
  { title:"7. Durée de conservation", text:`Données de compte : durée de vie du compte + 3 ans. Données de paiement : 5 ans (obligation légale fiscale). Messages : 2 ans après la dernière activité. Rapports d'erreur : 90 jours. Tu peux demander la suppression anticipée à ${EMAIL_PRIVACY}.` },
  { title:"8. Tes droits (RGPD)", text:`Tu disposes des droits suivants : accès, rectification, suppression (« droit à l'oubli »), portabilité, limitation du traitement, opposition, et retrait de ton consentement à tout moment. Pour les exercer : ${EMAIL_PRIVACY}. Réponse sous 30 jours. Tu peux également déposer une réclamation auprès de la CNIL (cnil.fr).` },
  { title:"9. Cookies et traceurs", text:"Savvy n'utilise aucun cookie publicitaire et ne revend aucune donnée à des régies. Voir le détail dans la rubrique « Gestion des cookies »." },
  { title:"10. Contact", text:`Responsable du traitement : ${COMPANY_NAME} — ${EMAIL_PRIVACY}` },
];

export const COOKIES_SECTIONS = [
  { title:"1. Ce qu'on dépose toujours", text:"Un cookie de session, strictement nécessaire pour te garder connecté(e), et ton choix de consentement lui-même (pour ne pas te reposer la question à chaque visite). Ces éléments ne demandent pas ton accord : sans eux, l'app ne fonctionne pas." },
  { title:"2. Ce qu'on dépose seulement avec ton accord", text:"Une mesure d'audience (Vercel Analytics) pour savoir quelles pages sont utilisées, et l'enregistrement anonymisé des sessions où une erreur survient (Sentry Session Replay), pour comprendre ce qui a planté. Le texte que tu saisis y est systématiquement masqué." },
  { title:"3. Ce qu'on fait sans ton accord, pour la sécurité", text:"Les rapports d'erreur techniques (Sentry) restent actifs même si tu refuses : ils nous permettent de corriger les pannes. Ils ne servent ni à te suivre ni à la publicité, et relèvent de notre intérêt légitime à faire fonctionner le service." },
  { title:"4. Ce qu'on ne fait jamais", text:"Aucun cookie publicitaire, aucun traceur de réseau social, aucune revente de données, aucun profilage à des fins marketing." },
  { title:"5. Changer d'avis", text:"Tu peux modifier ton choix à tout moment depuis cette rubrique. Ton refus est respecté sans dégradation du service." },
];

export const MENTIONS_SECTIONS = [
  { title:"Éditeur", text:`${legalLine()}\nDirecteur de la publication : ${PUBLICATION_DIRECTOR}\nContact : ${EMAIL_CONTACT}` },
  { title:"Hébergeur", text:"Vercel Inc. — les coordonnées complètes de l'hébergeur sont disponibles sur vercel.com. La base de données est hébergée par Supabase (serveurs situés dans l'Union européenne)." },
  { title:"Propriété intellectuelle", text:`L'ensemble des contenus de la plateforme (marque, textes, interface, code) est la propriété de ${COMPANY_NAME}, sauf les contenus publiés par les Conseillers, qui en restent propriétaires.` },
  { title:"Médiation de la consommation", text:"Conformément à l'article L612-1 du Code de la consommation, tout Client a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige. Les coordonnées du médiateur seront communiquées dès la finalisation de l'immatriculation." },
  { title:"Signaler un contenu", text:`Pour signaler un contenu illicite : ${EMAIL_CONTACT}. Siège : ${COMPANY_CITY}.` },
];

/** Les quatre documents, dans l'ordre où on les présente à l'utilisateur. */
export const LEGAL_DOCS = [
  { id:"privacy",  title:"Politique de confidentialité",     desc:"Comment nous protégeons tes données personnelles", sections:PRIVACY_SECTIONS },
  { id:"cgu",      title:"Conditions générales d'utilisation", desc:"Règles d'utilisation de la plateforme Savvy",     sections:CGU_SECTIONS },
  { id:"cookies",  title:"Gestion des cookies",              desc:"Ce qu'on dépose, et ce que tu peux refuser",       sections:COOKIES_SECTIONS },
  { id:"mentions", title:"Mentions légales",                 desc:`Informations légales de ${COMPANY_NAME}`,          sections:MENTIONS_SECTIONS },
];

export const legalDoc = (id) => LEGAL_DOCS.find(d => d.id === id) || null;
