import type { Response } from "express";

const clients = new Set<Response>();

export function registerSseClient(res: Response) {
  clients.add(res);
}

export function unregisterSseClient(res: Response) {
  clients.delete(res);
}

export function broadcastEvent(type: string, payload: unknown) {
  const data = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of clients) {
    client.write(data);
  }
}
