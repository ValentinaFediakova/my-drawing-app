import { Point } from "@/types";

interface Images {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  deleteBounds?: { x: number; y: number; width: number; height: number };
}
export class ImageTool {
  private ctx: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D | null = null;
  private isResizing: boolean = false;
  private isDragging: boolean = false;
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
          img.x + img.width,
          img.y + img.height,
          this.handleSize,
          this.handleSize
        );
        const trashSize = 20;
        const trashX = img.x + img.width;
        const trashY = img.y - trashSize;
        const trashIcon = new Image();
        trashIcon.src = "/trashIcon.svg";

        img.deleteBounds = {
          x: trashX,
          y: trashY,
          width: trashSize,
          height: trashSize,
        };

        trashIcon.onload = () => {
          if (this.previewCtx) {
            this.previewCtx.fillStyle = "blue";
            this.previewCtx.beginPath();
            const radius = 6;
            this.previewCtx.moveTo(trashX + radius, trashY);
            this.previewCtx.lineTo(trashX + trashSize - radius, trashY);
            this.previewCtx.quadraticCurveTo(
              trashX + trashSize,
              trashY,
              trashX + trashSize,
              trashY + radius
            );
            this.previewCtx.lineTo(
              trashX + trashSize,
              trashY + trashSize - radius
            );
            this.previewCtx.quadraticCurveTo(
              trashX + trashSize,
              trashY + trashSize,
              trashX + trashSize - radius,
              trashY + trashSize
            );
            this.previewCtx.lineTo(trashX + radius, trashY + trashSize);
            this.previewCtx.quadraticCurveTo(
              trashX,
              trashY + trashSize,
              trashX,
              trashY + trashSize - radius
            );
            this.previewCtx.lineTo(trashX, trashY + radius);
            this.previewCtx.quadraticCurveTo(
              trashX,
              trashY,
              trashX + radius,
              trashY
            );
            this.previewCtx.closePath();
            this.previewCtx.fill();

            this.previewCtx.drawImage(
              trashIcon,
              trashX,
              trashY,
              trashSize,
              trashSize
            );
          }
        };

        this.previewCtx.restore();
      }
    });
  }

  selectImageByPoint(point: Point) {
    for (let i = this.images.length - 1; i >= 0; i--) {
      const img = this.images[i];

      if (img.deleteBounds) {
        const { x, y, width, height } = img.deleteBounds;
        const onTrashIcon =
          point.x >= x &&
          point.x <= x + width &&
          point.y >= y &&
          point.y <= y + height;

        if (onTrashIcon) {
          this.images.splice(i, 1);
          this.drawPreview();
          return;
        }
      }

      const handleX = img.x + img.width - this.handleSize;
      const handleY = img.y + img.height - this.handleSize;

      const onHandleX =
        point.x >= handleX && point.x <= handleX + this.handleSize;
      const onHandleY =
        point.y >= handleY && point.y <= handleY + this.handleSize;

      if (
        point.x >= img.x &&
        point.x <= img.x + img.width &&
        point.y >= img.y &&
        point.y <= img.y + img.height
      ) {
        this.images.forEach((img) => (img.isSelected = false));
        img.isSelected = true;

        if (onHandleX && onHandleY) {
          this.isResizing = true;
          this.isDragging = false;
        } else {
          this.isDragging = true;
          this.isResizing = false;
        }

        this.drawPreview();
        return;
      }
    }

    this.images.forEach((img) => (img.isSelected = false));
    this.isDragging = false;
    this.isResizing = false;
    this.drawPreview();
  }

  startResizeIfOnHandle(point: Point): boolean {
    for (let i = this.images.length - 1; i >= 0; i--) {
      const img = this.images[i];
      const handleX = img.x + img.width;
      const handleY = img.y + img.height;

      const onHandleX =
        point.x >= handleX && point.x <= handleX + this.handleSize;
      const onHandleY =
        point.y >= handleY && point.y <= handleY + this.handleSize;

      if (onHandleX && onHandleY) {
        this.images.forEach((img) => (img.isSelected = false));
        img.isSelected = true;
        this.isResizing = true;
        this.isDragging = false;
        this.drawPreview();
        return true;
      }
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

  isImgDragging() {
    return this.isDragging;
  }

  moveSelectedImage(newPoints: Point) {
    const selected = this.images.find((img) => img.isSelected);
    if (!selected || !this.isDragging) return;

    selected.x += newPoints.x;
    selected.y += newPoints.y;

    this.drawPreview();
  }
}
