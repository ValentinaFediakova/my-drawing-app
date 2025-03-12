export class TextTool {
  private ctx: CanvasRenderingContext2D;
  private prevFontSize: number = 24;
  private fontSize: number = 24;
  private outline: string = "normal";
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
  private textData: { char: string; fontSize: number }[] = [];
  private textWidth: number = 0;
  private chartPlaceX: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setText(fontSize: number, outline: string, color: string): void {
    const a = 0;
    this.color = color;
    this.fontSize = fontSize;
    this.outline = outline;
    this.ctx.fillStyle = color;
    this.ctx.font = `${outline} ${fontSize}px Arial`;
  }

  coursorBlinking(): void {
    const now = performance.now();

    if (now - this.blinkingTime >= this.coursorTimeout) {
      this.blinkingTime = now;
      this.isCoursorVisible = !this.isCoursorVisible;
    }

    const prevFontSize =
      this.textData.length > 1
        ? this.textData[this.textData.length - 2].fontSize
        : 24;

    const cursorY =
      this.prevPoints.length > 0
        ? this.prevPoints[0].y
        : this.currentPoints[0].y;

    this.ctx.clearRect(
      this.prevCursorPositionX ?? this.currentPoints[0].x,
      cursorY,
      4,
      prevFontSize
    );

    let textWidth = 0;

    if (this.isCoursorVisible) {
      this.textData.forEach(({ char, fontSize }) => {
        this.ctx.font = `${this.outline} ${fontSize}px Arial`;
        textWidth += this.ctx.measureText(char).width;
      });

      const currentFontSize =
        this.textData.length > 0
          ? this.textData[this.textData.length - 1].fontSize
          : 24;

      this.ctx.font = `${this.outline} ${currentFontSize}px Arial`;
      this.ctx.lineWidth = 1;
      this.ctx.fillText(
        "|",
        this.currentPoints[0].x + textWidth,
        this.currentPoints[0].y
      );
    }

    this.prevCursorPositionX = this.currentPoints[0].x + textWidth;
    this.textWidth = textWidth;

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
    this.currentText = "";
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

    this.ctx.clearRect(
      this.prevCursorPositionX + 1,
      this.prevPoints[0].y - this.fontSize + 5,
      4,
      this.fontSize
    );

    this.currentText = this.textData.map(({ char }) => char).join("");

    let textWidth = 0;

    this.textData.forEach(({ char, fontSize }) => {
      this.ctx.font = `${this.outline} ${fontSize}px Arial`;

      this.ctx.fillText(
        char,
        this.currentPoints[0].x + textWidth,
        this.currentPoints[0].y
      );

      textWidth += this.ctx.measureText(char).width;
    });

    // this.ctx.fillText(
    //   this.currentText,
    //   this.currentPoints[0].x + padding,
    //   this.currentPoints[0].y
    // );
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
