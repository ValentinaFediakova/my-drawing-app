import { Point, ShapeConfig, ShapeType, Tool, WsData, MoveImg } from "@/types";
import { DrawingManager } from "@/utils/DrawingManager";

interface UseCanvasInteractionsParams {
  tool: Tool;
  shapeType: ShapeType;
  color: string;
  lineWidth: number;
  eraserLineWidth: number;
  opacity: number;
  previewCtx: React.MutableRefObject<CanvasRenderingContext2D | null>;
  drawingManagerRef: React.RefObject<DrawingManager | null>;
  sendWsData: (data: WsData) => void;
  containerCanvasesRef: React.RefObject<HTMLDivElement>;
  isDrawing: React.MutableRefObject<boolean>;
  startPointRef: React.MutableRefObject<Point | null>;
  endPointRef: React.MutableRefObject<Point | null>;
  broadcastImageUpdate: (data: MoveImg) => void;
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
  endPointRef,
  broadcastImageUpdate,
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;

    const point = { x: e.clientX, y: e.clientY };

    endPointRef.current = point;

    if (tool === "pastImg") {
      if (drawingManagerRef.current?.isImgDragging()) {
        const moveData = drawingManagerRef.current?.moveSelectedImage({
          x: e.movementX,
          y: e.movementY,
        });
        if (moveData) sendWsData(moveData);
      } else {
        const resizeData =
          drawingManagerRef.current?.resizeSelectedImage(point);
        if (resizeData) {
          sendWsData(resizeData);
          const movedImg = drawingManagerRef.current?.getSelectedImage?.();
          if (movedImg) {
            broadcastImageUpdate(movedImg);
          }
        }
      }
      return;
    }

    sendWsData({
      type: "inDrawProgress",
      points: [point],
    });

    if (tool === "eraser" || tool === "pencil") {
      drawingManagerRef.current?.draw(point);
    }
    if (tool === "shape") {
      drawingManagerRef.current?.drawShapePreview(point);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;

    if (tool === "pastImg") {
      drawingManagerRef.current?.finalizeImageInteraction();
      return;
    }

    if (startPointRef.current && endPointRef.current) {
      sendWsData({
        type: "end",
        tool,
        shapeType,
        points: [startPointRef.current, endPointRef.current],
        color,
        lineWidth,
        opacity,
      });
    }

    if (tool === "eraser" || tool === "pencil") {
      drawingManagerRef.current?.stopDraw();
    }

    const shape: ShapeConfig = {
      shapeType: shapeType,
      startShapePoint: startPointRef.current || { x: 0, y: 0 },
      endShapePoint: endPointRef.current || { x: 0, y: 0 },
      color: color,
      lineWidth: lineWidth,
      opacity: opacity,
      previewCtx: previewCtx.current as CanvasRenderingContext2D,
    };

    if (tool === "shape") {
      if (!startPointRef.current || !endPointRef.current) return;
      drawingManagerRef.current?.finalizeDrawShape(shape);

      if (previewCtx.current) {
        const previewCanvas = previewCtx.current?.canvas;
        if (previewCanvas) {
          containerCanvasesRef.current?.removeChild(previewCanvas);
        }
      }

      previewCtx.current = null;
    }

    startPointRef.current = null;
    endPointRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const key = e.key;
    console.log("handleKeyDown");
    if (key.length > 1) return;
    sendWsData({
      type: "writeText",
      tool: "writeText",
      key,
    });

    drawingManagerRef.current?.writeText(key);
  };

  return { handleMouseDown, handleKeyDown, handleMouseMove, handleMouseUp };
};
