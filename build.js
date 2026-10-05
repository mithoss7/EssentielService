#!/usr/bin/env node
/**
 * ============================================================================
 *  build.js – Générateur du site statique (aucune dépendance externe)
 * ============================================================================
 *
 *  Usage :
 *    node build.js            → génère le site dans dist/
 *    node build.js --watch    → régénère à chaque modification de src/ ou config/
 *
 *  Fonctionnement :
 *    1. Charge config/site.config.js et calcule quelques valeurs dérivées
 *       (initiales, liens tel:, tarifs formatés, JSON-LD…).
 *    2. Rend chaque page de src/pages/ à l'aide d'un petit moteur de
 *       templates ({{ variable }}, {{#each}}, {{#if}}, {{> partial}}, helpers).
 *    3. Génère une page par service (src/templates/service.html).
 *    4. Copie les assets, écrit sitemap.xml, robots.txt, favicon.svg.
 *
 *  Syntaxe des templates :
 *    {{ chemin.vers.valeur }}          valeur échappée (HTML sûr)
 *    {{{ chemin.vers.valeur }}}        valeur brute (HTML autorisé)
 *    {{#each liste}} … {{/each}}       boucle ({{this}}, {{@index}}, {{@number}},
 *                                      {{@first}}, {{@last}} disponibles)
 *    {{#if valeur}} … {{else}} … {{/if}}
 *    {{#unless valeur}} … {{/unless}}
 *    {{> nom-du-partial}}              inclut src/partials/nom-du-partial.html
 *    {{icon "nom"}}                    inline src/assets/icons/nom.svg
 *    {{stars note}}                    étoiles de notation (1 à 5)
 *    {{join liste ", "}}               concatène une liste
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const CONFIG_PATH = path.join(ROOT, 'config', 'site.config.js');

/* --------------------------------------------------------------------------
 *  Utilitaires
 * ------------------------------------------------------------------------ */

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function loadConfig() {
  // Supprime le cache pour que --watch prenne en compte les modifications.
  delete require.cache[require.resolve(CONFIG_PATH)];
  return require(CONFIG_PATH);
}

function slugify(text) {
  return String(text)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* --------------------------------------------------------------------------
 *  Moteur de templates
 * ------------------------------------------------------------------------ */

const TAG_RE = /\{\{\{\s*([\s\S]+?)\s*\}\}\}|\{\{\s*([\s\S]+?)\s*\}\}/g;

/** Découpe un template en un arbre de nœuds. */
function parseTemplate(template) {
  const root = { type: 'root', children: [] };
  const stack = [root];
  let last = 0;
  let match;
  TAG_RE.lastIndex = 0;

  const current = () => stack[stack.length - 1];
  const add = (node) => {
    const c = current();
    (c._inElse ? c.elseChildren : c.children).push(node);
  };

  while ((match = TAG_RE.exec(template)) !== null) {
    if (match.index > last) add({ type: 'text', value: template.slice(last, match.index) });
    last = match.index + match[0].length;

    if (match[1] !== undefined) { add({ type: 'raw', expr: match[1].trim() }); continue; }

    const expr = match[2].trim();
    if (expr.startsWith('#each ')) {
      const node = { type: 'each', expr: expr.slice(6).trim(), children: [], elseChildren: [] };
      add(node); stack.push(node);
    } else if (expr.startsWith('#if ')) {
      const node = { type: 'if', expr: expr.slice(4).trim(), children: [], elseChildren: [] };
      add(node); stack.push(node);
    } else if (expr.startsWith('#unless ')) {
      const node = { type: 'if', negate: true, expr: expr.slice(8).trim(), children: [], elseChildren: [] };
      add(node); stack.push(node);
    } else if (expr === 'else') {
      const node = current();
      if (node.type !== 'each' && node.type !== 'if') throw new Error('{{else}} inattendu');
      node._inElse = true;
    } else if (expr === '/each' || expr === '/if' || expr === '/unless') {
      const node = stack.pop();
      const expected = expr === '/each' ? 'each' : 'if';
      if (!node || node.type !== expected) throw new Error(`Bloc ${expr} mal fermé`);
      delete node._inElse;
    } else if (expr.startsWith('>')) {
      add({ type: 'partial', name: expr.slice(1).trim() });
    } else if (expr.startsWith('!')) {
      /* commentaire */
    } else {
      add({ type: 'value', expr });
    }
  }
  if (last < template.length) add({ type: 'text', value: template.slice(last) });
  if (stack.length !== 1) throw new Error(`Bloc non fermé : ${current().type} ${current().expr || ''}`);
  return root;
}

/** Résout un chemin "a.b.c" dans une pile de contextes (du plus proche au plus lointain). */
function lookup(pathExpr, scopes) {
  if (pathExpr === 'this') return scopes[scopes.length - 1].this;
  if (pathExpr.startsWith('@')) {
    for (let i = scopes.length - 1; i >= 0; i--) {
      if (scopes[i].meta && pathExpr in scopes[i].meta) return scopes[i].meta[pathExpr];
    }
    return undefined;
  }
  const parts = pathExpr.split('.');
  for (let i = scopes.length - 1; i >= 0; i--) {
    let value = scopes[i].this;
    if (value === null || typeof value !== 'object') continue;
    if (!(parts[0] in value)) continue;
    for (const part of parts) {
      if (value === null || value === undefined) return undefined;
      value = value[part];
    }
    return value;
  }
  return undefined;
}

/** Découpe "helper arg1 "arg 2" arg3" en tokens (guillemets respectés). */
function tokenize(expr) {
  const tokens = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(expr)) !== null) {
    if (m[1] !== undefined) tokens.push({ literal: m[1] });
    else if (m[2] !== undefined) tokens.push({ literal: m[2] });
    else if (/^-?\d+(\.\d+)?$/.test(m[3])) tokens.push({ literal: Number(m[3]) });
    else tokens.push({ path: m[3] });
  }
  return tokens;
}

