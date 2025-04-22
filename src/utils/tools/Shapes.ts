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
      // case "circle":
      //   this.drawCircle(endShapePoint);
      //   break;
      // case "line":
      //   this.drawLine(endShapePoint);
      //   break;
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
  // private drawCircle(shape: ShapeConfig) {
  //   /* ... */
  // }
  // private drawLine(shape: ShapeConfig) {
  //   /* ... */
  // }

  finalizeDrawShape(shapeConfig?: ShapeConfig): void {
    if (!shapeConfig) return;
    this.ctx.strokeStyle = this.color ?? "black";
    this.ctx.lineWidth = this.lineWidth ?? 5;
    this.ctx.globalAlpha = this.opacity ?? 1;

    switch (shapeConfig.shapeType) {
      case "rectangle": {
        const x = shapeConfig.startShapePoint.x;
        const y = shapeConfig.startShapePoint.y;
        const width = (shapeConfig.endShapePoint?.x ?? x) - x;
        const height = (shapeConfig.endShapePoint?.y ?? y) - y;
        this.ctx.strokeRect(x, y, width, height);
        break;
      }
    }
  }
}
