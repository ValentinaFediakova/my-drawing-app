"use client";
import { PencilTool } from "@/utils/tools/Pencil";

// main controller for tools

type tool = "pencil" | "eraser";

export class DrawingManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing: boolean;
  private points: { x: number; y: number }[];
  private savedImageData: ImageData | null;
  private PencilTool: PencilTool;
  private tool: tool = "pencil";

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
  }

  setTool(tool: tool): void {
    this.tool = tool;
  }

  setBrushSettings(lineWidth: number, color: string, opacity: number) {
    if (this.tool === "pencil") {
      this.PencilTool.setPencil(lineWidth, color, opacity);
    }
  }

  startDraw(points: { x: number; y: number }): void {
    this.isDrawing = true;
    this.points = [points];

    if (this.tool === "pencil") {
      this.PencilTool.startDraw(this.points);
    }

    this.savedImageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  draw(e: MouseEvent): void {
    if (!this.isDrawing) return;
    if (this.savedImageData) {
      this.ctx.putImageData(this.savedImageData, 0, 0);
    }
    if (this.tool === "pencil") {
      this.PencilTool.draw(e);
    }
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
}
