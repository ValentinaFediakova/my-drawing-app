"use client";
import { PencilTool } from "@/utils/tools/Pencil";
import { EraserTool } from "@/utils/tools/Eraser";
import { TextTool } from "@/utils/tools/Text";
import { Tool } from "@/types";

// main controller for tools

export class DrawingManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing: boolean;
  private points: { x: number; y: number }[];
  private savedImageData: ImageData | null;
  private PencilTool: PencilTool;
  private EraserTool: EraserTool;
  private TextTool: TextTool;
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

  startDraw(points: { x: number; y: number }): void {
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

  startWriteText(points: { x: number; y: number }): void {
    this.ctx.globalCompositeOperation = "source-over";
    this.points = [points];
    this.TextTool.startWrite(this.points);
  }

  draw(points: { x: number; y: number }): void {
    if (this.tool === "writeText") return;
    if (!this.isDrawing) {
      if (this.savedImageData) {
        this.ctx.putImageData(this.savedImageData, 0, 0); // return saved state without circle
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
}
