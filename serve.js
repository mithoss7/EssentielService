#!/usr/bin/env node
/**
 * serve.js – Petit serveur local pour prévisualiser le site généré (dist/).
 *
 *   node serve.js              → http://localhost:8080
 *   node serve.js --port 3000  → autre port
 *
 * Astuce : lancer  npm run dev  pour combiner la surveillance (build --watch)
 * et ce serveur.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const portArg = process.argv.indexOf('--port');
const PORT = portArg !== -1 ? Number(process.argv[portArg + 1]) : 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const file = path.normalize(path.join(DIST, urlPath));
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end('Interdit'); }

  fs.readFile(file, (err, data) => {
    if (err) {
      const notFound = path.join(DIST, '404.html');
      if (fs.existsSync(notFound)) {
        res.writeHead(404, { 'Content-Type': TYPES['.html'] });
        return res.end(fs.readFileSync(notFound));
      }
      res.writeHead(404); return res.end('Page introuvable');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  if (!fs.existsSync(DIST)) console.log('⚠ Le dossier dist/ n\'existe pas encore : lancez  node build.js');
  console.log(`▶ Aperçu du site : http://localhost:${PORT}  (Ctrl+C pour arrêter)`);
});
