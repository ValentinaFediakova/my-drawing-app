export type Tool = "pencil" | "eraser" | "writeText" | "shape" | "pastImg";

export type WsEventType =
  | "startDraw"
  | "inDrawProgress"
  | "writeText"
  | "end"
  | "setTool"
  | "setTextSettings"
  | "requestCurrentSettings"
  | "addImage"
  | "moveImage"
  | "resizeImage"
  | "deleteImage";

export interface WsData {
  id?: string;
  type?: WsEventType;
  tool?: Tool;
  shapeType?: string;
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
  width?: number;
  src?: string;
}

export type HistoryMessage = {
  type: "history";
  events: WsData[];
};

export type WebSocketMessage = WsData | HistoryMessage;

export type Point = { x: number; y: number };
// export type ShapeType = "rectangle" | "circle" | "line" | "martiancircle";
export type ShapeType = "rectangle" | "circle" | "line";

export interface ShapeConfig {
  shapeType: ShapeType;
  startShapePoint: Point;
  endShapePoint?: Point;
  color: string;
  lineWidth: number;
  opacity: number;
  previewCtx: CanvasRenderingContext2D;
}
