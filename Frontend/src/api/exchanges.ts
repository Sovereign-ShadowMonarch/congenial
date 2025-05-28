import api from './client';
import { z } from 'zod';

// Response schemas
const ExchangeSchema = z.object({
  name: z.string(),
  location: z.string(),
  connected: z.boolean().optional(),
});

const ExternalServiceSchema = z.object({
  name: z.string(),
  api_key: z.string(),
});

export const exchangesApi = {
  // Get all exchanges
  getExchanges: async () => {
    try {
      const response = await api.get('/exchanges');
      return z.array(ExchangeSchema).parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Add exchange
  addExchange: async (exchangeData: {
    name: string;
    api_key: string;
    api_secret: string;
    passphrase?: string;
    kraken_account_type?: string;
    binance_markets?: string[];
  }) => {
    try {
      const response = await api.put('/exchanges', exchangeData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Remove exchange
  removeExchange: async (name: string) => {
    try {
      const response = await api.delete('/exchanges', {
        data: { name },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Edit exchange
  editExchange: async (exchangeData: {
    name: string;
    api_key: string;
    api_secret: string;
    passphrase?: string;
    kraken_account_type?: string;
    binance_markets?: string[];
  }) => {
    try {
      const response = await api.patch('/exchanges', exchangeData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get external services
  getExternalServices: async () => {
    try {
      const response = await api.get('/external_services/');
      return z.array(ExternalServiceSchema).parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Add external service
  addExternalService: async (services: Array<{
    name: string;
    api_key: string;
  }>) => {
    try {
      const response = await api.put('/external_services/', { services });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Remove external service
  removeExternalService: async (serviceName: string) => {
    try {
      const response = await api.delete('/external_services/', {
        data: { services: [serviceName] },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
