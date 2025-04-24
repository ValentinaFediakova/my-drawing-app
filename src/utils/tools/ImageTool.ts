import { Point } from "@/types";

export class ImageTool {
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private x: number = 0;
  private y: number = 0;
  private width: number = 100;
  private height: number = 100;
  private isSelected: boolean = false;
  private isResizing: boolean = false;
  private handleSize: number = 10;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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

    img.onload = () => {
      const aspectRatio = img.width / img.height;

      const drawWidth = maxWidth;
      const drawHeight = maxWidth / aspectRatio;

      this.ctx.drawImage(img, targetX, targetY, drawWidth, drawHeight);
    };

    img.src = src;

    this.setImage(img, targetX, targetY, maxWidth, maxHeight);
  }

  select(points: Point) {
    console.log("points", points);
    const { x: clickX, y: clickY } = points;

    const withinImageX = clickX >= this.x && clickX <= this.x + this.width;
    const withinImageY = clickY >= this.y && clickY <= this.y + this.height;

    const handleX = this.x + this.width - this.handleSize;
    const handleY = this.y + this.height - this.handleSize;

    const onHandleX = clickX >= handleX && clickX <= handleX + this.handleSize;
    const onHandleY = clickY >= handleY && clickY <= handleY + this.handleSize;

    if (onHandleX && onHandleY) {
      this.isResizing = true;
      this.isSelected = false;
    } else if (withinImageX && withinImageY) {
      this.isSelected = true;
      this.isResizing = false;
    } else {
      this.isSelected = false;
      this.isResizing = false;
    }

    this.framedImage();
  }

  framedImage() {
    if (!this.isSelected) return;
    console.log("nfkjsfkajfkajfakjbf");

    this.ctx.save();
    this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(this.x, this.y, this.width, this.height);
    this.ctx.restore();

    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(
      this.x + this.width - this.handleSize / 2,
      this.y + this.height - this.handleSize / 2,
      this.handleSize,
      this.handleSize
    );
  }
}
