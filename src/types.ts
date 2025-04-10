export type Tool = "pencil" | "eraser" | "writeText";

export interface WsData {
  type?: string;
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
}
