'use strict';
require('dotenv').config();
const axios = require('axios');

const SCHEMAS_URL = 'https://api.hubapi.com/crm-object-schemas/v3/schemas';
const OBJECT_NAME = 'study_projects';

const schema = {
  name: OBJECT_NAME,
  labels: { singular: 'Study Project', plural: 'Study Projects' },
  primaryDisplayProperty: 'name',
  secondaryDisplayProperties: ['project_status'],
  requiredProperties: ['name', 'project_category'],
  searchableProperties: ['name', 'project_category'],
  properties: [
    { name: 'name', label: 'Name', type: 'string', fieldType: 'text' },
    { name: 'project_category', label: 'Category', type: 'string', fieldType: 'text' },
    { name: 'project_status', label: 'Status', type: 'string', fieldType: 'text' },
    { name: 'project_notes', label: 'Notes', type: 'string', fieldType: 'textarea' }
  ],
  associatedObjects: ['CONTACT']
};

async function setup() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token || token === 'replace_with_your_private_app_token') {
    throw new Error('Add a real HUBSPOT_ACCESS_TOKEN to your local .env (never to GitHub).');
  }
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const httpConfig = { headers, timeout: 15000 };
  let found;
  try {
    const existing = await axios.get(SCHEMAS_URL, httpConfig);
    found = (existing.data.results || []).find(s => s.name === OBJECT_NAME);
    if (!found) {
      const created = await axios.post(SCHEMAS_URL, schema, httpConfig);
      found = created.data;
      console.log('Created new Study Projects custom-object schema.');
    } else {
      console.log('Study Projects schema already exists.');
    }
  } catch (error) {
    const status = error.response?.status;
    const category = error.response?.data?.category || '';
    throw new Error(
      `HubSpot schema setup failed${status ? ` (HTTP ${status})` : ''}${category ? `: ${category}` : ''}. ` +
      'Check your DEVELOPER TEST account, custom-object capabilities, and Service Key (or private app) scopes.'
    );
  }
  if (!found.objectTypeId) throw new Error('Schema response did not include objectTypeId.');
  const present = new Set((found.properties || []).map(p => p.name));
  const missing = schema.properties.map(p => p.name).filter(name => !present.has(name));
  if (missing.length) {
    throw new Error(`Existing schema is missing the following required properties: ${missing.join(', ')}. ` +
      'Add these properties in HubSpot or use a fresh developer test account.');
  }
  // When using an existing schema, HubSpot may return contact association by ID or object type.
  const associations = found.associatedObjects || [];
  const hasContacts = associations.some(a => ['CONTACT', '0-1', 'contacts'].includes(typeof a === 'string' ? a : (a.id || a.objectTypeId || a.name)));
  if (Array.isArray(found.associatedObjects) && !hasContacts) {
    throw new Error('Existing object schema is not associated with contacts. Add a contact association in HubSpot Data Model before submitting.');
  }
  console.log(`\nSuccess. Copy this line into .env:\nHUBSPOT_OBJECT_TYPE=${found.objectTypeId}`);
  console.log('Then run: npm run seed    (optional sample records)');
  console.log('Finally run: npm start');
}

if (require.main === module) {
  setup().catch(err => { console.error(err.message); process.exitCode = 1; });
}
module.exports = { schema, setup };
