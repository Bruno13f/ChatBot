import type { ServerWebSocket } from "bun";

interface WebSocketClient {
  id: string;
  ws: ServerWebSocket;
}

class WebSocketServer {
  private clients: Map<string, WebSocketClient> = new Map();
  private server: ReturnType<typeof Bun.serve>;

  constructor(port: number = 6000) {
    this.server = Bun.serve({
      port,
      fetch: (req, server) => {
        if (server.upgrade(req)) {
          return; // WebSocket upgrade successful
        }
        return new Response("Upgrade failed", { status: 400 });
      },
      websocket: {
        open: (ws: ServerWebSocket) => {
          const clientId = crypto.randomUUID();
          this.clients.set(clientId, { id: clientId, ws });
          console.log(`Client connected: ${clientId}. Total clients: ${this.clients.size}`);
        },
        message: (ws: ServerWebSocket, message: string | Buffer) => {
          // Broadcast message to all clients except sender
          this.broadcast(message, ws);
        },
        close: (ws: ServerWebSocket) => {
          // Find and remove the disconnected client
          for (const [id, client] of this.clients.entries()) {
            if (client.ws === ws) {
              this.clients.delete(id);
              console.log(`Client disconnected: ${id}. Total clients: ${this.clients.size}`);
              break;
            }
          }
        }
      },
    });

    console.log(`WebSocket server started on ws://localhost:${port}`);
  }

  private broadcast(message: string | Buffer, sender: ServerWebSocket) {
    for (const client of this.clients.values()) {
      if (client.ws !== sender) {
        client.ws.send(message);
      }
    }
  }
}

// Start the WebSocket server
new WebSocketServer();