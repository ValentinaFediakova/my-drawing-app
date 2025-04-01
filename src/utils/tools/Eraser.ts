import { DEFAULT_BG_COLOR } from "../../constants";

export class EraserTool {
  private ctx: CanvasRenderingContext2D;
  private eraserLineWidth: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.eraserLineWidth = 25;
  }

  setEraser(eraserLineWidth: number): void {
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.lineWidth = eraserLineWidth;
    this.ctx.strokeStyle = DEFAULT_BG_COLOR;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.eraserLineWidth = eraserLineWidth;
  }

  startDraw(points: { x: number; y: number }[]): void {
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
  }

  draw(points: { x: number; y: number }): void {
    this.ctx.lineTo(points.x, points.y);
    this.ctx.stroke();
  }

  drawEraserCursor(x: number, y: number): void {
    this.ctx.lineWidth = this.eraserLineWidth;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.eraserLineWidth / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = DEFAULT_BG_COLOR;
    this.ctx.fill();
  }
}
