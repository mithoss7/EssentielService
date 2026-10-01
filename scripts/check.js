#!/usr/bin/env node
/**
 * scripts/check.js – Contrôle qualité du site généré (dist/).
 *
 *  Vérifie :
 *   - qu'aucun marqueur de template ({{ … }}) ne subsiste dans les pages ;
 *   - que tous les liens et ressources internes (href, src) existent ;
 *   - que chaque page possède un <title>, une meta description et un <h1> unique ;
 *   - que toutes les images ont un attribut alt.
 *
 *  Usage :  node scripts/check.js   (après  node build.js)
 *  Code de sortie 1 si une erreur est détectée (pratique en intégration continue).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const errors = [];
const warnings = [];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (entry.name.endsWith('.html')) out.push(abs);
  }
  return out;
}

if (!fs.existsSync(DIST)) {
  console.error('✖ dist/ introuvable : lancez d\'abord  node build.js');
  process.exit(1);
}

const pages = walk(DIST);
let linksChecked = 0;

for (const file of pages) {
  const rel = path.relative(DIST, file);
  const html = fs.readFileSync(file, 'utf8');

  if (/\{\{[\s\S]*?\}\}/.test(html)) errors.push(`${rel} : marqueur de template non remplacé`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel} : <title> manquant`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${rel} : meta description manquante`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel} : ${h1} balise(s) <h1> (1 attendue)`);

  const imgs = html.match(/<img\b[^>]*>/g) || [];
  for (const img of imgs) if (!/\balt=/.test(img)) errors.push(`${rel} : image sans attribut alt → ${img.slice(0, 60)}…`);

  const attrRe = /\b(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = attrRe.exec(html)) !== null) {
    const target = m[1];
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(target)) continue;
    const clean = target.split('#')[0].split('?')[0];
    if (!clean) continue;
    const resolved = clean.startsWith('/')
      ? path.join(DIST, clean)
      : path.resolve(path.dirname(file), clean);
    linksChecked++;
    const candidate = resolved.endsWith('/') ? path.join(resolved, 'index.html') : resolved;
    if (!fs.existsSync(candidate)) errors.push(`${rel} : lien cassé → ${target}`);
  }
}

console.log(`Pages analysées : ${pages.length} — liens/ressources vérifiés : ${linksChecked}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
if (errors.length) {
  console.log(`\n✖ ${errors.length} erreur(s) :`);
  for (const e of errors) console.log(`  • ${e}`);
  process.exit(1);
}
console.log('✔ Aucune erreur détectée.');