function isTruthy(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined || value === false || value === 0 || value === '') return false;
  return true;
}

/** Chaîne HTML déjà sûre (résultat d'un helper) : ne sera pas échappée. */
class SafeString {
  constructor(html) { this.html = String(html); }
  toString() { return this.html; }
}

function createRenderer(helpers, partialsDir) {
  const partialCache = new Map();

  function getPartial(name) {
    if (!partialCache.has(name)) {
      const file = path.join(partialsDir, `${name}.html`);
      if (!fs.existsSync(file)) throw new Error(`Partial introuvable : ${name}`);
      partialCache.set(name, parseTemplate(read(file)));
    }
    return partialCache.get(name);
  }

  function evaluate(expr, scopes) {
    const tokens = tokenize(expr);
    if (tokens.length === 0) return '';
    const first = tokens[0];
    if (tokens.length > 1 && first.path && helpers[first.path]) {
      const args = tokens.slice(1).map((t) => (t.literal !== undefined ? t.literal : lookup(t.path, scopes)));
      return helpers[first.path](...args);
    }
    if (first.literal !== undefined) return first.literal;
    return lookup(first.path, scopes);
  }

  function renderNodes(nodes, scopes) {
    let out = '';
    for (const node of nodes) {
      switch (node.type) {
        case 'text':
          out += node.value;
          break;
        case 'value': {
          const v = evaluate(node.expr, scopes);
          if (v instanceof SafeString) out += v.html;
          else if (v !== undefined && v !== null) out += escapeHtml(v);
          break;
        }
        case 'raw': {
          const v = evaluate(node.expr, scopes);
          if (v !== undefined && v !== null) out += String(v);
          break;
        }
        case 'if': {
          let cond = isTruthy(evaluate(node.expr, scopes));
          if (node.negate) cond = !cond;
          out += renderNodes(cond ? node.children : node.elseChildren, scopes);
          break;
        }
        case 'each': {
          const list = evaluate(node.expr, scopes);
          if (Array.isArray(list) && list.length > 0) {
            list.forEach((item, index) => {
              const meta = { '@index': index, '@number': index + 1, '@first': index === 0, '@last': index === list.length - 1 };
              out += renderNodes(node.children, scopes.concat([{ this: item, meta }]));
            });
          } else {
            out += renderNodes(node.elseChildren, scopes);
          }
          break;
        }
        case 'partial':
          out += renderNodes(getPartial(node.name).children, scopes);
          break;
      }
    }
    return out;
  }

  return {
    render(template, context) {
      return renderNodes(parseTemplate(template).children, [{ this: context }]);
    },
    clearCache() { partialCache.clear(); }
  };
}

