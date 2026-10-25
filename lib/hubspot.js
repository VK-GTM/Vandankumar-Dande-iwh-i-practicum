'use strict';
const axios = require('axios');
const { PROPERTY_NAMES, isCustomObjectType, isRecordId } = require('./projects');

const API_BASE = 'https://api.hubapi.com/crm/v3/objects';

class HubSpotError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'HubSpotError';
    this.status = status || 502;
  }
}

function friendlyError(error) {
  const status = error.response?.status;
  if (status === 401) return new HubSpotError('Your HubSpot credential is invalid. Check HUBSPOT_ACCESS_TOKEN.', 401);
  if (status === 403) return new HubSpotError('HubSpot denied the request. Check custom-object scopes on your Service Key (or existing private app) and test-account permissions.', 403);
  if (status === 404) return new HubSpotError('The custom object or record was not found. Check HUBSPOT_OBJECT_TYPE.', 404);
  if (status === 429) return new HubSpotError('HubSpot rate limit reached. Please retry shortly.', 429);
  if (status === 400) return new HubSpotError('HubSpot rejected the record. Check the custom-object property names and values.', 400);
  // Do not copy request configs or secrets from Axios into displayed errors.
  return new HubSpotError('Unable to contact HubSpot. Check the test account and try again.', 502);
}

function createHubSpotClient({ token, objectType }, http = axios) {
  if (!token || token === 'replace_with_your_private_app_token') {
    throw new Error('Configure HUBSPOT_ACCESS_TOKEN in .env.');
  }
  if (!isCustomObjectType(objectType)) {
    throw new Error('Configure HUBSPOT_OBJECT_TYPE using the objectTypeId from setup:schema (e.g. 2-12345678).');
  }
  const endpoint = `${API_BASE}/${objectType}`;
  const config = {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    timeout: 15000
  };

  async function wrap(call) {
    try { return await call(); } catch (e) { throw friendlyError(e); }
  }

  return {
    async list() {
      return wrap(async () => {
        // Pagination avoids silently hiding projects after the first 100.
        let after;
        let records = [];
        do {
          const response = await http.get(endpoint, {
            ...config,
            params: { limit: 100, properties: PROPERTY_NAMES.join(','), ...(after ? { after } : {}) }
          });
          records = records.concat(response.data.results || []);
          after = response.data.paging?.next?.after;
          if (records.length >= 1000) break; // local safeguard for demo usage
        } while (after);
        return records.slice(0, 1000);
      });
    },
    async get(id) {
      if (!isRecordId(id)) throw new HubSpotError('Invalid record ID.', 400);
      return wrap(async () => {
        const response = await http.get(`${endpoint}/${id}`, {
          ...config, params: { properties: PROPERTY_NAMES.join(',') }
        });
        return response.data;
      });
    },
    async create(properties) {
      return wrap(async () => {
        const response = await http.post(endpoint, { properties }, config);
        return response.data;
      });
    },
    async update(id, properties) {
      if (!isRecordId(id)) throw new HubSpotError('Invalid record ID.', 400);
      return wrap(async () => {
        const response = await http.patch(`${endpoint}/${id}`, { properties }, config);
        return response.data;
      });
    }
  };
}

module.exports = { createHubSpotClient, HubSpotError, friendlyError };
