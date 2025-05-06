import { WsData } from "@/types";
export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval = 3000;
  private isManuallyClosed = false;
  private onMessageCallback?: (data: WsData) => void;

  constructor(url: string) {
    this.url = url;
  }

  connect(onMessage: (data: WsData) => void, onOpen?: () => void): void {
    this.socket = new WebSocket(this.url);
    this.onMessageCallback = onMessage;

    this.socket.onopen = (): void => {
      console.log("✅ WebSocket connected");
      if (onOpen) {
        onOpen();
      }
    };

    this.socket.onmessage = async (event: MessageEvent): Promise<void> => {
      try {
        const text: string =
          event.data instanceof Blob ? await event.data.text() : event.data;
        const parsedData = JSON.parse(text);
        onMessage(parsedData);
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", err);
      }
    };

    this.socket.onerror = (err: Event): void => {
      console.warn("❌ WebSocket error:", err);
    };

    this.socket.onclose = (): void => {
      if (!this.isManuallyClosed) {
        setTimeout(
          () => this.connect(onMessage, onOpen),
          this.reconnectInterval
        );
      }
    };
  }

  send(data: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  close(): void {
    this.isManuallyClosed = true;
    this.socket?.close();
  }

  handleIncomingEvent(data: WsData): void {
    this.onMessageCallback?.(data);
  }
}
