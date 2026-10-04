/**
 * ============================================================================
 *  FICHIER DE CONFIGURATION CENTRAL DU SITE
 * ============================================================================
 *
 *  C'est LE SEUL fichier à modifier pour personnaliser le site :
 *  identité de la cliente, coordonnées, nom de domaine, services, tarifs,
 *  témoignages, mentions légales…
 *
 *  Après chaque modification, régénérer le site avec :   npm run build
 *  (ou  node build.js). Le résultat se trouve dans le dossier  dist/
 *
 *  Règles d'écriture :
 *   - Les textes sont entre guillemets doubles "..." (ou entre backticks `...`
 *     pour les textes longs sur plusieurs lignes).
 *   - Ne pas supprimer les virgules en fin de ligne.
 *   - Les champs marqués (optionnel) peuvent être laissés vides : "".
 *   - Les valeurs actuelles sont des EXEMPLES à remplacer.
 * ============================================================================
 */

module.exports = {

  /* --------------------------------------------------------------------------
   *  1. IDENTITÉ DE LA PRESTATAIRE
   * ------------------------------------------------------------------------ */
  identite: {
    prenom: "Elisanah",
    nom: "Mauricio",
    // Nom affiché dans le logo, le titre du site et les textes. Peut être
    // le nom de la personne ("Claire Martin") ou un nom commercial.
    nomCommercial: "Essentiel Services",
    // Accroche courte affichée sous le logo et dans les titres de pages.
    slogan: "Services à domicile, avec soin et confiance",
    // Titre de la page d'accueil (grand titre du bandeau).
    titreAccueil: "Un coup de main fiable, chez vous, quand vous en avez besoin",
    // Sous-titre du bandeau d'accueil.
    sousTitreAccueil:
      "Ménage et repassage, garde d'enfants, soutien scolaire et aide aux seniors : " +
      "une interlocutrice unique, sérieuse et à l'écoute, près de chez vous.",
    // Statut juridique affiché dans les mentions légales et le pied de page.
    statut: "Entrepreneure individuelle (EI) – micro-entrepreneure",
    siret: "130 192 503 00014",
    // Numéro de déclaration « Services à la personne » (optionnel).
    numeroSAP: "",
    // Chemin d'une photo (à placer dans src/assets/img/). Laisser "" pour
    // afficher un avatar avec les initiales à la place.
    photo: "",
    // Texte de présentation de la page « À propos » (plusieurs paragraphes).
    presentation: [
      "Je m'appelle Elisanah. Après un baccalauréat général puis une licence de psychologie de l'éducation et du développement de l'enfant, j'ai travaillé quatre ans dans le soutien scolaire, deux ans dans l'aide à la personne, et régulièrement chez des particuliers pour des prestations de ménage, avec aussi une expérience de l'entretien professionnel. J'ai choisi de travailler à mon compte pour mettre cette expérience au service de mes clients, avec un service de proximité, sérieux et adapté à leurs besoins.",
      "Ménage et repassage, garde et soutien scolaire de vos enfants, présence auprès de vos parents âgés : je m'adapte à votre rythme et à vos habitudes. Vous avez une interlocutrice unique, que vous connaissez, qui connaît votre maison et vos proches.",
      "Ce que j'aime le plus, c'est me rendre utile. Sérieux, discrétion et bienveillance : ce sont les engagements que je prends auprès de chaque client, à chaque intervention."
    ],
    // Valeurs affichées sur la page « À propos ».
    valeurs: [
      { titre: "Fiabilité", texte: "Je suis là quand je l'ai dit, et je préviens toujours à l'avance en cas d'imprévu." },
      { titre: "Discrétion", texte: "Votre intimité et vos informations restent chez vous. Toujours." },
      { titre: "Bienveillance", texte: "Avec les enfants comme avec les aînés, patience et écoute avant tout." },
      { titre: "Transparence", texte: "Des tarifs clairs, annoncés avant toute intervention, sans surprise." }
    ],
    // Diplômes, formations, garanties (liste libre). N'indiquer que ce qui peut
    // être prouvé. L'assurance RC Pro est ajoutée automatiquement à l'affichage
    // dès que legal.assurance.nom est renseigné.
    garanties: [
      "Baccalauréat général",
      "Licence de psychologie de l'éducation et du développement de l'enfant",
      "4 ans d'expérience en soutien scolaire",
      "Devis écrit gratuit et sans engagement"
    ]
  },

  /* --------------------------------------------------------------------------
   *  2. COORDONNÉES
   * ------------------------------------------------------------------------ */
  contact: {
    email: "elisanahboukila@gmail.com",
    // Numéro tel qu'affiché sur le site.
    telephone: "07 45 37 00 74",
    // Même numéro au format international (utilisé pour les liens cliquables
    // tel: et WhatsApp). Ex. : "+33600000000"
    telephoneInternational: "+33745370074",
    // Afficher un bouton WhatsApp ? (true / false)
    whatsapp: true,
    adresse: {
      // Volontairement vide : l'adresse du domicile n'est pas publique.
      // L'adresse publiée dans les mentions légales est legal.adresseEditeur.
      rue: "",
      codePostal: "16600",
      ville: "Ruelle-sur-Touvre",
      // Afficher la rue sur le site ? (false = seulement ville + code postal,
      // recommandé pour une activité à domicile)
      afficherRue: false
    },
    // Zone d'intervention : communes desservies (affichées sur le site).
    zone: {
      rayonKm: 25,
      villes: ["Angoulême", "Soyaux", "La Couronne", "Saint-Yrieix-sur-Charente", "Gond-Pontouvre", "Ruelle-sur-Touvre", "Fléac", "Champniers"]
    },
    horaires: [
      { jours: "Lundi – Vendredi", heures: "8h00 – 18h00" },
      { jours: "Samedi – Dimanche", heures: "Indisponible" }
    ],
    // Plages où le téléphone est décroché (affichées sous le numéro).
    horairesTelephone: "9h – 12h et 15h – 17h",
    // Congés annuels (affichés sous les horaires). "" pour masquer.
    conges: "Congés annuels : une semaine en juillet, août, septembre et octobre, deux semaines en décembre.",
    // Frais appliqués hors de la zone d'intervention (affichés sous la zone).
    fraisDeplacement: "Au-delà de cette zone, des frais de déplacement sont indiqués sur le devis.",
    // Prise de rendez-vous en ligne (Calendly, Cal.com, Google Agenda…) :
    // lien du créneau de premier rendez-vous. "" = bouton masqué.
    rendezVous: { url: "" },
    // Réseaux sociaux (laisser "" pour masquer une icône).
    reseaux: {
      facebook: "",
      instagram: "",
      linkedin: ""
    },
    /**
     * Formulaire de contact.
     * Le site est statique (sans serveur) : pour recevoir les messages par
     * e-mail, il faut un service tiers gratuit comme Formspree
     * (https://formspree.io) ou FormSubmit (https://formsubmit.co).
     *  - Formspree : créer un formulaire, puis coller l'URL fournie, par ex.
     *      "https://formspree.io/f/xxxxxxxx"
     *  - FormSubmit : "https://formsubmit.co/ajax/contact@exemple.fr"
     * Si ce champ est vide, le bouton « Envoyer » ouvrira simplement le logiciel
     * de messagerie du visiteur avec le message pré-rempli (mailto:).
     */
    formulaire: {
      endpoint: "",
      // Si un service tiers est utilisé (endpoint renseigné), l'indiquer ici :
      // il est cité dans les mentions légales (RGPD). Ex. : nom "Formspree",
      // pays "États-Unis (clauses contractuelles types / Data Privacy Framework)".
      prestataire: { nom: "", pays: "" }
    }
  },

  /* --------------------------------------------------------------------------
   *  3. SITE & NOM DE DOMAINE
   * ------------------------------------------------------------------------ */
  site: {
    // Adresse complète du site en ligne, SANS barre oblique finale.
    // Sert aux balises SEO, au sitemap.xml et aux liens de partage.
    url: "https://www.essentielservicescharente.fr",
    // Titre par défaut (onglet du navigateur, moteurs de recherche).
    titre: "Essentiel Services – Ménage, garde d'enfants, soutien scolaire, aide aux seniors (Charente)",
    // Description pour les moteurs de recherche (150 à 160 caractères).
    description:
      "Ménage, repassage, garde d'enfants, soutien scolaire et aide aux seniors à domicile à Angoulême et alentours. Devis gratuit sous 48 h.",
    // Mots-clés (optionnel, peu utilisé par Google mais sans inconvénient).
    motsCles: "ménage à domicile, repassage, garde d'enfants, soutien scolaire, aide aux devoirs, aide aux seniors, services à domicile, Angoulême, Charente",
    langue: "fr",
    // Texte du bouton d'appel à l'action principal.
    ctaPrincipal: "Demander un devis gratuit",
    // Si true, une bannière signale que le site est en cours de construction.
    enConstruction: true,
    // Indexation par les moteurs de recherche. false = le site reste visible
    // pour qui a le lien mais n'est pas référencé (lancement progressif).
    // Passer à true à la mise en ligne définitive.
    indexable: false
  },

  /* --------------------------------------------------------------------------
   *  4. SERVICES PROPOSÉS
   *  Chaque service génère automatiquement sa propre page  services/<slug>.html
   *  Icônes disponibles : "menage", "enfant", "ecole", "voiture", "coeur",
   *  "maison", "etoile", "horloge"
   * ------------------------------------------------------------------------ */
  services: [
    {
      slug: "menage",
      icone: "menage",
      titre: "Ménage & repassage",
      titreCourt: "Ménage & repassage",
      accroche: "Un intérieur propre et du linge impeccable, entretenus avec soin et régularité.",
      description:
        "Vous manquez de temps ou d'énergie pour l'entretien de votre logement, de votre location ou de vos locaux ? Je prends le relais, ponctuellement ou régulièrement, avec sérieux et discrétion. Chaque intervention est adaptée à vos priorités. Les produits d'entretien et le matériel sont fournis par le client.",
      // Prestations regroupées par thème (titre + liste).
      groupes: [
        { titre: "Entretien courant", items: [
          "Aspirer, balayer et laver les sols",
          "Dépoussiérer les meubles et les surfaces",
          "Nettoyer les tables, plans de travail et poignées de portes",
          "Vider les poubelles",
          "Nettoyer les miroirs et les vitres accessibles",
          "Faire les lits et changer les draps si prévu"
        ] },
        { titre: "Cuisine", items: [
          "Plan de travail, évier et robinetterie",
          "Table et surfaces extérieures des meubles",
          "Plaque de cuisson et micro-ondes",
          "Traces et éclaboussures sur les murs et crédences"
        ] },
        { titre: "Salle de bain et WC", items: [
          "Lavabo, robinetterie, douche, baignoire et parois",
          "WC et miroir",
          "Désinfection des surfaces prévues",
          "Lavage du sol, cheveux et saletés enlevés"
        ] },
        { titre: "Bureaux et commerces", items: [
          "Bureaux et surfaces dépoussiérés, sols aspirés et lavés",
          "Espaces communs et sanitaires nettoyés",
          "Surfaces fréquemment touchées nettoyées"
        ] },
        { titre: "Chambres d'hôtel et locations", items: [
          "Lits faits, draps et serviettes changés",
          "Salle de bain et WC nettoyés, sols aspirés et lavés",
          "Réapprovisionnement des produits prévus par l'établissement"
        ] },
        { titre: "Repassage", items: [
          "Repassage et pliage du linge (facturé à part, sur devis)"
        ] }
      ],
      // Ce qui n'est pas fait (affiché sur la page, évite les malentendus).
      exclusions: [
        "Nettoyage en hauteur nécessitant une échelle importante ou un équipement spécifique (façades, toiture, gouttières, vitres très difficiles d'accès)",
        "Nettoyage après sinistre important (incendie, inondation) ou de déchets dangereux ou contaminés",
        "Manipulation de produits chimiques dangereux",
        "Débouchage de canalisations, travaux de plomberie ou d'électricité, réparation d'appareils électroménagers",
        "Déplacement d'objets extrêmement lourds",
        "Jardinage, entretien des espaces verts et lavage de véhicules",
        "Logements présentant un risque particulier sans conditions de sécurité adaptées"
      ],
      pourQui: [
        "Particuliers qui souhaitent gagner du temps",
        "Propriétaires de locations et de gîtes",
        "Entreprises, bureaux et commerces",
        "Hôtels et hébergements touristiques"
      ],
      tarif: {
        montant: 22, unite: "h",
        precision: "Produits et matériel fournis par le client. Repassage facturé à part.",
        // Forfaits d'heures dégressifs : le prix par heure est calculé automatiquement.
        forfaits: [
          { heures: 5, prix: 105 },
          { heures: 10, prix: 200 },
          { heures: 20, prix: 380 }
        ]
      },
      note: "Intervention minimale de 2 heures. Je n'interviens pas en présence d'animaux. Grands ménages, gîtes et locations saisonnières : devis personnalisé après échange sur vos besoins."
    },
    {
      slug: "garde-enfants",
      icone: "enfant",
      titre: "Garde d'enfants",
      titreCourt: "Garde d'enfants",
      accroche: "Une présence rassurante et attentive pour vos enfants, à votre domicile.",
      description:
        "Sortie d'école, mercredi, vacances scolaires ou garde partagée : je m'occupe de vos enfants chez vous, dans leur environnement, en respectant vos règles et leur rythme. Jeux, activités créatives, aide aux devoirs et au goûter : je veille à ce qu'ils passent un bon moment en toute sécurité.",
      // Garde à domicile des enfants de plus de 3 ans uniquement (la garde des
      // moins de 3 ans exige un agrément de l'État).
      prestations: [
        "Sorties d'école et trajets à pied vers les activités",
        "Garde à la journée le mercredi et pendant les vacances scolaires",
        "Repas, goûter et routines de l'après-midi",
        "Aide aux devoirs",
        "Activités ludiques, créatives et sorties au parc",
        "Garde partagée entre deux familles"
      ],
      exclusions: [
        "Garde des enfants de moins de 3 ans",
        "Garde de nuit",
        "Garde d'un enfant malade",
        "Transport des enfants en voiture"
      ],
      pourQui: [
        "Parents aux horaires variables",
        "Familles avec plusieurs enfants",
        "Parents en télétravail qui ont besoin de calme"
      ],
      tarif: { montant: 14, unite: "h", precision: "Tarif horaire, 4 enfants au maximum." },
      note: "Enfants de 3 à 10 ans, 4 enfants au maximum. Je n'interviens pas en présence d'animaux. Premier rendez-vous de présentation offert."
    },
    {
      slug: "soutien-scolaire",
      icone: "ecole",
      titre: "Soutien scolaire",
      titreCourt: "Soutien scolaire",
      accroche: "Un accompagnement bienveillant pour aider votre enfant à progresser, de la maternelle au CM2.",
      description:
        "Les devoirs sont une source de tension, ou votre enfant a besoin d'être rassuré dans certaines matières ? Je l'aide à comprendre ses leçons, à consolider ses acquis et à gagner en autonomie. Les séances sont adaptées au niveau et aux besoins de chaque enfant, de la maternelle au CM2.",
      groupes: [
        { titre: "Devoirs et leçons", items: [
          "Aider à faire les devoirs, relire et expliquer les consignes",
          "Réexpliquer une leçon qui n'a pas été comprise",
          "Faire réciter les poésies, leçons et textes",
          "Préparer une évaluation avec des exercices de révision adaptés au niveau"
        ] },
        { titre: "Français", items: [
          "Lecture, lecture à voix haute et compréhension",
          "Vocabulaire, grammaire, conjugaison et orthographe",
          "Expression écrite"
        ] },
        { titre: "Mathématiques", items: [
          "Calcul : additions, soustractions, multiplications, divisions",
          "Apprentissage des tables de multiplication",
          "Problèmes, géométrie et mesures"
        ] },
        { titre: "Méthode et confiance en soi", items: [
          "S'organiser dans ses devoirs",
          "Apprendre des méthodes de travail : lire une consigne, souligner les informations importantes, vérifier son travail",
          "Encourager l'enfant et l'aider à prendre confiance en lui",
          "Petites activités éducatives pour rendre les apprentissages plus agréables"
        ] }
      ],
      pourQui: [
        "Enfants de la maternelle au CM2",
        "Parents qui n'ont pas le temps d'accompagner les devoirs",
        "Enfants qui ont besoin de reprendre confiance"
      ],
      tarif: {
        montant: 20, unite: "h",
        precision: "Séance minimale de 1 h 30.",
        forfaits: [
          { heures: 5, prix: 95 },
          { heures: 10, prix: 180 },
          { heures: 20, prix: 340 }
        ]
      },
      note: "Les heures d'un forfait peuvent servir pour les devoirs, les révisions, l'apprentissage des leçons, la lecture, le français, les mathématiques et la consolidation des acquis."
    },
    {
      slug: "aide-seniors",
      icone: "coeur",
      titre: "Aide aux seniors",
      titreCourt: "Aide aux seniors",
      accroche: "Une présence attentive et un coup de main au quotidien pour bien vivre chez soi.",
      description:
        "Vos parents souhaitent rester chez eux, mais certaines tâches deviennent difficiles ? Je viens les aider dans leur quotidien : entretien du logement et du linge, repas, courses, petites démarches, et surtout un moment d'échange et de compagnie. Je vous tiens informé(e) après chaque visite si vous le souhaitez.",
      // IMPORTANT : l'aide aux actes essentiels (toilette, lever, habillage) des
      // personnes âgées nécessite une autorisation du Conseil départemental.
      // Ne pas les ajouter ici sans cette autorisation.
      prestations: [
        "Entretien du logement et du linge, au rythme de la personne",
        "Préparation des repas à domicile, courses comprises",
        "Aide au courrier et aux petites démarches administratives",
        "Présence et compagnie : conversation, lecture, jeux",
        "Compte rendu à la famille après chaque visite, si vous le souhaitez"
      ],
      exclusions: [
        "Aide à la toilette, à l'habillage et au lever",
        "Soins médicaux et paramédicaux",
        "Transport de personnes en voiture"
      ],
      pourQui: [
        "Seniors vivant seuls qui souhaitent rester chez eux",
        "Familles éloignées qui veulent une présence régulière auprès d'un parent",
        "Personnes en convalescence après une hospitalisation"
      ],
      tarif: { montant: 22, unite: "h", precision: "Produits et matériel fournis par le client." },
      note: "Pas d'aide à la toilette ni de soins médicaux : pour ces besoins, je vous oriente vers les services spécialisés. Je n'interviens pas en présence d'animaux."
    }
  ],

  /* --------------------------------------------------------------------------
   *  5. TARIFS – informations générales (la grille détaillée vient des services)
   * ------------------------------------------------------------------------ */
  tarifs: {
    introduction:
      "Des tarifs simples et transparents, sans frais cachés. Chaque devis est gratuit et établi après un premier échange, en fonction de vos besoins réels.",
    conditions: [
      "Devis gratuit et sans engagement, établi sous 48 h.",
      "Forfaits dégressifs de 5, 10 ou 20 heures.",
      "Paiement par virement, chèque ou espèces (dans la limite légale de 1 000 € en espèces).",
      "Règlement après chaque intervention ; pour les prestations régulières, facture récapitulative en fin de mois, à régler à réception.",
      "Pas d'acompte pour les prestations habituelles ; un acompte peut être demandé pour une prestation importante ou nécessitant une réservation spécifique.",
      "Annulation sans frais jusqu'à 24 h avant l'intervention. En cas d'annulation tardive répétée ou de déplacement inutile (client absent, accès impossible), 1 heure de prestation peut être facturée.",
      "Frais de déplacement au-delà de la zone d'intervention, indiqués sur le devis.",
      "Tarifs indicatifs, révisés une fois par an et communiqués à l'avance."
    ],
    // Encart sur le crédit d'impôt « services à la personne ».
    // Mettre  actif: false  pour le masquer (par ex. si l'activité n'est pas
    // déclarée auprès de l'État au titre des services à la personne).
    creditImpot: {
      actif: false,
      titre: "Jusqu'à 50 % de crédit d'impôt",
      texte:
        "Les prestations de services à la personne réalisées à votre domicile (ménage, repassage, garde d'enfants, soutien scolaire, aide aux seniors) peuvent ouvrir droit à un crédit d'impôt égal à 50 % des sommes versées, dans la limite des plafonds en vigueur. Renseignez-vous auprès de moi ou sur le site officiel du service public."
    }
  },

  /* --------------------------------------------------------------------------
   *  6. TÉMOIGNAGES CLIENTS
   *  Note affichée en étoiles (1 à 5). Utiliser uniquement de vrais avis, avec
   *  l'accord des personnes citées (prénom + initiale suffisent).
   * ------------------------------------------------------------------------ */
  temoignages: [
    // Ajouter ici de vrais avis clients, avec leur accord. Exemple :
    // { auteur: "Prénom N.", ville: "Soyaux", service: "Soutien scolaire", note: 5, texte: "…" }
  ],

  /* --------------------------------------------------------------------------
   *  7. CHIFFRES CLÉS (page d'accueil)
   * ------------------------------------------------------------------------ */
  chiffres: [
    { valeur: "4", suffixe: "ans", label: "de soutien scolaire" },
    { valeur: "25", suffixe: "km", label: "de rayon d'intervention" },
    { valeur: "5", suffixe: "j/7", label: "du lundi au vendredi" },
    { valeur: "48", suffixe: "h", label: "pour recevoir votre devis" }
  ],

  /* --------------------------------------------------------------------------
   *  8. FONCTIONNEMENT (« Comment ça marche ? » sur la page d'accueil)
   * ------------------------------------------------------------------------ */
  etapes: [
    { titre: "Vous me contactez", texte: "Par téléphone, e-mail ou via le formulaire. Décrivez-moi simplement votre besoin." },
    { titre: "On fait connaissance", texte: "Un premier rendez-vous gratuit chez vous pour comprendre vos attentes et définir ensemble le cadre." },
    { titre: "Je m'occupe de tout", texte: "Devis clair, planning fixé, et je viens chez vous aux horaires convenus. Vous n'avez plus qu'à souffler." }
  ],

  /* --------------------------------------------------------------------------
   *  9. MENTIONS LÉGALES
   *  Obligatoires en France pour tout site professionnel.
   * ------------------------------------------------------------------------ */
  legal: {
    // Hébergeur du site (obligatoire) – exemples : OVH, o2switch, Netlify…
    hebergeur: {
      nom: "OVH SAS",
      adresse: "2 rue Kellermann, 59100 Roubaix, France",
      telephone: "1007",
      site: "https://www.ovhcloud.com"
    },
    // Directeur / directrice de la publication (généralement la prestataire).
    directeurPublication: "Elisanah Mauricio",
    // Année de mise en ligne (pour le copyright « 2024 – 2026 »).
    anneeCreation: 2026,
    // Numéro de TVA intracommunautaire ("" si non assujettie – franchise en base).
    tva: "",
    // Assurance responsabilité civile professionnelle : nom, adresse de
    // l'assureur et couverture géographique (information due au client,
    // art. R.111-2 du Code de la consommation).
    assurance: { nom: "", adresse: "", couverture: "" },
    // Adresse de l'éditrice publiée dans les mentions légales (OBLIGATOIRE,
    // LCEN art. 6-III). Laisser "" pour utiliser l'adresse postale de
    // contact.adresse (rue + code postal + ville), même si afficherRue est
    // false. Pour ne pas exposer un domicile, indiquer ici une adresse de
    // domiciliation déclarée à l'administration.
    adresseEditeur: "",
    // Inscription au registre, telle qu'elle figure sur l'extrait officiel
    // (SIRENE / guichet unique). Ex. : "Immatriculée au RCS d'Angoulême",
    // "Inscrite au répertoire des métiers", ou "" si aucune mention.
    registre: "",
    // Code APE/NAF de l'activité (optionnel). Ex. : "81.21Z".
    codeAPE: "",
    // Médiateur de la consommation (OBLIGATOIRE, art. L.612-1 et L.616-1 du
    // Code de la consommation) : adhérer à un médiateur référencé (liste de
    // la CECMC sur economie.gouv.fr) puis renseigner ses coordonnées.
    mediateur: { nom: "", adresse: "", site: "", email: "" }
  }
};
