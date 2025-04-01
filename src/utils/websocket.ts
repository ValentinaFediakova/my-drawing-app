type WsData = {
  type: "start";
  tool: "pencil" | "eraser" | "writeText";
  points: { x: number; y: number }[];
};
export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval = 3000;
  private isManuallyClosed = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(onMessage: (data: WsData) => void): void {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = (): void => {
      console.log("✅ WebSocket connected");
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
      console.error("❌ WebSocket error:", err);
    };

    this.socket.onclose = (): void => {
      console.log("🔌 WebSocket closed");
      if (!this.isManuallyClosed) {
        setTimeout(() => this.connect(onMessage), this.reconnectInterval);
      }
    };
  }

  send(data: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
      // console.log("📤 Sent:", data);
    } else {
      console.warn("⏳ WebSocket is not ready yet. Message not sent.");
    }
  }

  close(): void {
    this.isManuallyClosed = true;
    this.socket?.close();
  }
}
