'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  PROPERTY_NAMES, STATUS_OPTIONS, validateProject,
  toViewModel, isCustomObjectType, isRecordId
} = require('../lib/projects');

const valid = () => ({
  name: '  CRM test  ', project_category: ' API  ',
  project_status: 'Planning', project_notes: ' Hello  '
});

test('property names match the custom-object schema fields', () => {
  assert.deepEqual([...PROPERTY_NAMES], [
    'name', 'project_category', 'project_status', 'project_notes'
  ]);
});

test('validates, trims and normalizes submitted project fields', () => {
  const { data, errors } = validateProject(valid());
  assert.deepEqual(errors, []);
  assert.deepEqual(data, {
    name: 'CRM test', project_category: 'API',
    project_status: 'Planning', project_notes: 'Hello'
  });
});

test('rejects blank project names and categories', () => {
  const { errors } = validateProject({ ...valid(), name: '  ', project_category: '' });
  assert.equal(errors.length, 2);
});

test('rejects tampered statuses', () => {
  const { errors } = validateProject({ ...valid(), project_status: 'Not-A-Status' });
  assert.match(errors.join(' '), /valid status/);
  assert.deepEqual([...STATUS_OPTIONS], ['Planning', 'In Progress', 'Completed']);
});

test('rejects overly long names and non-string values', () => {
  assert.match(validateProject({ ...valid(), name: 'a'.repeat(130) }).errors.join(' '), /too long/);
  assert.match(validateProject({ ...valid(), name: ['array'] }).errors.join(' '), /required/);
  assert.match(validateProject({ ...valid(), project_category: 'b'.repeat(100) }).errors.join(' '), /too long/);
  assert.match(validateProject({ ...valid(), project_notes: 'n'.repeat(1100) }).errors.join(' '), /too long/);
});

test('converts the HubSpot record into view data', () => {
  const model = toViewModel({ id: '923', properties: { name: 'Demo', project_status: 'Completed' } });
  assert.equal(model.id, '923');
  assert.equal(model.name, 'Demo');
  assert.equal(model.project_category, '');
});

test('rejects invalid custom object IDs and record IDs', () => {
  assert.equal(isCustomObjectType('2-123456'), true);
  assert.equal(isCustomObjectType('contacts'), false);
  assert.equal(isCustomObjectType('2-123/evil'), false);
  assert.equal(isRecordId('12345'), true);
  assert.equal(isRecordId('../12345'), false);
});
