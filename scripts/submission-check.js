'use strict';
// Offline pre-submission diagnostics. Does not print or transmit access tokens.
const fs = require('node:fs');
const path = require('node:path');
const { isCustomObjectType } = require('../lib/projects');

function checkSubmission({ root = path.join(__dirname, '..'), env = process.env } = {}) {
  // The checker runs even before npm install. Load only known keys from a local .env.
  const local = { ...env };
  const envPath = path.join(root, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*(HUBSPOT_ACCESS_TOKEN|HUBSPOT_OBJECT_TYPE)\s*=\s*(.*)$/);
      if (match && !local[match[1]]) local[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  const checks = [];
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'index.js'), 'utf8');
  const homepageExists = fs.existsSync(path.join(root, 'views', 'homepage.pug'));
  const hasReadRoute = /app\.get\('\/'/.test(app);
  const hasFormGet = /app\.get\('\/update-cobj'/.test(app);
  const hasCreateRoute = /app\.post\('\/update-cobj'/.test(app);
  const formExists = fs.existsSync(path.join(root, 'views', 'updates.pug'));
  const schema = fs.readFileSync(path.join(root, 'scripts', 'setup-schema.js'), 'utf8');
  const seed = fs.readFileSync(path.join(root, 'scripts', 'seed.js'), 'utf8');
  const hasNameProperty = /name: 'name', label: 'Name', type: 'string'/.test(schema);
  const contactAssociation = /associatedObjects: \[\s*'CONTACT'\s*\]/.test(schema);
  const seedCount = (seed.match(/\{ name: '/g) || []).length;
  checks.push(['All 3 exact required routes exist', hasReadRoute && hasFormGet && hasCreateRoute]);
  checks.push(['Name text property and contact association defined', hasNameProperty && contactAssociation]);
  checks.push(['Script includes at least 3 distinct sample records', seedCount >= 3]);
  checks.push(['Both required Pug templates exist', homepageExists && formExists]);
  checks.push(['Local HubSpot credential is set (never commit it)', Boolean(local.HUBSPOT_ACCESS_TOKEN?.trim())]);
  checks.push(['Real HubSpot custom-object ID is set', isCustomObjectType(local.HUBSPOT_OBJECT_TYPE)]);
  const linkLine = readme.match(/\*\*Developer test-account custom-object URL:\*\*\s*(.+)/);
  const link = linkLine?.[1]?.trim() || '';
  checks.push(['Actual developer test-account custom-object URL is recorded in README',
    /^https:\/\/app\.hubspot\.com\/contacts\/\d+\/objects\/2-\d+\/views\/all\/list\/?$/.test(link)]);
  const hasDotEnv = fs.existsSync(path.join(root, '.env'));
  if (hasDotEnv) {
    const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
    checks.push(['.env is excluded by .gitignore', /^\.env$/m.test(gitignore)]);
  }
  const success = checks.every(([, ok]) => ok);
  return { success, checks };
}

if (require.main === module) {
  const { success, checks } = checkSubmission();
  for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'NEEDS ACTION'}  ${name}`);
  if (!success) {
    console.log('\nThis code has not passed all pre-submission checks. Do not submit it as a completed practicum.');
    process.exitCode = 1;
  } else {
    console.log('\nOffline pre-submission checks passed. Still manually verify read/create/update in HubSpot.');
  }
}

module.exports = { checkSubmission };
