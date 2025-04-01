import { convertColorToRgba } from "../ColorConvertations";

export class PencilTool {
  private ctx: CanvasRenderingContext2D;
  // private lineWidth: number = 5;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setPencil(lineWidth: number, color: string, opacity: number): void {
    this.ctx.globalCompositeOperation = "source-over";
    console.log("!!! PencilTool setPencil lineWidth", typeof lineWidth);
    this.ctx.lineWidth = lineWidth;
    // this.lineWidth = lineWidth;
    console.log("PencilTool setPencil this.ctx.lineWidth", this.ctx.lineWidth);

    this.ctx.strokeStyle = convertColorToRgba(color, String(opacity));
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  startDraw(points: { x: number; y: number }[]): void {
    // this.ctx.lineWidth = this.lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
  }

  draw(points: { x: number; y: number }): void {
    // this.ctx.lineWidth = this.lineWidth;
    // console.log("PencilTool draw this.ctx.lineWidth", this.ctx.lineWidth);
    this.ctx.lineTo(points.x, points.y);
    this.ctx.stroke();
  }
}
