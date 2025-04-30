"use client";
import { PencilTool } from "@/utils/tools/Pencil";
import { EraserTool } from "@/utils/tools/Eraser";
import { TextTool } from "@/utils/tools/Text";
import { ShapesTool } from "@/utils/tools/Shapes";
import { ImageTool } from "@/utils/tools/ImageTool";
import { Tool } from "@/types";
import { Point, ShapeConfig } from "@/types";

// main controller for tools

export class DrawingManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing: boolean;
  private points: Point[];
  private savedImageData: ImageData | null;
  private PencilTool: PencilTool;
  private EraserTool: EraserTool;
  private TextTool: TextTool;
  private ShapesTool: ShapesTool;
  private ImageTool: ImageTool;
  private tool: Tool = "pencil";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get 2D context");
    }
    this.ctx = context;
    this.isDrawing = false;
    this.points = [];
    this.savedImageData = null;
    this.PencilTool = new PencilTool(this.ctx);
    this.EraserTool = new EraserTool(this.ctx);
    this.TextTool = new TextTool(this.ctx, canvas);
    this.ShapesTool = new ShapesTool(this.ctx);
    this.ImageTool = new ImageTool(this.ctx);
  }

  getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }

  setTool(tool: Tool): void {
    this.tool = tool;
    if (tool !== `writeText`) {
      this.TextTool.stopCursorBlinking();
      this.TextTool.isTextActive = false;
    }
  }

  setBrushSettings(
    lineWidth: number,
    eraserLineWidth: number,
    color: string,
    opacity: number
  ): void {
    if (this.tool === "pencil") {
      this.PencilTool.setPencil(lineWidth, color, opacity);
    }
    if (this.tool === "eraser") {
      this.EraserTool.setEraser(eraserLineWidth);
    }
  }

  setTextSettings(
    color: string,
    fontSize: number,
    outline: string[] = ["Normal"]
  ): void {
    this.isDrawing = false;
    this.canvas.focus();
    this.TextTool.setText(fontSize, outline, color);
  }

  startDraw(points: Point): void {
    this.isDrawing = true;
    this.points = [points];
    this.TextTool.stopCursorBlinking();

    if (this.tool === "pencil") {
      this.PencilTool.startDraw(this.points);
    }

    if (this.tool === "eraser") {
      this.EraserTool.startDraw(this.points);
    }

    this.savedImageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  startWriteText(points: Point): void {
    this.ctx.globalCompositeOperation = "source-over";
    this.points = [points];
    this.TextTool.startWrite(this.points);
  }

  setPreviewSettings(shape: ShapeConfig): void {
    this.ShapesTool.setPreviewSettings(shape);
  }

  drawShapePreview(endShapePoint: Point | null) {
    if (endShapePoint) {
      this.ShapesTool.drawShapePreview(endShapePoint);
    }
  }

  draw(points: Point): void {
    if (this.tool === "writeText" || this.tool === "shape") return;
    if (!this.isDrawing) {
      if (this.savedImageData) {
        this.ctx.putImageData(this.savedImageData, 0, 0);
      }

      if (this.tool === "eraser") {
        this.EraserTool.drawEraserCursor(points.x, points.y);
      }

      return;
    }
    if (this.savedImageData) {
      this.ctx.putImageData(this.savedImageData, 0, 0);
    }
    if (this.tool === "pencil") {
      this.PencilTool.draw(points);
    }
    if (this.tool === "eraser") {
      this.EraserTool.draw(points);
    }
  }

  writeText(key: string): void {
    this.TextTool.writingText(key);
    this.savedImageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  getWidthAndHeightOfText(): { width: number; height: number } {
    return this.TextTool.getWidthAndHeightOfText();
  }

  stopDraw(): void {
    this.isDrawing = false;
    this.savedImageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  finalizeDrawShape(shapeConfig: ShapeConfig, isWs = false): void {
    this.ShapesTool.finalizeDrawShape(shapeConfig, isWs);
  }

  clearCanvas(): void {
    this.savedImageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.savedImageData = null;
  }

  setPreviewCtx(previewCtxForImg: CanvasRenderingContext2D): void {
    this.ImageTool.setPreviewCtx(previewCtxForImg);
  }

  selectImgOnCanvas(point: Point): void {
    this.ImageTool.selectImageByPoint(point);
  }

  startResizeIfOnHandle(point: Point): boolean {
    return this.ImageTool.startResizeIfOnHandle(point);
  }

  resizeSelectedImage(point: Point) {
    return this.ImageTool.resizeSelectedImage(point);
  }

  finalizeImageInteraction(): void {
    this.ImageTool.finalizeImageInteraction();
  }

  isImgDragging() {
    return this.ImageTool.isImgDragging();
  }

  moveSelectedImage(points: Point) {
    return this.ImageTool.moveSelectedImage(points);
  }

  deleteImgOnCanvas(points: Point) {
    return this.ImageTool.deleteImageByPoint(points);
  }

  drawImageOnCanvasTool(
    src: string,
    points: Point,
    width: number,
    id?: string
  ) {
    return this.ImageTool.drawImage(src, points, width, id);
  }

  moveImageById(id: string, point: Point) {
    this.ImageTool.moveImageById(id, point);
  }

  resizeImageById(id: string, width: number, height: number) {
    this.ImageTool.resizeImageById(id, width, height);
  }

  deleteImageById(id: string) {
    this.ImageTool.deleteImageById(id);
  }

  drawImageById(src: string, point: Point, width: number, id: string) {
    this.ImageTool.drawImage(src, point, width, id);
  }
}