/* --------------------------------------------------------------------------
 *  Helpers disponibles dans les templates
 * ------------------------------------------------------------------------ */

function createHelpers() {
  const iconCache = new Map();
  return {
    /** {{icon "menage"}}  ou  {{icon service.icone "classe-css"}} */
    icon(name, cssClass) {
      const key = String(name || 'etoile');
      if (!iconCache.has(key)) {
        const file = path.join(SRC, 'assets', 'icons', `${key}.svg`);
        if (!fs.existsSync(file)) throw new Error(`Icône introuvable : ${key} (src/assets/icons/${key}.svg)`);
        iconCache.set(key, read(file).trim());
      }
      const svg = iconCache.get(key);
      return new SafeString(svg.replace('<svg', `<svg class="${escapeHtml(cssClass || 'icon')}"`));
    },
    /** {{stars 4}} → 5 étoiles dont 4 pleines */
    stars(note) {
      const n = Math.max(0, Math.min(5, Math.round(Number(note) || 0)));
      let html = `<span class="stars" role="img" aria-label="Note : ${n} sur 5">`;
      for (let i = 0; i < 5; i++) {
        html += `<svg class="star${i < n ? ' star--on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.7l-5.9 3.1 1.2-6.5L2.5 9.7l6.6-.9z"/></svg>`;
      }
      return new SafeString(html + '</span>');
    },
    /** {{join contact.zone.villes ", "}} */
    join(list, separator) {
      return Array.isArray(list) ? list.join(separator === undefined ? ', ' : separator) : '';
    },
    /** {{concat a b c}} */
    concat(...parts) {
      return parts.filter((p) => p !== undefined && p !== null).join('');
    }
  };
}

/* --------------------------------------------------------------------------
 *  Enrichissement de la configuration (valeurs dérivées)
 * ------------------------------------------------------------------------ */

