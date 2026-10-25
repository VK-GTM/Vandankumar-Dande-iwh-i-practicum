'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('custom object schema defines a Name string property and CONTACT association', () => {
  const source = read('scripts/setup-schema.js');
  assert.match(source, /primaryDisplayProperty: 'name'/);
  assert.match(source, /name: 'name', label: 'Name', type: 'string', fieldType: 'text'/);
  assert.match(source, /associatedObjects: \['CONTACT'\]/);
  assert.match(source, /name: 'project_category'/);
  assert.match(source, /name: 'project_status'/);
});

test('three exact practicum routes and Pug templates are present', () => {
  const server = read('index.js');
  assert.match(server, /app\.get\('\/'/);
  assert.match(server, /app\.get\('\/update-cobj'/);
  assert.match(server, /app\.post\('\/update-cobj'/);
  assert.match(read('views/homepage.pug'), /Add to this table/);
  assert.match(read('views/homepage.pug'), /table\.project-table/);
  assert.match(read('views/updates.pug'), /Return to the homepage/);
  assert.match(server, /Update Custom Object Form \| Integrating With HubSpot I Practicum/);
});

test('sample record creation code includes at least three records', () => {
  const source = read('scripts/seed.js');
  assert.ok((source.match(/\{ name: '/g) || []).length >= 3);
  assert.match(source, /client\.create\(project\)/);
});
