type WSEventHandler = (data: unknown) => void;

interface WSConnectionOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WSConnection {
  private ws: WebSocket | null = null;
  private handlers: Map<string, WSEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private shouldReconnect = true;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private url: string,
    private options: WSConnectionOptions = {}
  ) {
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 15,
      ...options,
    };
  }

  connect(): void {
    if (typeof window === "undefined") return; // SSR guard
    this.shouldReconnect = true;
    this.createConnection();
  }

  private createConnection(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.emit("connected", null);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type) {
            this.emit(data.type, data.payload ?? data);
          }
          this.emit("message", data);
        } catch {
          this.emit("message", event.data);
        }
      };

      this.ws.onclose = (event) => {
        this.emit("disconnected", {
          code: event.code,
          reason: event.reason,
        });
        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        this.emit("error", { message: "WebSocket connection error" });
      };
    } catch (error) {
      this.emit("error", error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (
      !this.shouldReconnect ||
      this.reconnectAttempts >= (this.options.maxReconnectAttempts ?? 15)
    ) {
      this.emit("reconnect_failed", {
        attempts: this.reconnectAttempts,
      });
      return;
    }

    this.reconnectAttempts++;
    this.emit("reconnecting", { attempt: this.reconnectAttempts });

    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, this.options.reconnectInterval);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event: string, handler: WSEventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off(event: string, handler: WSEventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      this.handlers.set(
        event,
        handlers.filter((h) => h !== handler)
      );
    }
  }

  private emit(event: string, data: unknown): void {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (e) {
        console.error(`WS handler error for '${event}':`, e);
      }
    });
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

export function createWSConnection(
  url: string,
  options?: WSConnectionOptions
): WSConnection {
  return new WSConnection(url, options);
}
