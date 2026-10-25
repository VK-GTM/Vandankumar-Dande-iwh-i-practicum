'use strict';
require('dotenv').config();
const { createHubSpotClient } = require('../lib/hubspot');

async function seed() {
  const client = createHubSpotClient({
    token: process.env.HUBSPOT_ACCESS_TOKEN,
    objectType: process.env.HUBSPOT_OBJECT_TYPE
  });
  const examples = [
    { name: 'Customer portal prototype', project_category: 'Web Development', project_status: 'Planning', project_notes: 'Design a simple self-service portal with account details.' },
    { name: 'CRM data quality review', project_category: 'Data', project_status: 'In Progress', project_notes: 'Review duplicate entries and missing required fields.' },
    { name: 'API integration checklist', project_category: 'Integration', project_status: 'Completed', project_notes: 'Document authentication, basic requests, and error handling.' }
  ];
  const existing = await client.list();
  const currentNames = new Set(existing.map(item => item.properties?.name));
  for (const project of examples) {
    if (currentNames.has(project.name)) {
      console.log(`Already exists: ${project.name}`);
      continue;
    }
    await client.create(project);
    console.log(`Created: ${project.name}`);
  }
  console.log('Open http://localhost:3000 after starting the app.');
}

if (require.main === module) {
  seed().catch(err => { console.error(err.message); process.exitCode = 1; });
}
module.exports = { seed };
