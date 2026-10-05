# Site vitrine – Services à domicile

Site internet complet, statique et sans dépendance, pour une prestataire indépendante
(ménage et repassage, garde d'enfants, soutien scolaire, aide aux seniors).

**Toutes les informations personnelles et le contenu éditable sont centralisés dans un seul
fichier : `config/site.config.js`.** Un script (`build.js`) les injecte dans l'ensemble des
pages et génère le site final dans `dist/`.

---

## 1. Démarrage rapide

Prérequis : [Node.js](https://nodejs.org) version 18 ou plus (aucun module à installer).

```bash
# 1. Personnaliser le site
#    → ouvrir config/site.config.js et remplacer les valeurs d'exemple

# 2. Générer le site
npm run build          # ou :  node build.js

# 3. Prévisualiser dans le navigateur (http://localhost:8080)
npm run serve          # ou :  node serve.js

# Mode confort : régénération automatique à chaque modification + aperçu local
npm run dev
```

Le dossier **`dist/`** contient le site prêt à être mis en ligne : il suffit d'en copier le
contenu chez l'hébergeur (voir § 6).

---

## 2. Structure du projet

```
site-services-domicile/
├── config/
│   └── site.config.js       ← LE fichier à modifier (identité, contact, domaine, services, tarifs…)
├── src/
│   ├── layouts/base.html    ← squelette HTML commun (head, header, footer)
│   ├── partials/            ← blocs réutilisables (header, footer, témoignages, bandeau CTA…)
│   ├── pages/               ← une page = un fichier (index, à propos, tarifs, contact, mentions légales, conditions générales, 404)
│   ├── templates/service.html ← modèle utilisé pour générer une page par service
│   ├── static/.htaccess     ← fichiers copiés tels quels à la racine du site
│   └── assets/
│       ├── css/style.css    ← charte graphique (variables de couleurs en tête de fichier)
│       ├── js/main.js       ← menu mobile, formulaire, animations
│       ├── icons/*.svg      ← icônes originales (inlinées à la génération)
│       ├── img/partage.png  ← image affichée lors d'un partage sur les réseaux sociaux
│       └── fonts/           ← polices auto-hébergées (licence OFL)
├── scripts/
│   ├── check.js             ← contrôle qualité du site généré (liens, titres, images…)
│   ├── documents.js         ← modèles de devis et de contrat (Word, PDF) depuis la config
│   └── dev.js               ← build --watch + serveur local
├── build.js                 ← générateur (moteur de templates maison, sitemap, robots, favicon)
├── serve.js                 ← serveur de prévisualisation
└── dist/                    ← SITE GÉNÉRÉ (ne pas modifier à la main, il est recréé à chaque build)
```

---

## 3. Le fichier de configuration `config/site.config.js`

Le fichier est abondamment commenté. Les sections :

| Section | Contenu |
|---|---|
| `identite` | prénom, nom, nom commercial, slogan, titre du bandeau d'accueil, statut, SIRET, photo, présentation, valeurs, garanties |
| `contact` | e-mail, téléphone (affiché + international), WhatsApp, adresse, zone d'intervention, horaires, réseaux sociaux, formulaire |
| `site` | **URL du site (nom de domaine)**, titre et description SEO, bouton d'appel à l'action |
| `services` | liste des services : chacun génère sa page `services/<slug>.html` (titre, description, prestations, tarif, note…) |
| `tarifs` | introduction, conditions, encart crédit d'impôt (activable/désactivable) |
| `temoignages` | avis clients (auteur, ville, service, note sur 5, texte) |
| `chiffres` / `etapes` | chiffres clés et « comment ça marche » de la page d'accueil |
| `legal` | hébergeur, directeur de publication, TVA, assurance (mentions légales) |

Quelques règles pratiques :

- Les textes sont entre guillemets doubles `"…"`. Pour un texte contenant des guillemets, utiliser
  les backticks `` `…` `` ou les guillemets français « … ».
- Ne pas oublier la virgule à la fin de chaque ligne (sauf la dernière d'un bloc).
- Pour **ajouter un service** : copier un bloc dans `services: [ … ]`, changer le `slug`
  (lettres minuscules et tirets, sans accent) et l'icône (`menage`, `enfant`, `ecole`, `voiture`,
  `coeur`, `maison`, `etoile`, `horloge`). La page, le menu, le pied de page, la grille tarifaire
  et le sitemap sont mis à jour automatiquement.
- Une page service peut contenir : `groupes` (prestations regroupées par thème), `exclusions`
  (« ce que je ne fais pas »), `tarif.forfaits` (forfaits d'heures dégressifs ; le prix par heure est
  calculé automatiquement) et `note`.
- Options utiles : `contact.horairesTelephone`, `contact.conges`, `contact.fraisDeplacement`,
  `contact.rendezVous.url` (lien de prise de rendez-vous en ligne, bouton masqué si vide),
  `site.enConstruction` (bandeau) et `site.indexable` (`false` = balise noindex + robots.txt
  restrictif pendant le lancement progressif ; passer à `true` à la mise en ligne définitive).
- Horaires : `contact.horaires` (affichage), `contact.horairesStructures` (mêmes horaires pour
  Google, données structurées) et `contact.horairesIntervention` (phrase reprise dans les conditions
  générales et les modèles de contrat). Les trois doivent rester cohérents.
- `site.annonce` : bandeau d'annonce sous l'en-tête (ex. « Places disponibles en novembre »), `""`
  pour le masquer. Chaque service peut indiquer `dureeMin` (en heures), utilisée par le simulateur
  de tarif de la page Tarifs, qui compare le tarif horaire et les combinaisons de forfaits.
- Pour **retirer** un service, un témoignage, un réseau social : supprimer le bloc ou laisser `""`.
- Pour la **photo** : déposer `portrait.jpg` dans `src/assets/img/` puis indiquer
  `photo: "assets/img/portrait.jpg"`. Sans photo, un avatar avec les initiales est affiché.

À chaque génération, `build.js` affiche des **avertissements** si des valeurs semblent être encore
des exemples (téléphone `06 00 00 00 00`, e-mail `@exemple.fr`, SIRET à zéros…).

---

## 4. Comment l'injection fonctionne

`build.js` est un mini-moteur de templates (≈ 150 lignes, sans bibliothèque) :

| Syntaxe | Effet |
|---|---|
| `{{contact.telephone}}` | insère la valeur (caractères HTML échappés) |
| `{{{jsonLd}}}` | insère du HTML brut |
| `{{#each services}} … {{/each}}` | boucle (`{{this}}`, `{{@index}}`, `{{@number}}`, `{{@first}}`, `{{@last}}`) |
| `{{#if contact.whatsapp}} … {{else}} … {{/if}}` | condition (`{{#unless}}` pour l'inverse) |
| `{{> footer}}` | inclut `src/partials/footer.html` |
| `{{icon "telephone"}}` | inline `src/assets/icons/telephone.svg` |
| `{{stars note}}` | étoiles de notation |
| `{{root}}` | chemin relatif vers la racine (`""` ou `../`) – à préfixer devant tout lien interne |

Chaque page de `src/pages/` commence par un bloc *front matter* :

```
---
titre: Tarifs
description: Texte pour les moteurs de recherche
section: tarifs        ← met en surbrillance l'entrée du menu
priorite: 0.8          ← priorité dans sitemap.xml
---
```

Le build produit également : `sitemap.xml`, `robots.txt`, `favicon.svg` (monogramme aux
initiales), `manifest.webmanifest` et les données structurées *schema.org LocalBusiness*
(référencement local Google).

---

## 4 bis. Images de fond

Chaque page peut avoir une photo en fond de son bandeau de titre. Il suffit de déposer le
fichier dans **`src/assets/img/fonds/`** avec le bon nom, puis de relancer `npm run build` :

| Fichier | Page |
|---|---|
| `accueil.jpg` | Accueil |
| `services.jpg` | Liste des services |
| `menage.jpg`, `garde-enfants.jpg`, `soutien-scolaire.jpg`, `aide-seniors.jpg` | Page de chaque service (nom = `slug` du service) |
| `a-propos.jpg` | À propos |
| `tarifs.jpg` | Tarifs |
| `contact.jpg` | Contact |

- Formats acceptés : `.webp`, `.jpg`, `.jpeg`, `.png`.
- Taille conseillée : **1920 px de large, moins de 400 Ko** (sinon le site ralentit sur mobile).
- Sans fichier, la page garde son fond habituel ; le build indique les images manquantes.
- La photo reste pleinement visible : seul le texte est posé sur un panneau translucide
  (classe `.hero-panel`). Réglages dans `style.css`, section « Images de fond » : hauteur du
  bandeau (`min-height`), opacité du panneau (`rgba(...)`), flou (`backdrop-filter`). Sur l'accueil,
  l'illustration de la maison est masquée quand une photo est présente.
- Pour changer la clé d'une page : ligne `fond:` de son front matter.

**Crédits photos** (toutes sous [licence Unsplash](https://unsplash.com/license) : usage libre et
gratuit, y compris commercial ; la mention n'est pas obligatoire, elle est donnée par courtoisie) :

| Fichier | Auteur | Source |
|---|---|---|
| `accueil.jpg` | Clay Banks | <https://unsplash.com/photos/7pvC_d2iXSE> |
| `services.jpg` | Aaron Huber | <https://unsplash.com/photos/G7sE2S4Lab4> |
| `menage.jpg` | Greg Rosenke | <https://unsplash.com/photos/KMcOLSZuTe0> |
| `garde-enfants.jpg` | Roman Kravtsov | <https://unsplash.com/photos/zk3LB1psbkY> |
| `soutien-scolaire.jpg` | Susan Holt Simpson | <https://unsplash.com/photos/GQ327RPuxhI> |
| `aide-seniors.jpg` | Jaime Maldonado | <https://unsplash.com/photos/0l-73OKmRXc> |
| `a-propos.jpg` | Emilipothèse | <https://unsplash.com/photos/3k4VzLaQ53s> |
| `tarifs.jpg` | charlesdeluvio | <https://unsplash.com/photos/GlavtG-umzE> |
| `contact.jpg` | Quino Al | <https://unsplash.com/photos/8gWEAAXJjtI> |

Retouches : redimensionnement à 1920 px et compression JPEG (qualité 78) ; `tarifs.jpg` recadrée
en paysage ; `contact.jpg` retournée horizontalement pour dégager la zone de texte à gauche.

---

## 5. Formulaire de contact

Le site est 100 % statique (pas de serveur), il ne peut donc pas envoyer d'e-mail seul.
Deux modes, choisis automatiquement selon `contact.formulaire.endpoint` :

1. **Endpoint vide (par défaut)** : le bouton « Envoyer » ouvre le logiciel de messagerie du
   visiteur avec un message pré-rempli (`mailto:`). Simple, mais dépend du poste du visiteur.
2. **Service de formulaire (recommandé)** : les messages arrivent directement dans la boîte
   e-mail de la cliente.
   - [Formspree](https://formspree.io) (gratuit jusqu'à 50 messages/mois) : créer un compte,
     un formulaire, puis coller l'URL fournie : `endpoint: "https://formspree.io/f/xxxxxxxx"`.
   - [FormSubmit](https://formsubmit.co) (gratuit, sans compte) :
     `endpoint: "https://formsubmit.co/ajax/adresse@email.fr"` puis valider l'e-mail de
     confirmation reçu lors du premier envoi.
   - Hébergement Netlify : `endpoint: "/"` et ajouter l'attribut `netlify` au `<form>`.

Le formulaire comporte un champ anti-robots invisible (`_gotcha`) et une case de consentement
RGPD obligatoire.

---

## 6. Mise en ligne

Le contenu de `dist/` se dépose tel quel :

| Hébergeur | Procédure |
|---|---|
| **OVH, o2switch, Ionos, Hostinger…** (mutualisé) | Copier le contenu de `dist/` dans `www/` (ou `public_html/`) via FTP (FileZilla). Le fichier `.htaccess` fourni gère la page 404, la compression et le cache. Activer le certificat SSL (Let's Encrypt, gratuit) puis décommenter la redirection HTTPS dans `.htaccess`. |
| **Netlify / Vercel / Cloudflare Pages** (gratuit) | Glisser-déposer le dossier `dist/`, ou connecter le dépôt Git avec la commande de build `node build.js` et le dossier de publication `dist`. |
| **GitHub Pages** | Publier le contenu de `dist/` sur la branche `gh-pages`. |

Ne pas oublier de mettre `site.url` à jour avec le vrai nom de domaine **avant** la
génération finale (balises canoniques, sitemap, partage social).

Après la mise en ligne, déclarer le site sur
[Google Search Console](https://search.google.com/search-console) et y soumettre
`https://votre-domaine.fr/sitemap.xml`. Créer aussi une fiche
[Google Business Profile](https://www.google.com/business/) : c'est le levier n° 1 pour une
activité locale.

---

## 7. Charte graphique

Définie en tête de `src/assets/css/style.css` (variables CSS) :

| Rôle | Couleur |
|---|---|
| Bleu profond (titres, fonds sombres) | `#0F2A44` |
| Bleu (boutons) | `#17406B` |
| Vert d'eau (accents, icônes) | `#4FAF9F` / `#7FC8BC` |
| Crème (fond) | `#FBF8F2` |
| Or (étoiles) | `#E8B85B` |

Typographies : **DM Serif Display** (titres) et **Nunito Sans** (texte), auto-hébergées dans
`assets/fonts/` sous licence SIL Open Font License. Aucun appel à Google Fonts, aucun cookie,
aucun script tiers : le site est conforme RGPD sans bandeau de consentement.

Icônes et illustration : dessins vectoriels originaux, libres d'utilisation dans ce projet.
Pour afficher les logos officiels des réseaux sociaux, télécharger les fichiers depuis les
pages « brand resources » de chaque plateforme et remplacer l'icône `globe` dans
`src/partials/footer.html`.

---

## 7 bis. Modèles de devis et de contrat

`documents/` contient un **modèle de devis** et un **modèle de contrat de prestation** (Word et
PDF), chacun avec le formulaire de rétractation ; le contrat comporte aussi une fiche de
renseignements (contacts d'urgence, enfants, aide aux seniors, accès au logement). Ils sont générés
à partir de `config/site.config.js` (tarifs, conditions, mentions légales) : les informations
encore inconnues (médiateur, assureur, adresse) apparaissent en lignes à compléter.

```bash
npm install docx                  # une fois (module utilisé uniquement par ce script)
node scripts/documents.js         # régénère documents/*.docx
node scripts/documents.js --pdf   # + PDF (LibreOffice requis : soffice)
```

À relancer après toute modification des tarifs, des conditions ou des mentions légales.

---

## 8. Contrôle qualité

```bash
node scripts/check.js
```

Vérifie, sur le site généré : absence de marqueurs `{{ }}` oubliés, liens et ressources internes
valides, présence d'un `<title>`, d'une meta description et d'un `<h1>` unique par page,
attribut `alt` sur les images. Le code de sortie est 1 en cas d'erreur (utilisable en CI).

Pour tester l'affichage mobile : `npm run serve` puis ouvrir les outils de développement du
navigateur (F12 → icône « appareil mobile »).

---

## 9. Conformité légale (France)

Le site fournit : mentions légales (LCEN, RGPD, médiation), conditions générales de prestation
(avec modèle de formulaire de rétractation), mention de TVA près des prix, mention « EI ».
Le build (`node build.js`) affiche des avertissements `OBLIGATOIRE` tant qu'une information
légale manque dans `config/site.config.js` (section `legal`).

À faire par la prestataire (le site ne peut pas le faire à sa place) :

- [ ] **Médiateur de la consommation** : adhérer à un médiateur référencé (liste CECMC sur
      economie.gouv.fr), puis renseigner `legal.mediateur` (nom, adresse, site).
- [ ] **Assurance RC Pro** : souscrire (avec garde d'enfants couverte) puis renseigner `legal.assurance`.
- [ ] **Adresse de l'éditrice** : vérifier l'adresse publiée (`legal.adresseEditeur`, sinon rue + ville) ;
      domiciliation possible pour ne pas exposer le domicile. Elle doit correspondre à l'adresse déclarée.
- [ ] **Concordance avec l'inscription officielle** (extrait SIRENE / guichet unique) : nom, nom
      commercial, adresse, code APE ; renseigner `legal.registre` et `legal.codeAPE`.
- [ ] **Déclaration « services à la personne »** sur NOVA (nova.entreprises.gouv.fr) → `identite.numeroSAP`.
      Seulement après : passer `tarifs.creditImpot.actif` à `true`. L'aide aux actes essentiels des
      seniors (toilette, lever, habillage) exige une autorisation du Conseil départemental ; la garde
      des moins de 3 ans, un agrément.
- [ ] **Modèles de devis / contrat** reprenant les mentions des conditions générales (rétractation
      14 jours, demande d'exécution anticipée signée, TVA non applicable art. 293 B, « EI », SIRET,
      assureur, médiateur) ; à remettre avant tout paiement.
- [ ] **Preuves** des affirmations du site : 8 ans d'expérience, CAP AEPE, PSC1 à jour, extrait de
      casier vierge, permis et véhicule assuré. Retirer toute ligne qui ne serait pas exacte.
- [ ] **Hébergeur** : remplacer la valeur par défaut (OVH) par l'hébergeur réel si différent.
- [x] **HTTPS** : certificat SSL actif, redirection vers `https://www.` activée dans `.htaccess`
      (les mentions légales annoncent des échanges chiffrés).
- [ ] **Formulaire** : si un service tiers est branché (Formspree…), renseigner
      `contact.formulaire.prestataire` (nom, pays).
- [ ] **Nom commercial** : vérifier l'absence d'antériorité (base INPI, recherche web) avant de
      réserver le domaine.
- [ ] Relecture finale des conditions générales (en particulier la clause d'annulation tardive) par
      un professionnel (juriste, CMA, chambre de commerce) : le texte fourni est un modèle.

---

## 10. Check-list avant mise en ligne de la cliente

- [ ] Toutes les valeurs de `config/site.config.js` remplacées (le build n'affiche plus d'avertissement)
- [ ] Numéro SIRET et statut exacts ; numéro de déclaration *Services à la personne* si obtenu
- [ ] Encart crédit d'impôt : laisser `actif: true` **uniquement** si l'activité est déclarée
      auprès de l'État au titre des services à la personne (démarche gratuite sur la plateforme NOVA) ;
      sinon mettre `actif: false`
- [ ] Témoignages : uniquement des avis réels, avec l'accord des personnes citées
- [ ] Hébergeur renseigné dans `legal.hebergeur` (obligation légale)
- [ ] Photo personnelle ajoutée (facultatif mais recommandé : +confiance)
- [ ] `site.url` = nom de domaine définitif, en `https://`
- [ ] Formulaire testé en conditions réelles (envoi + réception)
- [ ] Image de partage `assets/img/partage.png` personnalisée (1200 × 630 px) si souhaité
