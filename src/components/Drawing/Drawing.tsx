"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setTool } from "@/store/slices/settingsSlice";
import { DrawingManager } from "@/utils/DrawingManager";
import { WebSocketClient } from "@/utils/websocket";
import { WS_URL } from "@/constants";
import { v4 as uuidv4 } from 'uuid';
import { useDrawingSync } from '@/hooks/useDrawingSync'
import { WsData, Point, ShapeConfig } from '@/types'

import "./Drawing.scss";

interface DrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingManagerRef: React.RefObject<DrawingManager | null>;
}

export const Drawing: React.FC<DrawingProps> = ({ canvasRef, drawingManagerRef}) => {
  const isDrawing = useRef(false);
  const color = useSelector((state: RootState) => state.settings.color);
  const lineWidth = useSelector((state: RootState) => state.settings.lineWidth);
  const eraserLineWidth = useSelector((state: RootState) => state.settings.eraserLineWidth);
  const opacity = useSelector((state: RootState) => state.settings.opacity);
  const tool = useSelector((state: RootState) => state.settings.tool);
  const fontSize = useSelector((state: RootState) => state.settings.fontSize);
  const outline = useSelector((state: RootState) => state.settings.outline);
  const shapeType = useSelector((state: RootState) => state.settings.shapeType);
  const wsRef = useRef<WebSocketClient>(new WebSocketClient(WS_URL));
  const userIdRef = useRef<string | null>(null)
  const usersNameElements = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerCanvasesRef = useRef<HTMLDivElement | null>(null);
  const userCanvases = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const usersDrawingManagers = useRef<Map<string, DrawingManager>>(new Map());
  const usersSettings = useRef<Map<string, WsData>>(new Map());
  const userName = useSelector((state: RootState) => state.auth.user?.username);
  const startPointRef = useRef<Point | null>(null);
  const endPointRef = useRef<Point | null>(null);
  const previewCtx = useRef<CanvasRenderingContext2D | null>(null)
  const previewCtxForImg = useRef<CanvasRenderingContext2D | null>(null)


  const dispatch = useDispatch()


  const sendWsData = useCallback((data: WsData): void => {
    if (userIdRef.current) {
      wsRef.current?.send(JSON.stringify({ ...data, userId: userIdRef.current, name: userName }));
    }
  }, [userName]);

  useDrawingSync({
    canvasRef,
    userIdRef,
    wsRef,
    userCanvases,
    usersDrawingManagers,
    usersSettings,
    containerCanvasesRef,
    usersNameElements,
    sendWsData,
  });
  

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const points = { x: e.clientX, y: e.clientY };
    startPointRef.current = points
    isDrawing.current = true;

    sendWsData({
      type: 'startDraw',
      tool,
      shapeType,
      color,
      opacity,
      lineWidth,
      eraserLineWidth,
      points: [points],
    })

  
    isDrawing.current = true;

    if (tool === 'eraser' || tool === 'pencil') {
      drawingManagerRef.current?.startDraw(points);
    }
    if (tool === 'writeText') {
      drawingManagerRef.current?.startWriteText(points)
    }
    if (tool === 'shape') {
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
        previewCtx: previewCtx.current as CanvasRenderingContext2D
      }

      drawingManagerRef.current?.setPreviewSettings(shape);
    }

    if (tool === 'pastImg') {
      const startedResizing = drawingManagerRef.current?.startResizeIfOnHandle(points);
      if (!startedResizing) {
        drawingManagerRef.current?.selectImgOnCanvas(points);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
  
    const point = { x: e.clientX, y: e.clientY };

    endPointRef.current = point

    sendWsData({
      type: 'inDrawProgress',
      points: [point],
    });

    if (tool === 'eraser' || tool === 'pencil') {
      drawingManagerRef.current?.draw(point);
    }
    if (tool === 'shape') {
      drawingManagerRef.current?.drawShapePreview(point);
    }

    if (tool === 'pastImg') {
      drawingManagerRef.current?.resizeSelectedImage(point);
    }
  };
  
  const handleMouseUp = () => {
    isDrawing.current = false;

    if (startPointRef.current && endPointRef.current) {
      sendWsData({ type: "end", tool, shapeType, points: [startPointRef.current, endPointRef.current], color, lineWidth, opacity});
    }

    if (tool === 'eraser' || tool === 'pencil') {
      drawingManagerRef.current?.stopDraw();
    }

    const shape: ShapeConfig = {
      shapeType: shapeType,
      startShapePoint: startPointRef.current || { x: 0, y: 0 },
      endShapePoint: endPointRef.current || {x: 0, y: 0},
      color: color,
      lineWidth: lineWidth,
      opacity: opacity,
      previewCtx: previewCtx.current as CanvasRenderingContext2D
    }

    if (tool === 'shape') {
      drawingManagerRef.current?.finalizeDrawShape(shape);

      if (previewCtx.current) {
        const previewCanvas = previewCtx.current?.canvas;
        if (previewCanvas) {
          containerCanvasesRef.current?.removeChild(previewCanvas);
        }
      }

      previewCtx.current = null;
    }

  if (tool === 'pastImg') {
    drawingManagerRef.current?.finalizeResize();
  }

    startPointRef.current = null;
    endPointRef.current = null;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const key = e.key;
    if (key.length > 1) return
    sendWsData({
      type: "writeText",
      tool: "writeText",
      key,
    })
    
    drawingManagerRef.current?.writeText(key);
  }

  const handlePaste = (e: ClipboardEvent) => {

    dispatch(setTool('pastImg'))

    const htmlData = e.clipboardData?.getData("text/html");
    if (htmlData) {
      const doc = new DOMParser().parseFromString(htmlData, "text/html");
      const img = doc.querySelector("img");
      const src = img?.src;

      if (src) {
        const previewCanvas = document.createElement("canvas");
        previewCanvas.width = window.innerWidth;
        previewCanvas.height = window.innerHeight;
        previewCanvas.classList.add("preview-canvas-for-image");
        previewCanvas.style.position = "absolute";
        previewCanvas.style.top = "0";
        previewCanvas.style.left = "0";
        previewCanvas.style.zIndex = "2";
        previewCanvas.style.pointerEvents = "none";
        containerCanvasesRef.current?.appendChild(previewCanvas);
        previewCtxForImg.current = previewCanvas.getContext("2d");

        drawingManagerRef.current?.setTool('pastImg')
        if (previewCtxForImg.current) {
          drawingManagerRef.current?.setPreviewCtx(previewCtxForImg.current);
        }
        drawingManagerRef.current?.drawImageOnCanvasTool(src, 150, 150, 100);
      }
    }
  };

  useEffect(() => {
    if (!userIdRef.current) {
      userIdRef.current = uuidv4();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawingManagerRef.current = new DrawingManager(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    if (!drawingManagerRef.current) return;

    sendWsData({
      type: "setTool",
      tool,
      lineWidth,
      eraserLineWidth,
      color,
      opacity,
    })
    drawingManagerRef.current.setTool(tool);
    drawingManagerRef.current.setBrushSettings(lineWidth, eraserLineWidth, color, opacity);
  }, [color, lineWidth, eraserLineWidth, opacity, tool]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    if (!drawingManagerRef.current) return;
    if (tool === 'writeText') {
      sendWsData({
        type: "setTextSettings",
        color,
        fontSize,
        outline,
      })
      drawingManagerRef.current?.setTextSettings(color, fontSize, outline)
    }
  }, [color, fontSize, outline, tool])


  useEffect(() => {  
    containerCanvasesRef.current?.focus();

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <div 
      className="canvases-container" 
      ref={containerCanvasesRef}
      tabIndex={0}
      >
      <canvas 
        ref={canvasRef} 
        className="drawing-canvas" 
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
      </canvas>
    </div>
    
  );
};
