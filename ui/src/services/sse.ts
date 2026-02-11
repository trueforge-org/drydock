class SseService {
  private eventSource: EventSource | null = null;
  private eventBus: any = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private selfUpdateMode = false;

  connect(eventBus: any) {
    this.eventBus = eventBus;
    this.doConnect();
  }

  private doConnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource('/api/events/ui');

    this.eventSource.addEventListener('dd:connected', () => {
      this.eventBus?.emit('sse:connected');
    });

    this.eventSource.addEventListener('dd:self-update', () => {
      this.selfUpdateMode = true;
      this.eventBus?.emit('self-update');
    });

    this.eventSource.addEventListener('dd:heartbeat', () => {
      // Keep-alive, no action needed
    });

    this.eventSource.onerror = () => {
      if (this.selfUpdateMode) {
        this.eventBus?.emit('connection-lost');
      } else {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(delayMs = 5000) {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.doConnect(), delayMs);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.selfUpdateMode = false;
  }
}

export default new SseService();
