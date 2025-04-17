export type Tool = "pencil" | "eraser" | "writeText";

export type WsEventType =
  | "startDraw"
  | "inDrawProgress"
  | "writeText"
  | "end"
  | "setTool"
  | "setTextSettings"
  | "requestCurrentSettings";

export interface WsData {
  type?: WsEventType;
  tool?: Tool;
  color?: string;
  fontSize?: number;
  outline?: string[];
  opacity?: number;
  lineWidth?: number;
  eraserLineWidth?: number;
  points?: { x: number; y: number }[];
  key?: string;
  userId?: string;
  name?: string;
  lastPoint?: { x: number; y: number };
}

export type HistoryMessage = {
  type: "history";
  events: WsData[];
};

export type WebSocketMessage = WsData | HistoryMessage;