function enrichConfig(raw) {
  const cfg = JSON.parse(JSON.stringify(raw)); // copie profonde
  const now = new Date();

  const prenom = cfg.identite.prenom || '';
  const nom = cfg.identite.nom || '';
  cfg.identite.nomComplet = `${prenom} ${nom}`.trim();
  cfg.identite.initiales = cfg.identite.initiales || [prenom, nom].filter(Boolean).map((s) => s.trim()[0].toUpperCase()).join('');
  if (!cfg.identite.nomCommercial) cfg.identite.nomCommercial = cfg.identite.nomComplet;

  // Téléphone
  const intl = (cfg.contact.telephoneInternational || '').replace(/[^\d+]/g, '');
  cfg.contact.telephoneLien = `tel:${intl || cfg.contact.telephone.replace(/\s/g, '')}`;
  cfg.contact.whatsappLien = `https://wa.me/${intl.replace(/^\+/, '')}`;
  cfg.contact.emailLien = `mailto:${cfg.contact.email}`;

  // Adresse
  const a = cfg.contact.adresse;
  a.villeComplete = `${a.codePostal} ${a.ville}`.trim();
  a.affichee = a.afficherRue ? `${a.rue}, ${a.villeComplete}` : a.villeComplete;

  // Zone
  cfg.contact.zone.villesTexte = (cfg.contact.zone.villes || []).join(', ');

  // Réseaux : liste exploitable dans une boucle
  const r = cfg.contact.reseaux || {};
  cfg.contact.reseauxListe = ['facebook', 'instagram', 'linkedin']
    .filter((k) => r[k])
    .map((k) => ({ nom: k, label: k.charAt(0).toUpperCase() + k.slice(1), url: r[k] }));

  // Site
  cfg.site.url = (cfg.site.url || '').replace(/\/+$/, '');
  try { cfg.site.domaine = new URL(cfg.site.url).host; } catch (e) { cfg.site.domaine = cfg.site.url; }

  // Services
  cfg.services = (cfg.services || []).map((s) => {
    const service = { ...s };
    service.slug = service.slug || slugify(service.titre);
    service.url = `services/${service.slug}.html`;
    if (service.tarif && service.tarif.montant !== undefined) {
      const montant = String(service.tarif.montant).replace('.', ',');
      service.tarif.montantAffiche = `${montant} €`;
      service.tarif.affiche = `${montant} €/${service.tarif.unite || 'h'}`;
      // Forfaits d'heures dégressifs : prix affichés et prix par heure calculé
      const fmt = (n) => String(Math.round(n * 100) / 100).replace('.', ',');
      service.tarif.forfaits = (service.tarif.forfaits || []).map((fo) => ({
        ...fo,
        prixAffiche: `${fmt(fo.prix)} €`,
        parHeure: `${fmt(fo.prix / fo.heures)} €/${service.tarif.unite || 'h'}`
      }));
    }
    return service;
  });
  cfg.services.forEach((s) => {
    s.autres = cfg.services.filter((o) => o.slug !== s.slug).map((o) => ({
      slug: o.slug, url: o.url, titre: o.titre, titreCourt: o.titreCourt, accroche: o.accroche, icone: o.icone
    }));
  });

  // Témoignages : initiales pour l'avatar
  cfg.temoignages = (cfg.temoignages || []).map((t) => ({
    ...t,
    initiales: String(t.auteur || '?').split(/\s+/).map((w) => w[0]).join('').replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 2).toUpperCase()
  }));

  // Mentions légales : valeurs dérivées
  cfg.identite.nomEI = `${cfg.identite.nomComplet} EI`;
  // Adresse de l'éditrice : legal.adresseEditeur (domiciliation par exemple), sinon
  // l'adresse de contact telle qu'elle est autorisée à s'afficher (afficherRue).
  cfg.legal.adresseEditeurAffichee = cfg.legal.adresseEditeur || a.affichee;
  cfg.legal.tvaMention = cfg.legal.tva
    ? `TVA intracommunautaire : ${cfg.legal.tva}`
    : 'TVA non applicable, article 293 B du Code général des impôts';

  // Dates
  cfg.anneeCourante = now.getFullYear();
  const debut = Number(cfg.legal.anneeCreation) || cfg.anneeCourante;
  cfg.copyright = debut < cfg.anneeCourante ? `${debut} – ${cfg.anneeCourante}` : `${cfg.anneeCourante}`;
  cfg.dateMiseAJour = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  cfg.dateISO = now.toISOString().slice(0, 10);

  // Données structurées (SEO) – schema.org LocalBusiness
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: cfg.identite.nomCommercial,
    description: cfg.site.description,
    url: cfg.site.url,
    telephone: cfg.contact.telephoneInternational,
    email: cfg.contact.email,
    image: `${cfg.site.url}/favicon.svg`,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      ...(a.afficherRue ? { streetAddress: a.rue } : {}),
      postalCode: a.codePostal,
      addressLocality: a.ville,
      addressCountry: 'FR'
    },
    areaServed: (cfg.contact.zone.villes || []).map((v) => ({ '@type': 'City', name: v })),
    makesOffer: cfg.services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.titre, description: s.accroche, url: `${cfg.site.url}/${s.url}` }
    })),
    sameAs: cfg.contact.reseauxListe.map((x) => x.url),
    openingHoursSpecification: (cfg.contact.horairesStructures || []).map((h) => ({
      '@type': 'OpeningHoursSpecification', dayOfWeek: h.jours, opens: h.ouverture, closes: h.fermeture
    }))
  };
  cfg.jsonLd = JSON.stringify(jsonLd, null, 0).replace(/</g, '\\u003c');

  // Données du simulateur de tarif (page Tarifs)
  cfg.simulateurJson = JSON.stringify(cfg.services.filter((s) => s.tarif && s.tarif.montant).map((s) => ({
    slug: s.slug, titre: s.titre, taux: s.tarif.montant, dureeMin: s.dureeMin || 1,
    forfaits: (s.tarif.forfaits || []).map((fo) => ({ heures: fo.heures, prix: fo.prix }))
  }))).replace(/</g, '\\u003c');

  return cfg;
}

