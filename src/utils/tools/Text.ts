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
  private prevCursorPositionX: number = 0;
  private color: string = "";
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
  private isTyping: boolean = false;

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  setText(fontSize: number, outline: string[], color: string): void {
    const finalColor = convertColorToRgba(color, "1");

    this.ctx.strokeStyle = finalColor;
    this.color = finalColor;
    this.fontSize = fontSize;
    this.outline = outline;
    this.ctx.fillStyle = finalColor;
    this.ctx.font = `${outline[0]} ${fontSize}px Arial`;
  }

  setTypingMode(isTyping: boolean) {
    this.isTyping = isTyping;
  }

  coursorBlinking(): void {
    // Toggle cursor visibility if needed
    const currentTime = performance.now();
    if (currentTime - this.blinkingTime >= this.coursorTimeout) {
      this.blinkingTime = currentTime;
      this.isCoursorVisible = !this.isCoursorVisible;
    }

    // Calculate total vertical offset for all lines
    const totalOffsetY = this.calcOffsetYUpToLine(this.lineNumber);

    // Determine base Y position for text
    const baseY =
      this.prevPoints.length > 0
        ? this.prevPoints[0].y
        : this.currentPoints[0].y;

    // Y position to clear previous cursor
    const clearY = baseY - this.prevFontSize + 5 + totalOffsetY;

    // Get current font size or default
    const currentFontSize =
      this.textData.length > 0
        ? this.textData[this.textData.length - 1].fontSize
        : this.fontSize;

    // Update previous font size if available
    this.prevFontSize =
      this.textData.length > 1
        ? this.textData[this.textData.length - 2].fontSize
        : this.fontSize;

    // Calculate total text width
    let lineWidth = 0;
    let prevLineNumber = 0;
    const lineMap = this.getTextDataByLine();

    for (const [, chars] of lineMap) {
      for (const { char, fontSize, outline, lineNumber } of chars) {
        if (prevLineNumber < lineNumber) {
          lineWidth = 0;
          prevLineNumber = lineNumber;
        }
        this.ctx.font = `${outline.join(" ")} ${fontSize}px Arial`;
        lineWidth += this.ctx.measureText(char).width;
      }
    }

    // Store cursor X position
    this.prevCursorPositionX = this.currentPoints[0].x + lineWidth + 5;

    // Clear previous cursor area
    this.ctx.clearRect(
      this.prevCursorPositionX - 2,
      clearY,
      4,
      this.prevFontSize + 2
    );

    // Draw new cursor if visible
    if (this.isCoursorVisible && this.isTyping) {
      const cursorX = this.currentPoints[0].x + lineWidth + 5;
      const cursorYtop = baseY - currentFontSize * 0.7 + totalOffsetY;
      const cursorYbot = baseY + currentFontSize * 0.1 + totalOffsetY;

      this.ctx.lineWidth = 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(cursorX, cursorYtop);
      this.ctx.lineTo(cursorX, cursorYbot);
      this.ctx.stroke();
    }

    // Schedule next frame
    if (this.isTextActive) {
      this.animationFrameId = requestAnimationFrame(() => {
        setTimeout(() => this.coursorBlinking(), this.coursorTimeout);
      });
    }
  }

  calcOffsetYUpToLine(lineNum: number): number {
    let offset = 0;
    const textDataByLine = this.getTextDataByLine();

    for (let i = 0; i < lineNum; i++) {
      const itemsInLine = textDataByLine.get(i);
      if (!itemsInLine) continue;
      const maxFontSize = this.getMaxFontSizeByLine(itemsInLine);
      offset += maxFontSize;
    }

    return offset;
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

  getMaxFontSizeByLine(items: { fontSize: number }[]): number {
    return Math.max(...items.map((i) => i.fontSize));
  }

  renderTextData(): void {
    let textWidth = 0;
    let prevLineNumber = 0;
    let sumAllMaxFontSize = 0;
    let maximumOfWidthLine = 0;

    const textDataByLine: TextDataByLine = this.getTextDataByLine();

    const cursorY =
      this.prevPoints.length > 0
        ? this.prevPoints[0].y
        : this.currentPoints[0].y;

    const sumAllMaxFontSizeForCursor =
      this.sumAllMaxFontSizeForClearReactByY === 0
        ? this.fontSize
        : this.sumAllMaxFontSizeForClearReactByY;

    this.ctx.clearRect(
      this.prevCursorPositionX - 2,
      cursorY - this.prevFontSize + sumAllMaxFontSizeForCursor - this.fontSize,
      4,
      this.fontSize + 5
    );

    for (const [lineNumber, chars] of textDataByLine) {
      const maxFontSizeInThis = this.getMaxFontSizeByLine(chars);
      textWidth = 0;

      for (const { char, fontSize, outline, color } of chars) {
        const outlineStyle = outline
          .map((outlineItem: string) => outlineItem)
          .join(" ");
        this.ctx.fillStyle = color;
        this.ctx.font = `${outlineStyle} ${fontSize}px Arial`;

        if (prevLineNumber === 0 && lineNumber === 0) {
          maximumOfWidthLine += this.ctx.measureText(char).width;
          this.textWidth = maximumOfWidthLine;
        }

        this.ctx.fillText(
          char,
          this.currentPoints[0].x + textWidth,
          this.currentPoints[0].y + sumAllMaxFontSize
        );

        textWidth += this.ctx.measureText(char).width;
      }

      textWidth = 0;
      prevLineNumber = lineNumber;
      sumAllMaxFontSize += maxFontSizeInThis;
      this.sumAllMaxFontSizeForClearReactByY = sumAllMaxFontSize;
    }
  }

  writingText(key: string): void {
    if (key === "Backspace") {
      this.textData = this.textData.slice(0, -1);
    } else if (key.length === 1) {
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
          char: key,
          fontSize: this.fontSize,
          outline: this.outline,
          color: this.color,
          lineNumber: this.lineNumber,
        },
      ];
    }

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

    this.renderTextData();
  }

  getWidthAndHeightOfText(): { width: number; height: number } {
    return {
      width: this.textWidth,
      height: this.sumAllMaxFontSizeForClearReactByY,
    };
  }
}
