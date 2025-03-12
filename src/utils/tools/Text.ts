export class TextTool {
  private ctx: CanvasRenderingContext2D;
  private fontSize: number = 24;
  private widthStartArea: number = 20;
  private prevPoints: { x: number; y: number }[] = [];
  private currentPoints: { x: number; y: number }[] = [];
  private isCoursorVisible: boolean = false;
  private animationFrameId: number | null = null;
  private blinkingTime: number = 0;
  private coursorTimeout: number = 500;
  private currentText: string = "";
  private color: string = "";
  private prevCursorPositionX: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setText(fontSize: number, outline: string, color: string): void {
    this.ctx.fillStyle = color;
    this.color = color;
    this.fontSize = fontSize;
    this.ctx.font = `${outline} ${fontSize}px Arial`;
  }

  coursorBlinking(): void {
    const now = performance.now();

    if (now - this.blinkingTime >= this.coursorTimeout) {
      this.blinkingTime = now;
      this.isCoursorVisible = !this.isCoursorVisible;
    }

    this.ctx.clearRect(
      this.currentPoints[0].x +
        this.ctx.measureText(this.currentText).width +
        8,
      this.currentPoints[0].y - this.fontSize + 5,
      4,
      this.fontSize
    );

    if (this.isCoursorVisible) {
      this.ctx.fillText(
        "|",
        this.currentPoints[0].x +
          this.ctx.measureText(this.currentText).width +
          7,
        this.currentPoints[0].y - 2
      );

      this.prevCursorPositionX =
        this.currentPoints[0].x +
        this.ctx.measureText(this.currentText).width +
        7;
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
    // if already use this method and jump to other place
    const isAlreadyUseThisMethod =
      this.prevPoints.length == 1 && this.currentText === "";

    this.currentText = "";
    this.currentPoints = points;

    this.stopCursorBlinking();
    this.coursorBlinking();
    this.prevPoints = this.currentPoints;
  }

  writingText(e: KeyboardEvent): void {
    if (e.key === "Backspace") {
      this.currentText = this.currentText.slice(0, -1);
    } else if (e.key.length === 1) {
      this.currentText = `${this.currentText}${e.key}`;
    }

    this.ctx.clearRect(
      this.prevCursorPositionX + 1,
      this.prevPoints[0].y - this.fontSize + 5,
      4,
      this.fontSize
    );

    const padding = this.fontSize * 0.3;
    this.ctx.fillText(
      this.currentText,
      this.currentPoints[0].x + padding,
      this.currentPoints[0].y
    );
  }
}

// + сделать палочку мигающую
// + если опять пользуюсь startWrite то прошлый прямоугольник и палочка убирается
// + по набору по клавиатуре - вставляется текс
// + если пользуюсь writingText то палочка мигает

// сделать стирание - бэкспейс
// убирать рамку, когда новый startWrite
// чтобы не выходило за края канваса
// * если получится, то сделать энтер
// * вставка текста
