export class TextTool {
  private ctx: CanvasRenderingContext2D;
  private prevFontSize: number = 24;
  private fontSize: number = 24;
  private outline: string[] = ["normal"];
  private widthStartArea: number = 20;
  private prevPoints: { x: number; y: number }[] = [];
  private currentPoints: { x: number; y: number }[] = [];
  private isCoursorVisible: boolean = false;
  private animationFrameId: number | null = null;
  private blinkingTime: number = 0;
  private coursorTimeout: number = 500;
  private color: string = "";
  private prevCursorPositionX: number = 0;
  private textData: { char: string; fontSize: number }[] = [];
  private textWidth: number = 0;
  private chartPlaceX: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setText(fontSize: number, outline: string[], color: string): void {
    this.color = color;
    const a = 0;
    this.fontSize = fontSize;
    this.outline = outline;
    this.ctx.fillStyle = color;
    this.ctx.font = `${outline[0]} ${fontSize}px Arial`;
  }

  coursorBlinking(): void {
    const now = performance.now();
    let textWidth = 0;
    const padding = 5;
    const cursorY =
      this.prevPoints.length > 0
        ? this.prevPoints[0].y
        : this.currentPoints[0].y;
    const currentFontSize =
      this.textData.length > 0
        ? this.textData[this.textData.length - 1].fontSize
        : 24;

    if (now - this.blinkingTime >= this.coursorTimeout) {
      this.blinkingTime = now;
      this.isCoursorVisible = !this.isCoursorVisible;
    }

    this.prevFontSize =
      this.textData.length > 1
        ? this.textData[this.textData.length - 2].fontSize
        : 24;

    this.textData.forEach(({ char, fontSize }) => {
      this.ctx.font = `${this.outline} ${fontSize}px Arial`;
      textWidth += this.ctx.measureText(char).width;
    });

    this.prevCursorPositionX = this.currentPoints[0].x + textWidth + padding;

    this.ctx.clearRect(
      this.prevCursorPositionX - 2,
      cursorY - this.prevFontSize + 3,
      4,
      this.prevFontSize
    );

    if (this.isCoursorVisible) {
      this.ctx.lineWidth = 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(
        this.currentPoints[0].x + textWidth + padding,
        this.currentPoints[0].y - currentFontSize * 0.7
      );
      this.ctx.lineTo(
        this.currentPoints[0].x + textWidth + padding,
        this.currentPoints[0].y + currentFontSize * 0.1
      );
      this.ctx.stroke();
    }

    this.animationFrameId = requestAnimationFrame(() => {
      setTimeout(() => this.coursorBlinking(), this.coursorTimeout);
    });
  }

  stopCursorBlinking(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  startWrite(points: { x: number; y: number }[]): void {
    this.currentPoints = points;
    this.textData = [];
    this.chartPlaceX = this.currentPoints[0].x;

    this.stopCursorBlinking();
    this.coursorBlinking();
    this.prevPoints = this.currentPoints;
  }

  writingText(e: KeyboardEvent): void {
    if (e.key === "Backspace") {
      this.textData = this.textData.slice(0, -1);
    } else if (e.key.length === 1) {
      this.textData = [
        ...this.textData,
        { char: e.key, fontSize: this.fontSize },
      ];
    }
    const cursorY =
      this.prevPoints.length > 0
        ? this.prevPoints[0].y
        : this.currentPoints[0].y;

    this.ctx.clearRect(
      this.prevCursorPositionX - 2,
      cursorY - this.prevFontSize + 3,
      4,
      this.prevFontSize
    );

    let textWidth = 0;

    const prevFontSize =
      this.textData.length > 2
        ? this.textData[this.textData.length - 2].fontSize
        : 24;

    this.ctx.clearRect(
      this.currentPoints[0].x,
      this.currentPoints[0].y - prevFontSize,
      this.textWidth,
      this.prevFontSize
    );

    this.textData.forEach(({ char, fontSize }) => {
      this.ctx.font = `${this.outline} ${fontSize}px Arial`;

      this.ctx.fillText(
        char,
        this.currentPoints[0].x + textWidth,
        this.currentPoints[0].y
      );

      textWidth += this.ctx.measureText(char).width;
    });

    this.textWidth = textWidth;
  }
}
