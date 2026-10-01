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
    nomCommercial: "Essentiel Services Charente",
    // Accroche courte affichée sous le logo et dans les titres de pages.
    slogan: "Services à domicile, avec soin et confiance",
    // Titre de la page d'accueil (grand titre du bandeau).
    titreAccueil: "Un coup de main fiable, chez vous, quand vous en avez besoin",
    // Sous-titre du bandeau d'accueil.
    sousTitreAccueil:
      "Ménage et repassage, aide aux seniors et garde d'enfants : " +
      "une interlocutrice unique, disponible et à l'écoute, près de chez vous.",
    // Statut juridique affiché dans les mentions légales et le pied de page.
    statut: "Entrepreneure individuelle (micro-entreprise)",
    siret: "130 192 503 00014",
    // Numéro de déclaration « Services à la personne » (optionnel).
    numeroSAP: "",
    // Chemin d'une photo (à placer dans src/assets/img/). Laisser "" pour
    // afficher un avatar avec les initiales à la place.
    photo: "",
    // Années d'expérience (nombre entier, utilisé dans les chiffres clés).
    anneesExperience: 8,
    // Texte de présentation de la page « À propos » (plusieurs paragraphes).
    presentation: [
      "Je m'appelle Elisanah et j'accompagne les familles et les particuliers de la région depuis plus de huit ans. Après plusieurs années comme assistante maternelle puis auxiliaire de vie, j'ai choisi de travailler à mon compte pour offrir un service plus personnel, plus souple et plus proche des gens.",
      "Ménage et repassage, présence auprès de vos parents âgés ou garde de vos enfants : je m'adapte à votre rythme et à vos habitudes. Vous avez une interlocutrice unique, que vous connaissez, qui connaît votre maison et vos proches.",
      "Ponctualité, discrétion et bonne humeur sont les trois choses que mes clients citent le plus souvent. C'est ce que je m'engage à vous apporter, à chaque visite."
    ],
    // Valeurs affichées sur la page « À propos ».
    valeurs: [
      { titre: "Fiabilité", texte: "Je suis là quand je l'ai dit, et je préviens toujours à l'avance en cas d'imprévu." },
      { titre: "Discrétion", texte: "Votre intimité et vos informations restent chez vous. Toujours." },
      { titre: "Bienveillance", texte: "Avec les enfants comme avec les aînés, patience et écoute avant tout." },
      { titre: "Transparence", texte: "Des tarifs clairs, annoncés avant toute intervention, sans surprise." }
    ],
    // Diplômes, formations, garanties (liste libre).
    garanties: [
      "Assurance responsabilité civile professionnelle",
      "Formation Premiers secours (PSC1) à jour",
      "CAP Accompagnant éducatif petite enfance",
      "Casier judiciaire vierge (extrait n°3 disponible sur demande)",
      "Permis B et véhicule personnel assuré"
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
      rue: "121 RUE Marcel Pagnol",
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
      { jours: "Lundi – Vendredi", heures: "7h30 – 19h30" },
      { jours: "Samedi", heures: "9h00 – 17h00" },
      { jours: "Dimanche", heures: "Sur demande" }
    ],
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
      endpoint: ""
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
    titre: "Essentiel Services Charente – Ménage, repassage, aide aux seniors et garde d'enfants",
    // Description pour les moteurs de recherche (150 à 160 caractères).
    description:
      "Services à domicile à Angoulême et alentours : ménage et repassage, aide aux seniors, garde d'enfants. Devis gratuit, interlocutrice unique.",
    // Mots-clés (optionnel, peu utilisé par Google mais sans inconvénient).
    motsCles: "ménage à domicile, repassage, aide aux seniors, aide aux personnes âgées, garde d'enfants, services à domicile, Angoulême, Charente",
    langue: "fr",
    // Texte du bouton d'appel à l'action principal.
    ctaPrincipal: "Demander un devis gratuit",
    // Si true, une bannière signale que le site est en cours de construction.
    enConstruction: false
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
        "Vous manquez de temps ou d'énergie pour l'entretien de votre logement et de votre linge ? Je prends le relais, ponctuellement ou chaque semaine, avec vos produits ou les miens, selon vos préférences. Chaque intervention est adaptée à votre logement et à vos priorités.",
      prestations: [
        "Dépoussiérage, aspiration et lavage des sols",
        "Nettoyage de la cuisine et des sanitaires",
        "Repassage et pliage du linge, rangement dans les armoires",
        "Lavage du linge et changement des draps",
        "Vitres intérieures et surfaces vitrées accessibles",
        "Grand ménage de printemps, avant ou après déménagement"
      ],
      pourQui: [
        "Actifs et familles qui souhaitent gagner du temps",
        "Personnes âgées ou à mobilité réduite",
        "Propriétaires de gîtes et locations saisonnières"
      ],
      tarif: { montant: 22, unite: "h", precision: "Produits fournis sur demande (+2 €/h)" },
      // Note affichée sur la page du service (optionnel).
      note: "Intervention minimale de 2 heures. Forfaits dégressifs pour un entretien hebdomadaire."
    },
    {
      slug: "aide-seniors",
      icone: "coeur",
      titre: "Aide aux seniors",
      titreCourt: "Aide aux seniors",
      accroche: "Une présence attentive et un coup de main au quotidien pour bien vivre chez soi.",
      description:
        "Vos parents souhaitent rester chez eux, mais certaines tâches deviennent difficiles ? Je viens régulièrement les aider dans leur quotidien : entretien du logement, repas, courses, petits papiers, et surtout un moment d'échange et de compagnie. Je vous tiens informé(e) après chaque visite si vous le souhaitez.",
      // IMPORTANT : l'aide aux actes essentiels (toilette, lever, habillage),
      // la conduite et l'accompagnement hors du domicile des personnes âgées
      // nécessitent une autorisation du Conseil départemental. Ne pas les
      // ajouter ici sans cette autorisation.
      prestations: [
        "Entretien du logement et du linge, au rythme de la personne",
        "Préparation des repas à domicile, courses comprises",
        "Aide au courrier et aux petites démarches administratives",
        "Présence et compagnie : conversation, lecture, jeux",
        "Petit compte rendu à la famille après chaque visite"
      ],
      pourQui: [
        "Seniors vivant seuls qui souhaitent rester chez eux",
        "Familles éloignées qui veulent une présence régulière auprès d'un parent",
        "Personnes en convalescence après une hospitalisation"
      ],
      // Pas de tarif renseigné : la grille affiche « Sur devis ».
      note: "Pas d'aide à la toilette ni de soins médicaux : pour ces besoins, je vous oriente vers les services spécialisés."
    },
    {
      slug: "garde-enfants",
      icone: "enfant",
      titre: "Garde d'enfants",
      titreCourt: "Garde d'enfants",
      accroche: "Une présence rassurante et attentive pour vos enfants, à votre domicile.",
      description:
        "Sortie d'école, mercredi, soirée, vacances scolaires ou garde partagée : je m'occupe de vos enfants chez vous, dans leur environnement, en respectant vos règles et leur rythme. Jeux, activités créatives, aide au bain et au repas : je veille à ce qu'ils passent un bon moment en toute sécurité.",
      prestations: [
        "Sorties d'école et trajets à pied vers les activités",
        "Garde en soirée et le week-end",
        "Garde à la journée pendant les vacances scolaires",
        "Repas, bain, coucher et routines du soir",
        "Activités ludiques, créatives et sorties au parc",
        "Garde partagée entre deux familles"
      ],
      pourQui: [
        "Parents aux horaires décalés ou variables",
        "Familles avec plusieurs enfants",
        "Parents en télétravail qui ont besoin de calme"
      ],
      tarif: { montant: 14, unite: "h", precision: "Majoration de 25 % après 21h et le dimanche" },
      // La garde des enfants de moins de 3 ans exige un agrément de l'État.
      note: "Enfants de 3 à 12 ans. Premier rendez-vous de présentation offert."
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
      "Paiement par virement, chèque ou espèces.",
      "Facture remise après chaque intervention ou en fin de mois.",
      "Annulation gratuite jusqu'à 24 h avant l'intervention.",
      "Tarifs indicatifs, révisés une fois par an et communiqués à l'avance."
    ],
    // Encart sur le crédit d'impôt « services à la personne ».
    // Mettre  actif: false  pour le masquer (par ex. si l'activité n'est pas
    // déclarée auprès de l'État au titre des services à la personne).
    creditImpot: {
      actif: false,
      titre: "Jusqu'à 50 % de crédit d'impôt",
      texte:
        "Les prestations de services à la personne réalisées à votre domicile (ménage, repassage, aide aux seniors, garde d'enfants) peuvent ouvrir droit à un crédit d'impôt égal à 50 % des sommes versées, dans la limite des plafonds en vigueur. Renseignez-vous auprès de moi ou sur le site officiel du service public."
    }
  },

  /* --------------------------------------------------------------------------
   *  6. TÉMOIGNAGES CLIENTS
   *  Note affichée en étoiles (1 à 5). Utiliser uniquement de vrais avis, avec
   *  l'accord des personnes citées (prénom + initiale suffisent).
   * ------------------------------------------------------------------------ */
  temoignages: [
    // Ajouter ici de vrais avis clients, avec leur accord. Exemple :
    // { auteur: "Prénom N.", ville: "Soyaux", service: "Garde d'enfants", note: 5, texte: "…" }
  ],

  /* --------------------------------------------------------------------------
   *  7. CHIFFRES CLÉS (page d'accueil)
   * ------------------------------------------------------------------------ */
  chiffres: [
    { valeur: "8", suffixe: "ans", label: "d'expérience" },
    { valeur: "25", suffixe: "km", label: "de rayon d'intervention" },
    { valeur: "6", suffixe: "j/7", label: "du lundi au samedi" },
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
    // Nom de l'assureur RC Pro et couverture géographique (optionnel).
    assurance: { nom: "", couverture: "" }
  }
};
