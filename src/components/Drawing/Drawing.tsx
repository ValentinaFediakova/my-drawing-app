"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { DrawingManager } from "@/utils/DrawingManager";
import { WebSocketClient } from "@/utils/websocket";
import { WS_URL } from "@/constants";
import { v4 as uuidv4 } from 'uuid';
import { useDrawingSync } from '@/hooks/useDrawingSync'
import { WsData } from '@/types'

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
  const wsRef = useRef<WebSocketClient>(new WebSocketClient(WS_URL));
  const userIdRef = useRef<string | null>(null)
  const usersNameElements = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerCanvasesRef = useRef<HTMLDivElement | null>(null);
  const userCanvases = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const usersDrawingManagers = useRef<Map<string, DrawingManager>>(new Map());
  const usersSettings = useRef<Map<string, WsData>>(new Map());
  const userName = useSelector((state: RootState) => state.authorization.name);

  const sendWsData = useCallback((data: WsData): void => {
    if (userIdRef.current) {
      wsRef.current?.send(JSON.stringify({ ...data, userId: userIdRef.current, name: userName }));
    }
  }, []);

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
    isDrawing.current = true;
    sendWsData({
      type: 'startDraw',
      tool,
      color,
      opacity,
      lineWidth,
      eraserLineWidth,
      points: [{ x: e.clientX, y: e.clientY }],
    })

    const points = { x: e.clientX, y: e.clientY };
    if (tool === 'eraser' || tool === 'pencil') {
      drawingManagerRef.current?.startDraw(points);
    }
    if (tool === 'writeText') {
      drawingManagerRef.current?.startWriteText(points)
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
  
    const point = { x: e.clientX, y: e.clientY };
  
    sendWsData({
      type: 'inDrawProgress',
      points: [point],
    });

    drawingManagerRef.current?.draw(point);
  };
  

  const handleMouseUp = () => {
    isDrawing.current = false;
    sendWsData({ type: "end" });
    drawingManagerRef.current?.stopDraw();
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const key = e.key;
    sendWsData({
      type: "writeText",
      tool: "writeText",
      key,
    })
    drawingManagerRef.current?.writeText(key);
  }

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

  return (
    <div className="canvases-container" ref={containerCanvasesRef}>
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
