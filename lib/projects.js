'use strict';

// Internal property names must match the schema installed by scripts/setup-schema.js.
const PROPERTY_NAMES = Object.freeze([
  'name', 'project_category', 'project_status', 'project_notes'
]);

const STATUS_OPTIONS = Object.freeze(['Planning', 'In Progress', 'Completed']);

function validateProject(values) {
  const data = {
    name: clean(values.name, 120),
    project_category: clean(values.project_category, 80),
    project_status: clean(values.project_status, 40),
    project_notes: clean(values.project_notes, 1000)
  };
  const errors = [];
  if (!data.name) errors.push('Name is required.');
  if (data.name.length > 120) errors.push('Name is too long.');
  if (!data.project_category) errors.push('Category is required.');
  if (data.project_category.length > 80) errors.push('Category is too long.');
  if (data.project_notes.length > 1000) errors.push('Notes are too long.');
  if (!STATUS_OPTIONS.includes(data.project_status)) errors.push('Choose a valid status.');
  return { data, errors };
}

function clean(value, maxLength) {
  if (typeof value !== 'string') return '';
  // Trim whitespace while preserving line breaks for the notes field.
  return value.trim().slice(0, maxLength + 1);
}

function toViewModel(record) {
  const p = record?.properties || {};
  return {
    id: String(record?.id || ''),
    name: p.name || '',
    project_category: p.project_category || '',
    project_status: p.project_status || '',
    project_notes: p.project_notes || '',
    created_at: record?.createdAt || ''
  };
}

// HubSpot object-type IDs are of the form 2-12345; this rejects URL/path injection.
function isCustomObjectType(value) {
  return typeof value === 'string' && /^2-\d+$/.test(value);
}

function isRecordId(value) {
  return typeof value === 'string' && /^\d+$/.test(value);
}

module.exports = {
  PROPERTY_NAMES, STATUS_OPTIONS, validateProject,
  toViewModel, isCustomObjectType, isRecordId
};
