# Site vitrine – Services à domicile

Site internet complet, statique et sans dépendance, pour une prestataire indépendante
(ménage, garde d'enfants, soutien scolaire, accompagnement & déplacements).

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
│   ├── pages/               ← une page = un fichier (index, à propos, tarifs, contact, mentions légales, 404)
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
| `menage.jpg`, `aide-seniors.jpg`, `garde-enfants.jpg` | Page de chaque service (nom = `slug` du service) |
| `a-propos.jpg` | À propos |
| `tarifs.jpg` | Tarifs |
| `contact.jpg` | Contact |

- Formats acceptés : `.webp`, `.jpg`, `.jpeg`, `.png`.
- Taille conseillée : **1920 px de large, moins de 400 Ko** (sinon le site ralentit sur mobile).
- Sans fichier, la page garde son fond habituel ; le build indique les images manquantes.
- Un voile coloré est appliqué automatiquement pour que le texte reste lisible (réglable dans
  `style.css`, section « Images de fond »).
- Pour changer la clé d'une page : ligne `fond:` de son front matter.

**Crédits photos** (toutes sous [licence Unsplash](https://unsplash.com/license) : usage libre et
gratuit, y compris commercial ; la mention n'est pas obligatoire, elle est donnée par courtoisie) :

| Fichier | Auteur | Source |
|---|---|---|
| `accueil.jpg` | Clay Banks | <https://unsplash.com/photos/7pvC_d2iXSE> |
| `services.jpg` | Aaron Huber | <https://unsplash.com/photos/G7sE2S4Lab4> |
| `menage.jpg` | Greg Rosenke | <https://unsplash.com/photos/KMcOLSZuTe0> |
| `aide-seniors.jpg` | Jaime Maldonado | <https://unsplash.com/photos/0l-73OKmRXc> |
| `garde-enfants.jpg` | Susan Holt Simpson | <https://unsplash.com/photos/GQ327RPuxhI> |
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

## 9. Check-list avant mise en ligne de la cliente

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
