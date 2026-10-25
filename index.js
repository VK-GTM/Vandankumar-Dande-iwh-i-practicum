'use strict';
require('dotenv').config();
const path = require('node:path');
const express = require('express');
const { createHubSpotClient } = require('./lib/hubspot');
const { STATUS_OPTIONS, validateProject, toViewModel, isRecordId } = require('./lib/projects');

function createApp(client) {
  const app = express();
  app.set('view engine', 'pug');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));

  const renderForm = (res, { title, action, project, errors = [], isEdit = false, statusCode = 200 }) => {
    res.status(statusCode).render('updates', { title, action, project, errors, isEdit, statuses: STATUS_OPTIONS });
  };

  // ROUTE 1: GET custom-object records from HubSpot and render a new homepage Pug template.
  app.get('/', async (req, res, next) => {
    try {
      const results = await client.list();
      const projects = results.map(toViewModel);
      res.render('homepage', {
        title: 'Study Projects | HubSpot CRM',
        projects,
        notice: req.query.saved === 'created' ? 'Project created in HubSpot.' :
          req.query.saved === 'updated' ? 'Project updated in HubSpot.' : ''
      });
    } catch (e) { next(e); }
  });

  // ROUTE 2: GET /update-cobj renders the updates.pug form to add a CRM custom-object record.
  app.get('/update-cobj', (req, res) => {
    renderForm(res, { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum', action: '/update-cobj', project: { project_status: 'Planning' } });
  });

  // ROUTE 3: POST /update-cobj creates a CRM custom-object record via HubSpot API, then redirects home.
  app.post('/update-cobj', async (req, res, next) => {
    const { data, errors } = validateProject(req.body);
    if (errors.length) return renderForm(res, {
      title: 'Update Custom Object Form | Integrating With HubSpot I Practicum', action: '/update-cobj', project: data, errors, statusCode: 400
    });
    try {
      await client.create(data);
      return res.redirect(303, '/?saved=created');
    } catch (e) { next(e); }
  });

  // Additional routes: edit and PATCH an existing custom-object record.
  app.get('/projects/:id/edit', async (req, res, next) => {
    if (!isRecordId(req.params.id)) return res.status(400).render('error', { title: 'Invalid ID', message: 'Invalid record ID.' });
    try {
      const record = await client.get(req.params.id);
      renderForm(res, {
        title: 'Edit Study Project', action: `/projects/${req.params.id}/edit`,
        project: toViewModel(record), isEdit: true
      });
    } catch (e) { next(e); }
  });

  app.post('/projects/:id/edit', async (req, res, next) => {
    if (!isRecordId(req.params.id)) return res.status(400).render('error', { title: 'Invalid ID', message: 'Invalid record ID.' });
    const { data, errors } = validateProject(req.body);
    if (errors.length) return renderForm(res, {
      title: 'Edit Study Project', action: `/projects/${req.params.id}/edit`,
      project: { id: req.params.id, ...data }, errors, isEdit: true, statusCode: 400
    });
    try {
      await client.update(req.params.id, data);
      return res.redirect(303, '/?saved=updated');
    } catch (e) { next(e); }
  });

  app.use((req, res) => res.status(404).render('error', { title: 'Page not found', message: 'That page does not exist.' }));
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    // Never show tokens, raw request headers, or Axios response configs to a user.
    const status = [400, 401, 403, 404, 429].includes(err.status) ? err.status : 502;
    console.error(`Request failed (${status}): ${err.message}`);
    res.status(status).render('error', { title: 'HubSpot integration error', message: err.message });
  });
  return app;
}

if (require.main === module) {
  try {
    const client = createHubSpotClient({
      token: process.env.HUBSPOT_ACCESS_TOKEN,
      objectType: process.env.HUBSPOT_OBJECT_TYPE
    });
    const port = Number(process.env.PORT) || 3000;
    createApp(client).listen(port, () => console.log(`Study Projects app: http://localhost:${port}`));
  } catch (error) {
    console.error(`Setup required: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { createApp };
