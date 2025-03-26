import { convertColorToRgba } from "../ColorConvertations";

type TextDataByLine = Map<
  number,
  {
    char: string;
    fontSize: number;
    outline: string[];
    color: string;
    lineNumber: number;
  }[]
>;

export class TextTool {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private prevFontSize: number = 24;
  private fontSize: number = 24;
  private outline: Array<string> = ["Normal"];
  private prevPoints: { x: number; y: number }[] = [];
  private currentPoints: { x: number; y: number }[] = [];
  private isCoursorVisible: boolean = false;
  private animationFrameId: number | null = null;
  private blinkingTime: number = 0;
  private coursorTimeout: number = 500;
  private color: string = "";
  private prevCursorPositionX: number = 0;
  private lineNumber: number = 0;
  private textData: {
    char: string;
    fontSize: number;
    outline: string[];
    color: string;
    lineNumber: number;
  }[] = [];
  private textWidth: number = 0;
  private sumAllMaxFontSizeForClearReactByY: number = 0;
  public isTextActive: boolean = false;

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  setText(fontSize: number, outline: string[], color: string): void {
    this.ctx.strokeStyle = convertColorToRgba(color, String(1));
    this.color = convertColorToRgba(color, String(1));
    this.fontSize = fontSize;
    this.outline = outline;
    this.ctx.fillStyle = convertColorToRgba(color, String(1));
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

    const textDataByLine: TextDataByLine = this.getTextDataByLine();
    let prevLineNumber = 0;
    let positionY = 0;

    Array.from(textDataByLine).forEach((items) => {
      const maxFontSize = this.getMaxFontSizeByLine(items[1]);
      items[1].forEach(({ char, fontSize, outline, lineNumber }) => {
        const outlineStyle = outline.map((item) => item).join(" ");
        this.ctx.font = `${outlineStyle} ${fontSize}px Arial`;
        if (prevLineNumber < lineNumber) {
          textWidth = 0;
          prevLineNumber = lineNumber;
          positionY += maxFontSize;
        }
        textWidth += this.ctx.measureText(char).width;
      });
    });

    this.prevCursorPositionX = this.currentPoints[0].x + textWidth + padding;

    this.ctx.clearRect(
      this.prevCursorPositionX - 2,
      cursorY - this.prevFontSize + 3 + positionY,
      4,
      this.prevFontSize
    );

    if (this.isCoursorVisible) {
      this.ctx.lineWidth = 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(
        this.currentPoints[0].x + textWidth + padding,
        this.currentPoints[0].y - currentFontSize * 0.7 + positionY
      );
      this.ctx.lineTo(
        this.currentPoints[0].x + textWidth + padding,
        this.currentPoints[0].y + currentFontSize * 0.1 + positionY
      );
      this.ctx.stroke();
    }

    if (this.isTextActive) {
      this.animationFrameId = requestAnimationFrame(() => {
        setTimeout(() => this.coursorBlinking(), this.coursorTimeout);
      });
    }
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
    this.isTextActive = true;

    this.stopCursorBlinking();
    this.coursorBlinking();
    this.prevPoints = this.currentPoints;
  }

  getTextDataByLine(): TextDataByLine {
    const textDataByLine: TextDataByLine = new Map();

    for (let i = 0; i < this.textData.length; i++) {
      const key = this.textData[i].lineNumber;
      const value = textDataByLine.get(key) || [];
      textDataByLine.set(key, [...value, this.textData[i]]);
    }

    return textDataByLine;
  }

  getMaxFontSizeByLine(items: { fontSize: number }[]): number {
    const maxFontSizeInThis = items
      .map(({ fontSize }: { fontSize: number }) => fontSize)
      .sort((a, b) => b - a)[0];

    return maxFontSizeInThis;
  }

  writingText(e: KeyboardEvent): void {
    if (e.key === "Backspace") {
      this.textData = this.textData.slice(0, -1);
    } else if (e.key.length === 1) {
      let currentLineWidth = 0;
      let lastLetterWidth = 0;

      this.textData.forEach(
        ({ char, fontSize, outline, color, lineNumber }) => {
          if (lineNumber === this.lineNumber) {
            const outlineStyle = outline.map((item) => item).join(" ");
            this.ctx.fillStyle = color;
            this.ctx.font = `${outlineStyle} ${fontSize}px Arial`;

            currentLineWidth += this.ctx.measureText(char).width;
            lastLetterWidth = this.ctx.measureText(char).width;
          }
        }
      );

      if (
        this.currentPoints[0].x + currentLineWidth + lastLetterWidth >=
        this.canvas.width
      ) {
        this.lineNumber += 1;
      }

      this.textData = [
        ...this.textData,
        {
          char: e.key,
          fontSize: this.fontSize,
          outline: this.outline,
          color: this.color,
          lineNumber: this.lineNumber,
        },
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

    const textDataByLine: TextDataByLine = this.getTextDataByLine();

    let prevLineNumber = 0;
    let sumAllMaxFontSize = 0;

    const prevFontSize =
      this.textData.length > 2
        ? this.textData[this.textData.length - 2].fontSize
        : 24;

    this.ctx.clearRect(
      this.currentPoints[0].x,
      this.currentPoints[0].y - prevFontSize,
      this.textWidth,
      this.sumAllMaxFontSizeForClearReactByY === 0
        ? this.prevFontSize
        : this.sumAllMaxFontSizeForClearReactByY + this.prevFontSize
    );

    Array.from(textDataByLine).forEach((items) => {
      const maxFontSizeInThis = this.getMaxFontSizeByLine(items[1]);
      sumAllMaxFontSize += maxFontSizeInThis;
      this.sumAllMaxFontSizeForClearReactByY = sumAllMaxFontSize;
      textWidth = 0;
      items[1].forEach(({ char, fontSize, outline, color, lineNumber }) => {
        const outlineStyle = outline
          .map((outlineItem: string) => outlineItem)
          .join(" ");
        this.ctx.fillStyle = color;
        this.ctx.font = `${outlineStyle} ${fontSize}px Arial`;
        // if (prevLineNumber < lineNumber) {
        //   textWidth = 0;
        //   prevLineNumber = lineNumber;
        //   sumAllMaxFontSize += maxFontSizeInThis;
        //   this.sumAllMaxFontSizeForClearReactByY = sumAllMaxFontSize;
        // }

        this.ctx.fillText(
          char,
          this.currentPoints[0].x + textWidth,
          this.currentPoints[0].y + sumAllMaxFontSize
        );

        textWidth += this.ctx.measureText(char).width;
        this.textWidth = textWidth;
      });
    });
  }
}
