'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createApp } = require('../index');

function fakeClient() {
  const calls = { list: 0, create: [], update: [], get: [] };
  const example = {
    id: '381', properties: {
      name: 'Integration checklist', project_category: 'Web Development',
      project_status: 'In Progress', project_notes: 'Use a developer test account.'
    }
  };
  const client = {
    async list() { calls.list++; return [example]; },
    async create(data) { calls.create.push(data); return { id: '382' }; },
    async get(id) { calls.get.push(id); return example; },
    async update(id, data) { calls.update.push({ id, data }); return example; }
  };
  return { client, calls };
}

async function withServer(fn) {
  const { client, calls } = fakeClient();
  const server = createApp(client).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  try { await fn(origin, calls); } finally { await new Promise(resolve => server.close(resolve)); }
}

test('GET / renders HubSpot custom-object data', async () => withServer(async (origin, calls) => {
  const response = await fetch(origin);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Integration checklist/);
  assert.match(html, /In Progress/);
  assert.match(html, /projects\/381\/edit/);
  assert.equal(calls.list, 1);
}));

test('GET /update-cobj renders the creation form', async () => withServer(async origin => {
  const response = await fetch(`${origin}/update-cobj`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Update Custom Object Form \| Integrating With HubSpot I Practicum/);
  assert.match(html, /name="name"/);
}));

test('POST /update-cobj creates a HubSpot record and redirects', async () => withServer(async (origin, calls) => {
  const response = await fetch(`${origin}/update-cobj`, {
    method: 'POST', redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      name: 'Hello', project_category: 'CRM',
      project_status: 'Planning', project_notes: 'Demo'
    })
  });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/?saved=created');
  assert.equal(calls.create.length, 1);
  assert.equal(calls.create[0].name, 'Hello');
}));

test('POST /update-cobj rejects invalid form and does not call API', async () => withServer(async (origin, calls) => {
  const response = await fetch(`${origin}/update-cobj`, {
    method: 'POST', redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ name: '', project_category: '', project_status: 'fake' })
  });
  assert.equal(response.status, 400);
  assert.match(await response.text(), /Name is required/);
  assert.equal(calls.create.length, 0);
}));

test('GET edit loads a record, POST edit updates it', async () => withServer(async (origin, calls) => {
  const editPage = await fetch(`${origin}/projects/381/edit`);
  assert.equal(editPage.status, 200);
  assert.match(await editPage.text(), /Integration checklist/);
  const result = await fetch(`${origin}/projects/381/edit`, {
    method: 'POST', redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      name: 'Updated', project_category: 'Data', project_status: 'Completed', project_notes: ''
    })
  });
  assert.equal(result.status, 303);
  assert.equal(result.headers.get('location'), '/?saved=updated');
  assert.deepEqual(calls.get, ['381']);
  assert.equal(calls.update[0].id, '381');
  assert.equal(calls.update[0].data.project_status, 'Completed');
}));

test('rejects malformed record IDs before hitting the API', async () => withServer(async (origin, calls) => {
  const response = await fetch(`${origin}/projects/not-an-id/edit`);
  assert.equal(response.status, 400);
  assert.equal(calls.get.length, 0);
}));


test('GET /update-cobj has Academy title and home link', async () => withServer(async origin => {
  const response = await fetch(`${origin}/update-cobj`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Update Custom Object Form \| Integrating With HubSpot I Practicum/);
  assert.match(html, /Return to the homepage/);
  assert.match(html, /name="name"/);
}));

test('GET / homepage has required add link and property table', async () => withServer(async origin => {
  const html = await (await fetch(origin)).text();
  assert.match(html, /Add to this table/);
  assert.match(html, /href="\/update-cobj"/);
  assert.match(html, /<table/);
  assert.match(html, /<th[^>]*>Name<\/th>/);
}));

