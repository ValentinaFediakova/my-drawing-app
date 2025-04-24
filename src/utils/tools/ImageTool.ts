export class ImageTool {
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private x: number = 0;
  private y: number = 0;
  private width: number = 100;
  private height: number = 100;
  private isSelected: boolean = false;

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

  select(clickX: number, clickY: number) {
    const withinX = clickX >= this.x && clickX <= this.x + this.width;
    const withinY = clickY >= this.y && clickY <= this.y + this.height;

    this.isSelected = withinX && withinY;
  }
}
