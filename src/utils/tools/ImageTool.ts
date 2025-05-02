import { Point } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { WsData } from "@/types";

interface Images {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  deleteBounds?: { x: number; y: number; width: number; height: number };
  opacity: number;
}
export class ImageTool {
  private ctx: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D | null = null;
  private isResizing: boolean = false;
  private isDragging: boolean = false;
  private handleSize: number = 10;
  private images: Images[] = [];
  private currentOpacity: number = 1;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setPreviewCtx(previewCtx: CanvasRenderingContext2D) {
    this.previewCtx = previewCtx;
  }

  setOpacityForSelectedImage(opacity: number) {
    this.currentOpacity = opacity;

    const selected = this.images.find((img) => img.isSelected);
    if (selected) {
      selected.opacity = opacity;
      this.drawPreview();
    }
  }

  getSelectedImage() {
    return this.images.find((img) => img.isSelected);
  }

  setImageOpacityById(id: string, opacity: number) {
    const img = this.images.find((img) => img.id === id);
    if (img) {
      img.opacity = opacity;
      this.drawPreview();
    }
  }

  drawImage(
    src: string,
    points: Point,
    maxWidth: number,
    opacity: number,
    height?: number,
    idArg?: string
  ): {
    type: "addOrUpdateImage";
    id: string;
    src: string;
    points: Point[];
    width: number;
    opacity: number;
    height: number;
  } | void {
    const { x: targetX, y: targetY } = points;
    const id = idArg ? idArg : uuidv4();
    const img = new Image();
    img.crossOrigin = "anonymous";
    let drawHeight = 0;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const drawWidth = maxWidth;
      drawHeight = height ?? drawWidth / aspectRatio;

      const existing = this.images.find((img) => img.id === id);
      if (existing) {
        existing.x = targetX;
        existing.y = targetY;
        existing.width = drawWidth;
        existing.height = drawHeight;
        existing.opacity = opacity;
        existing.image = img;
      } else {
        this.images.push({
          id,
          image: img,
          x: targetX,
          y: targetY,
          width: drawWidth,
          height: drawHeight,
          isSelected: false,
          opacity,
        });
      }

      this.drawPreview();
    };

    img.src = src;

    return {
      type: "addOrUpdateImage",
      id,
      src,
      points: [points],
      width: maxWidth,
      height: height ?? drawHeight / (img.width / img.height),
      opacity,
    };
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

      this.previewCtx.save();
      this.previewCtx.globalAlpha = img.opacity;
      this.previewCtx.drawImage(img.image, img.x, img.y, img.width, img.height);
      this.previewCtx.restore();

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

        if (!this.isResizing && !this.isDragging) {
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
        }

        this.previewCtx.restore();
      }
    });
  }

  selectImageByPoint(point: Point) {
    for (let i = this.images.length - 1; i >= 0; i--) {
      const img = this.images[i];

      if (img.deleteBounds) {
        this.deleteImageByPoint(point);
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

  resizeSelectedImage(point: Point): WsData | void {
    const selected = this.images.find((img) => img.isSelected);
    if (!selected || !this.isResizing) return;

    const newWidth = point.x - selected.x;
    const aspectRatio = selected.width / selected.height;
    const newHeight = newWidth / aspectRatio;

    selected.width = newWidth;
    selected.height = newHeight;

    this.drawPreview();

    return {
      type: "resizeImage",
      id: selected.id,
      width: newWidth,
      height: newHeight,
      points: [point],
    };
  }

  finalizeImageInteraction() {
    if (this.isDragging || this.isResizing) {
      this.isDragging = false;
      this.isResizing = false;

      const selected = this.images.find((img) => img.isSelected);
      if (selected) {
        selected.isSelected = true;
      }

      this.drawPreview();
    }
  }

  isImgDragging() {
    return this.isDragging;
  }

  moveSelectedImage(newPoints: Point): WsData | void {
    const selected = this.images.find((img) => img.isSelected);
    if (!selected || !this.isDragging) return;

    selected.x += newPoints.x;
    selected.y += newPoints.y;

    this.drawPreview();

    return {
      type: "moveImage",
      id: selected.id,
      points: [{ x: selected.x, y: selected.y }],
    };
  }

  deleteImageByPoint(point: Point): WsData | void {
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
          const deletedId = img.id;
          return {
            type: "deleteImage",
            id: deletedId,
            points: [point],
          };
        }
      }
    }
  }

  moveImageById(id: string, point: Point): void {
    const img = this.images.find((img) => img.id === id);
    if (!img) return;

    img.x = point.x;
    img.y = point.y;

    this.drawPreview();
  }

  resizeImageById(id: string, width: number, height: number): void {
    const img = this.images.find((img) => img.id === id);
    if (!img) return;

    img.width = width;
    img.height = height;

    this.drawPreview();
  }

  deleteImageById(id: string): void {
    const index = this.images.findIndex((img) => img.id === id);
    if (index !== -1) {
      this.images.splice(index, 1);
      this.drawPreview();
    }
  }

  getImageById(id: string) {
    return this.images.find((img) => img.id === id);
  }
}
