import { Point } from "@/types";

interface Images {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
}
export class ImageTool {
  private ctx: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D | null = null;
  private isResizing: boolean = false;
  private handleSize: number = 10;
  private images: Images[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setPreviewCtx(previewCtx: CanvasRenderingContext2D) {
    this.previewCtx = previewCtx;
  }

  drawImage(
    src: string,
    targetX: number,
    targetY: number,
    maxWidth: number
  ): void {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const drawWidth = maxWidth;
      const drawHeight = drawWidth / aspectRatio;

      this.images.push({
        image: img,
        x: targetX,
        y: targetY,
        width: drawWidth,
        height: drawHeight,
        isSelected: false,
      });

      this.drawPreview();
    };

    img.src = src;
  }

  drawPreview() {
    if (!this.previewCtx) return;
    this.previewCtx.clearRect(
      0,
      0,
      this.previewCtx.canvas.width,
      this.previewCtx.canvas.height
    );

    this.images.forEach((img) => {
      if (!this.previewCtx) return;
      this.previewCtx.drawImage(img.image, img.x, img.y, img.width, img.height);
      if (img.isSelected) {
        this.previewCtx.save();
        this.previewCtx.strokeStyle = "blue";
        this.previewCtx.setLineDash([5, 5]);
        this.previewCtx.strokeRect(img.x, img.y, img.width, img.height);
        this.previewCtx.fillStyle = "blue";
        this.previewCtx.fillRect(
          img.x + img.width - this.handleSize / 2,
          img.y + img.height - this.handleSize / 2,
          this.handleSize,
          this.handleSize
        );
        this.previewCtx.restore();
      }
    });
  }

  selectImageByPoint(point: Point) {
    for (let i = this.images.length - 1; i >= 0; i--) {
      const img = this.images[i];
      if (
        point.x >= img.x &&
        point.x <= img.x + img.width &&
        point.y >= img.y &&
        point.y <= img.y + img.height
      ) {
        this.images.forEach((img) => (img.isSelected = false));
        img.isSelected = true;
        this.drawPreview();
        return;
      }
    }
    this.images.forEach((img) => (img.isSelected = false));
    this.drawPreview();
  }

  startResizeIfOnHandle(point: Point) {
    const selected = this.images.find((img) => img.isSelected);
    if (!selected) return false;

    const handleX = selected.x + selected.width - this.handleSize / 2;
    const handleY = selected.y + selected.height - this.handleSize / 2;

    if (
      point.x >= handleX &&
      point.x <= handleX + this.handleSize &&
      point.y >= handleY &&
      point.y <= handleY + this.handleSize
    ) {
      this.isResizing = true;
      return true;
    }

    return false;
  }

  resizeSelectedImage(point: Point) {
    const selected = this.images.find((img) => img.isSelected);
    if (!selected || !this.isResizing) return;

    const newWidth = point.x - selected.x;
    const aspectRatio = selected.width / selected.height;
    const newHeight = newWidth / aspectRatio;

    selected.width = newWidth;
    selected.height = newHeight;

    this.drawPreview();
  }

  finalizeResize() {
    if (this.isResizing) {
      this.isResizing = false;

      const selected = this.images.find((img) => img.isSelected);
      if (selected) {
        selected.isSelected = false;
      }

      this.drawPreview();
    }
  }
}
