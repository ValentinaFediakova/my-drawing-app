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
  private previewCtx: CanvasRenderingContext2D;
  private isResizing: boolean = false;
  private handleSize: number = 10;
  private images: Images[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // setImage(image: HTMLImageElement, x: number, y: number) {
  //   this.image = image;
  //   this.startPoints.x = x;
  //   this.startPoints.y = y;
  // }

  setPreviewCtx(previewCtx: CanvasRenderingContext2D) {
    this.previewCtx = previewCtx;
  }

  drawImage(
    src: string,
    targetX: number,
    targetY: number,
    maxWidth: number,
    maxHeight: number
  ): void {
    const img = new Image();
    img.crossOrigin = "anonymous";

    this.image.onload = () => {
      if (!this.image) return;
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
    };

    this.image.src = src;

    // this.setImage(this.image, targetX, targetY);
  }

  select() {
    this.framedImage();
  }

  framedImage() {
    const { x, y } = this.startPoints;

    this.previewCtxForImg.clearRect(
      0,
      0,
      this.previewCtxForImg.canvas.width,
      this.previewCtxForImg.canvas.height
    );

    this.previewCtxForImg.save();
    this.previewCtxForImg.strokeStyle = "blue";
    this.previewCtxForImg.lineWidth = 2;
    this.previewCtxForImg.setLineDash([5, 5]);
    this.previewCtxForImg.strokeRect(x, y, this.width, this.height);
    this.previewCtxForImg.restore();

    this.previewCtxForImg.fillStyle = "blue";
    this.previewCtxForImg.fillRect(
      x + this.width,
      y + this.height,
      this.handleSize,
      this.handleSize
    );

    if (!this.image) return;
    this.previewCtxForImg.drawImage(this.image, x, y, this.width, this.height);
  }

  resizeImage(resizePoints: Point) {
    if (!this.image) return;

    this.isResizing = true;

    const { x: startX, y: startY } = this.startPoints;
    const { x: clickX, y: clickY } = resizePoints;

    const newWidth = clickX - startX;
    const scale = newWidth / this.width;
    const newHeight = this.height * scale;

    this.width = newWidth;
    this.height = newHeight;

    this.previewCtxForImg.clearRect(
      0,
      0,
      this.ctx.canvas.width,
      this.ctx.canvas.height
    );

    this.framedImage();

    this.previewCtxForImg.drawImage(
      this.image,
      startX,
      startY,
      this.width,
      this.height
    );
  }

  finalizeImageResize() {
    if (!this.image || !this.isResizing) return;
    this.previewCtxForImg.clearRect(
      0,
      0,
      this.ctx.canvas.width,
      this.ctx.canvas.height
    );
    this.previewCtxForImg.drawImage(
      this.image,
      this.startPoints.x,
      this.startPoints.y,
      this.width,
      this.height
    );

    this.isResizing = false;
  }
}
