import { Point, ShapeType, ShapeConfig } from "@/types";

export class ShapesTool {
  private ctx: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D | null = null;
  private startShapePoint: Point | null = null;
  private endShapePoint: Point | null = null;
  private shapeType: ShapeType | null = null;
  private color: string | null = null;
  private lineWidth: number | null = null;
  private opacity: number | null = null;
  private widthOfShape: number = 0;
  private heightOfShape: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setPreviewSettings(shapeConfig: ShapeConfig): void {
    this.previewCtx = shapeConfig.previewCtx;
    this.startShapePoint = shapeConfig.startShapePoint;
    this.shapeType = shapeConfig.shapeType;
    this.color = shapeConfig.color;
    this.lineWidth = shapeConfig.lineWidth;
    this.opacity = shapeConfig.opacity;
  }

  drawShapePreview(endShapePoint: Point): void {
    switch (this.shapeType) {
      case "rectangle":
        this.drawSquare(endShapePoint);
        break;
      case "circle":
        this.drawCircle(endShapePoint);
        break;
      case "line":
        this.drawLine(endShapePoint);
        break;
    }
  }

  private drawSquare(endShapePoint: Point): void {
    if (!this.previewCtx || !this.startShapePoint) return;

    this.endShapePoint = endShapePoint;

    const { x: x1, y: y1 } = this.startShapePoint;
    const { x: x2, y: y2 } = this.endShapePoint;

    this.widthOfShape = x2 - x1;
    this.heightOfShape = y2 - y1;

    this.previewCtx.clearRect(
      0,
      0,
      this.previewCtx.canvas.width,
      this.previewCtx.canvas.height
    );
    this.previewCtx.strokeStyle = this.color ?? "black";
    this.previewCtx.lineWidth = this.lineWidth ?? 5;
    this.previewCtx.globalAlpha = this.opacity ?? 1;

    this.previewCtx.strokeRect(x1, y1, this.widthOfShape, this.heightOfShape);
  }
  private drawCircle(endShapePoint: Point) {
    if (!this.previewCtx || !this.startShapePoint) return;

    this.previewCtx.lineWidth = this.lineWidth ?? 5;
    this.previewCtx.globalAlpha = this.opacity ?? 1;

    this.endShapePoint = endShapePoint;

    const { x: x1, y: y1 } = this.startShapePoint;
    const { x: x2, y: y2 } = this.endShapePoint;

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;

    this.previewCtx.clearRect(
      0,
      0,
      this.previewCtx.canvas.width,
      this.previewCtx.canvas.height
    );
    this.previewCtx.beginPath();
    this.previewCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.previewCtx.stroke();
  }

  private drawLine(endShapePoint: Point) {
    if (!this.previewCtx || !this.startShapePoint) return;

    this.previewCtx.lineWidth = this.lineWidth ?? 5;
    this.previewCtx.globalAlpha = this.opacity ?? 1;

    this.endShapePoint = endShapePoint;

    const { x: x1, y: y1 } = this.startShapePoint;
    const { x: x2, y: y2 } = this.endShapePoint;

    this.previewCtx.clearRect(
      0,
      0,
      this.previewCtx.canvas.width,
      this.previewCtx.canvas.height
    );

    this.previewCtx.beginPath();
    this.previewCtx.moveTo(x1, y1);
    this.previewCtx.lineTo(x2, y2);
    this.previewCtx.stroke();
    this.previewCtx.closePath();
  }

  finalizeDrawShape(shapeConfig: ShapeConfig, isWs = false): void {
    if (!shapeConfig) return;
    const ctx = isWs ? shapeConfig.previewCtx : this.ctx;

    ctx.strokeStyle = shapeConfig.color ?? "black";
    ctx.lineWidth = shapeConfig.lineWidth ?? 5;
    ctx.globalAlpha = shapeConfig.opacity ?? 1;

    switch (shapeConfig.shapeType) {
      case "rectangle": {
        const x = shapeConfig.startShapePoint.x;
        const y = shapeConfig.startShapePoint.y;
        const width = (shapeConfig.endShapePoint?.x ?? x) - x;
        const height = (shapeConfig.endShapePoint?.y ?? y) - y;
        ctx.strokeRect(x, y, width, height);
        break;
      }
      case "circle": {
        const { x: x1, y: y1 } = shapeConfig.startShapePoint;
        const { x: x2, y: y2 } = shapeConfig.endShapePoint!;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const radius = Math.hypot(x2 - x1, y2 - y1) / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        break;
      }
      case "line": {
        const { x: x1, y: y1 } = shapeConfig.startShapePoint;
        const { x: x2, y: y2 } = shapeConfig.endShapePoint!;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}
