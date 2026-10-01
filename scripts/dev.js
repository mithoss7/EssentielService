#!/usr/bin/env node
/**
 * scripts/dev.js – Mode développement : régénère le site à chaque modification
 * et le sert sur http://localhost:8080 (fonctionne sous Windows, macOS, Linux).
 */

'use strict';

const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const opts = { cwd: root, stdio: 'inherit' };

const watcher = spawn(process.execPath, ['build.js', '--watch'], opts);
const server = spawn(process.execPath, ['serve.js', ...process.argv.slice(2)], opts);

const stop = () => { watcher.kill(); server.kill(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