/* --------------------------------------------------------------------------
 *  Vérifications de la configuration (avertissements, pas de blocage)
 * ------------------------------------------------------------------------ */

function checkConfig(cfg) {
  const warnings = [];
  const looksLikePlaceholder = (v) => /exemple|00 00 00 00|000 000 000|xxxx/i.test(String(v || ''));
  if (looksLikePlaceholder(cfg.contact.email)) warnings.push('contact.email semble être un exemple.');
  if (looksLikePlaceholder(cfg.contact.telephone)) warnings.push('contact.telephone semble être un exemple.');
  if (looksLikePlaceholder(cfg.identite.siret)) warnings.push('identite.siret semble être un exemple.');
  if (looksLikePlaceholder(cfg.contact.adresse.rue)) warnings.push('contact.adresse.rue semble être un exemple.');
  if (!/^https?:\/\//.test(cfg.site.url)) warnings.push('site.url doit commencer par https:// (ex. https://www.mon-domaine.fr).');
  if (cfg.site.description && cfg.site.description.length > 165) warnings.push(`site.description est longue (${cfg.site.description.length} caractères, 160 conseillés).`);
  if (!cfg.contact.formulaire.endpoint) warnings.push('contact.formulaire.endpoint est vide : le formulaire ouvrira la messagerie du visiteur (mailto). Voir README.');
  const l = cfg.legal || {};
  if (!(l.mediateur && l.mediateur.nom && l.mediateur.site)) warnings.push('OBLIGATOIRE – legal.mediateur : médiateur de la consommation à désigner et à afficher (art. L.616-1 du Code de la consommation).');
  if (!(l.assurance && l.assurance.nom)) warnings.push('legal.assurance : assureur RC Pro non renseigné (information due au client, art. R.111-2 du Code de la consommation) ; la mention d\'assurance reste masquée sur le site tant qu\'il est vide.');
  if (!cfg.legal.adresseEditeur) warnings.push('OBLIGATOIRE – legal.adresseEditeur vide : les mentions légales n\'indiquent que la ville. Renseigner l\'adresse déclarée (domiciliation si le domicile doit rester privé).');
  if (cfg.site.indexable !== true) warnings.push('site.indexable n\'est pas à true : le site porte une balise noindex et robots.txt interdit l\'exploration (lancement progressif). À activer à la mise en ligne définitive.');
  if (cfg.site.enConstruction) warnings.push('site.enConstruction est à true : le bandeau « site en construction » est affiché.');
  if (!(l.hebergeur && l.hebergeur.confirme) && /ovh/i.test((l.hebergeur && l.hebergeur.nom) || '')) warnings.push('legal.hebergeur : valeur par défaut (OVH). À remplacer par l\'hébergeur réel si différent.');
  if (!cfg.identite.numeroSAP) warnings.push('identite.numeroSAP vide : activité non déclarée « services à la personne » (le crédit d\'impôt doit rester désactivé).');
  if (!l.registre) warnings.push('legal.registre vide : reporter la mention d\'immatriculation figurant sur l\'extrait officiel (RCS, répertoire des métiers…) ou la laisser vide si aucune.');
  if (/^https?:/.test(cfg.contact.formulaire.endpoint || '') && !(cfg.contact.formulaire.prestataire && cfg.contact.formulaire.prestataire.nom)) warnings.push('contact.formulaire.prestataire : nommer le service tiers du formulaire (RGPD).');
  if (!cfg.services.length) warnings.push('Aucun service défini.');
  return warnings;
}

/* --------------------------------------------------------------------------
 *  Front matter des pages (bloc --- clé: valeur --- en tête de fichier)
 * ------------------------------------------------------------------------ */

function parseFrontMatter(source) {
  const m = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { meta: {}, body: source };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else value = value.replace(/^["']|["']$/g, '');
    meta[key] = value;
  }
  return { meta, body: source.slice(m[0].length) };
}

/* --------------------------------------------------------------------------
 *  Construction
 * ------------------------------------------------------------------------ */

function build() {
  const started = Date.now();
  const rawConfig = loadConfig();
  const cfg = enrichConfig(rawConfig);
  const helpers = createHelpers();
  const renderer = createRenderer(helpers, path.join(SRC, 'partials'));
  const layout = read(path.join(SRC, 'layouts', 'base.html'));

  // Nettoyage du dossier de sortie
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // Assets et fichiers statiques
  copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'));
  fs.rmSync(path.join(DIST, 'assets', 'icons'), { recursive: true, force: true }); // icônes inlinées, inutile de les copier
  copyDir(path.join(SRC, 'static'), DIST);

  // Scripts PHP : remplace les valeurs %%chemin.de.config%% (chaînes PHP entre apostrophes)
  for (const f of fs.readdirSync(DIST).filter((n) => n.endsWith('.php'))) {
    const fichier = path.join(DIST, f);
    const php = read(fichier).replace(/%%([\w.]+)%%/g, (m, cle) => {
      const v = cle.split('.').reduce((o, k) => (o == null ? undefined : o[k]), cfg);
      if (v == null) throw new Error(`${f} : valeur inconnue ${m}`);
      return String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    });
    fs.writeFileSync(fichier, php);
  }

  const pages = []; // { outputPath, url, priority, changefreq }

  // Images de fond : src/assets/img/fonds/<clé>.(webp|jpg|jpeg|png)
  // La clé vient du front matter (fond: tarifs) ou du slug du service.
  const FONDS = path.join(SRC, 'assets', 'img', 'fonds');
  const fondsAttendus = new Map(); // clé -> fichier trouvé ('' si absent)
  function trouverFond(cle) {
    if (!fondsAttendus.has(cle)) {
      const ext = ['webp', 'jpg', 'jpeg', 'png'].find((e) => fs.existsSync(path.join(FONDS, `${cle}.${e}`)));
      fondsAttendus.set(cle, ext ? `${cle}.${ext}` : '');
    }
    return fondsAttendus.get(cle);
  }

  /** Rend une page complète (contenu + layout) et l'écrit dans dist/. */
  function renderPage({ body, meta, outputRel, extra = {} }) {
    const depth = outputRel.split('/').length - 1;
    // Chemin relatif vers la racine du site ("" ou "../"), surchargeable dans le
    // front matter (root: /) pour les pages servies à n'importe quelle adresse (404).
    const root = meta.root !== undefined ? String(meta.root) : (depth === 0 ? '' : '../'.repeat(depth));
    const urlPath = outputRel === 'index.html' ? '' : outputRel.replace(/\/index\.html$/, '/');
    const cleFond = meta.fond || (extra.service ? extra.service.slug : '');
    const fichierFond = cleFond ? trouverFond(cleFond) : '';
    const page = {
      ...meta,
      root,
      chemin: outputRel,
      url: `${cfg.site.url}/${urlPath}`,
      titreComplet: meta.titre ? `${meta.titre} – ${cfg.identite.nomCommercial}` : cfg.site.titre,
      description: meta.description || cfg.site.description,
      isHome: outputRel === 'index.html',
      section: meta.section || '',
      fond: fichierFond ? `${root}assets/img/fonds/${fichierFond}` : ''
    };
    const nav = [
      { label: 'Accueil', href: `${root}index.html`, section: 'accueil' },
      { label: 'Services', href: `${root}services/index.html`, section: 'services', sousMenu: cfg.services.map((s) => ({ label: s.titre, href: `${root}${s.url}` })) },
      { label: 'À propos', href: `${root}a-propos.html`, section: 'a-propos' },
      { label: 'Tarifs', href: `${root}tarifs.html`, section: 'tarifs' },
      { label: 'Contact', href: `${root}contact.html`, section: 'contact' }
    ].map((item) => ({ ...item, actif: item.section === page.section }));

    const context = { ...cfg, page, nav, root, ...extra };
    const content = renderer.render(body, context);
    const html = renderer.render(layout, { ...context, content });
    write(path.join(DIST, outputRel), html);
    if (meta.sitemap !== false) {
      pages.push({ url: page.url, priority: meta.priorite || '0.7', changefreq: meta.frequence || 'monthly' });
    }
  }

  // Pages classiques : src/pages/**/*.html (les fichiers commençant par _ sont ignorés)
  function walkPages(dir, rel = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('_')) continue;
      const abs = path.join(dir, entry.name);
      const r = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walkPages(abs, r);
      else if (entry.name.endsWith('.html')) {
        const { meta, body } = parseFrontMatter(read(abs));
        renderPage({ body, meta, outputRel: r });
      }
    }
  }
  walkPages(path.join(SRC, 'pages'));

  // Pages de services générées depuis la configuration
  const serviceTemplate = parseFrontMatter(read(path.join(SRC, 'templates', 'service.html')));
  for (const service of cfg.services) {
    renderPage({
      body: serviceTemplate.body,
      meta: {
        ...serviceTemplate.meta,
        titre: service.titre,
        description: `${service.accroche} ${cfg.identite.nomCommercial}, ${cfg.contact.adresse.ville} et alentours.`,
        section: 'services'
      },
      outputRel: service.url,
      extra: { service }
    });
  }

  // sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map((p) => `  <url>\n    <loc>${escapeHtml(p.url)}</loc>\n    <lastmod>${cfg.dateISO}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`;
  write(path.join(DIST, 'sitemap.xml'), sitemap);

  // robots.txt
  write(path.join(DIST, 'robots.txt'), cfg.site.indexable === true
    ? `User-agent: *\nAllow: /\n\nSitemap: ${cfg.site.url}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`);

  // favicon.svg (monogramme aux couleurs de la charte)
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17406B"/><stop offset="1" stop-color="#0F2A44"/></linearGradient></defs>
  <rect width="64" height="64" rx="16" fill="url(#g)"/>
  <circle cx="50" cy="14" r="7" fill="#7FC8BC"/>
  <text x="32" y="43" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="#FBF8F2">${escapeHtml(cfg.identite.initiales)}</text>
</svg>\n`;
  write(path.join(DIST, 'favicon.svg'), favicon);

  // manifest.webmanifest
  write(path.join(DIST, 'manifest.webmanifest'), JSON.stringify({
    name: cfg.identite.nomCommercial,
    short_name: cfg.identite.nomCommercial,
    description: cfg.site.description,
    start_url: '/',
    display: 'browser',
    background_color: '#FBF8F2',
    theme_color: '#0F2A44',
    icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
  }, null, 2));

  // Rapport
  const ms = Date.now() - started;
  console.log(`✔ Site généré dans dist/ (${pages.length} pages, ${ms} ms)`);
  const fondsManquants = [...fondsAttendus].filter(([, f]) => !f).map(([cle]) => `${cle}.jpg`);
  console.log(`  Images de fond : ${fondsAttendus.size - fondsManquants.length}/${fondsAttendus.size}` +
    (fondsManquants.length ? ` (absentes dans src/assets/img/fonds/ : ${fondsManquants.join(', ')})` : ''));
  const warnings = checkConfig(cfg);
  if (warnings.length) {
    console.log('\nAvertissements de configuration :');
    for (const w of warnings) console.log(`  • ${w}`);
  }
  return cfg;
}

/* --------------------------------------------------------------------------
 *  Point d'entrée
 * ------------------------------------------------------------------------ */

if (require.main === module) {
  const watch = process.argv.includes('--watch');
  try {
    build();
  } catch (err) {
    console.error('✖ Erreur de génération :', err.message);
    if (!watch) process.exit(1);
  }
  if (watch) {
    console.log('Surveillance de src/ et config/… (Ctrl+C pour arrêter)');
    let timer = null;
    const rebuild = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try { build(); } catch (err) { console.error('✖ Erreur de génération :', err.message); }
      }, 150);
    };
    for (const dir of [SRC, path.join(ROOT, 'config')]) {
      try {
        fs.watch(dir, { recursive: true }, rebuild);
      } catch (err) {
        // Anciennes versions de Node sous Linux : surveillance non récursive
        const walk = (d) => {
          fs.watch(d, rebuild);
          for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) walk(path.join(d, e.name));
        };
        walk(dir);
      }
    }
  }
}

module.exports = { build, enrichConfig, parseTemplate, createRenderer, createHelpers, SafeString };
