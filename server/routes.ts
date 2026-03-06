import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.get('/api/flights', (_req, res) => {
    res.json({
      routes: [
        {
          id: 'sydney_santiago',
          from: { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
          to: { lat: -33.4489, lon: -70.6693, name: 'Santiago' },
        },
        {
          id: 'johannesburg_sydney',
          from: { lat: -26.2041, lon: 28.0473, name: 'Johannesburg' },
          to: { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
        },
        {
          id: 'santiago_auckland',
          from: { lat: -33.4489, lon: -70.6693, name: 'Santiago' },
          to: { lat: -36.8485, lon: 174.7633, name: 'Auckland' },
        },
        {
          id: 'perth_johannesburg',
          from: { lat: -31.9505, lon: 115.8605, name: 'Perth' },
          to: { lat: -26.2041, lon: 28.0473, name: 'Johannesburg' },
        },
      ],
    });
  });

  return httpServer;
}
