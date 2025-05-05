import { useCallback, useEffect } from "react";
import { Point, ShapeConfig, ShapeType, Tool, WsData } from "@/types";
import { DrawingManager } from "@/utils/DrawingManager";
import { AppDispatch } from "@/store";

interface UseCanvasInteractionsParams {
  tool: Tool;
  shapeType: ShapeType;
  color: string;
  lineWidth: number;
  eraserLineWidth: number;
  opacity: number;
  // fontSize: number;
  // outline: string[];
  // canvasRef: React.RefObject<HTMLCanvasElement>;
  // containerRef: React.RefObject<HTMLDivElement>;
  previewCtx: React.MutableRefObject<CanvasRenderingContext2D | null>;
  // previewCtxForImg: React.MutableRefObject<CanvasRenderingContext2D | null>;
  drawingManagerRef: React.RefObject<DrawingManager | null>;
  sendWsData: (data: WsData) => void;
  // dispatch: AppDispatch;
  // setToolAction: (tool: string) => void;
  // userId: string | null;
  containerCanvasesRef: React.RefObject<HTMLDivElement>;
  isDrawing: React.MutableRefObject<boolean>;
  startPointRef: React.MutableRefObject<Point | null>;
}

export const useCanvasInteractions = ({
  tool,
  shapeType,
  color,
  lineWidth,
  eraserLineWidth,
  opacity,
  previewCtx,
  drawingManagerRef,
  sendWsData,
  containerCanvasesRef,
  isDrawing,
  startPointRef,
}: UseCanvasInteractionsParams) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const points = { x: e.clientX, y: e.clientY };
    startPointRef.current = points;
    isDrawing.current = true;

    if (tool === "pastImg") {
      const deleteData = drawingManagerRef.current?.deleteImgOnCanvas(points);
      if (deleteData) {
        sendWsData(deleteData);
        return;
      }

      const startedResizing =
        drawingManagerRef.current?.startResizeIfOnHandle(points);
      if (!startedResizing) {
        drawingManagerRef.current?.selectImgOnCanvas(points);
      }

      return;
    }

    sendWsData({
      type: "startDraw",
      tool,
      shapeType,
      color,
      opacity,
      lineWidth,
      eraserLineWidth,
      points: [points],
    });

    isDrawing.current = true;

    if (tool === "eraser" || tool === "pencil") {
      drawingManagerRef.current?.startDraw(points);
    }
    if (tool === "writeText") {
      console.log('tool === "writeText"');
      drawingManagerRef.current?.startWriteText(points);
    }
    if (tool === "shape") {
      const previewCanvas = document.createElement("canvas");
      previewCanvas.width = window.innerWidth;
      previewCanvas.height = window.innerHeight;
      previewCanvas.classList.add("preview-canvas");
      previewCanvas.style.position = "absolute";
      previewCanvas.style.top = "0";
      previewCanvas.style.left = "0";
      previewCanvas.style.zIndex = "2";
      previewCanvas.style.pointerEvents = "none";
      containerCanvasesRef.current?.appendChild(previewCanvas);
      previewCtx.current = previewCanvas.getContext("2d");

      if (!previewCtx.current) return;

      const shape: ShapeConfig = {
        shapeType: shapeType,
        startShapePoint: startPointRef.current || { x: 0, y: 0 },
        color: color,
        lineWidth: lineWidth,
        opacity: opacity,
        previewCtx: previewCtx.current as CanvasRenderingContext2D,
      };

      drawingManagerRef.current?.setPreviewSettings(shape);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const key = e.key;
    console.log("handleKeyDown");
    if (key.length > 1) return;
    sendWsData({
      type: "writeText",
      tool: "writeText",
      points: [{ x: 0, y: 0 }],
      key,
    });

    drawingManagerRef.current?.writeText(key);
  };

  return { handleMouseDown, handleKeyDown };
};
