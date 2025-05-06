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
import { WsData, Point } from '@/types'

import "./Drawing.scss";
import { useCanvasInteractions } from "@/hooks/useCanvasInteractions";

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
  const containerCanvasesRef = useRef<HTMLDivElement>(null!);
  const userCanvases = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const usersDrawingManagers = useRef<Map<string, DrawingManager>>(new Map());
  const usersSettings = useRef<Map<string, WsData>>(new Map());
  const userName = useSelector((state: RootState) => state.auth.user?.username);
  const startPointRef = useRef<Point | null>(null);
  const endPointRef = useRef<Point | null>(null);
  const previewCtx = useRef<CanvasRenderingContext2D | null>(null)
  const previewCtxForImg = useRef<CanvasRenderingContext2D | null>(null)

  const dispatch = useDispatch()

  const broadcastImageUpdate = (img: {
    id: string;
    image: HTMLImageElement;
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
  }) => {
    sendWsData({
      type: "addOrUpdateImage",
      id: img.id,
      src: img.image.src,
      points: [{ x: img.x, y: img.y }],
      width: img.width,
      height: img.height,
      opacity: img.opacity,
    });
  };

  const sendWsData = useCallback((data: WsData): void => {
    if (userIdRef.current) {
      const payload = { ...data, userId: userIdRef.current, name: userName };
      wsRef.current?.send(JSON.stringify(payload));
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

  const {
    handleMouseDown, handleMouseMove, handleMouseUp, handleKeyDown
  } = useCanvasInteractions({
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
    broadcastImageUpdate
  });


  const handlePaste = (e: ClipboardEvent) => {

    dispatch(setTool('pastImg'))

    const htmlData = e.clipboardData?.getData("text/html");
    if (htmlData) {
      const doc = new DOMParser().parseFromString(htmlData, "text/html");
      const img = doc.querySelector("img");
      const src = img?.src;

      if (src) {
        if (!previewCtxForImg.current) {
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
        }
        
        const wsData = drawingManagerRef.current?.drawImageOnCanvasTool(src, {x: 150, y: 150}, 100, opacity);
        if (wsData) {
          sendWsData(wsData);
        }
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

    if (tool === 'pastImg') {
      const selectedImg = drawingManagerRef.current.getSelectedImage?.();

      drawingManagerRef.current?.setImageOpacity(opacity);
      if (selectedImg) {
        broadcastImageUpdate(selectedImg);
      }
    }
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
