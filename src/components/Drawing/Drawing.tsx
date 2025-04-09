"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { DrawingManager } from "@/utils/DrawingManager";
import { WebSocketClient } from "@/utils/websocket";
import { PALETTE_COLORS, WS_URL } from "@/constants";
import { v4 as uuidv4 } from 'uuid';

import "./Drawing.scss";
import { Tool } from "@/types";

interface DrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingManagerRef: React.RefObject<DrawingManager | null>;
}

interface WsData {
  type?: string;
  tool?: Tool;
  color?: string;
  fontSize?: number;
  outline?: string[];
  opacity?: number;
  lineWidth?: number;
  eraserLineWidth?: number;
  points?: { x: number; y: number }[];
  key?: string;
  userId?: string;
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
  const containerCanvasesRef = useRef<HTMLDivElement>(null);
  const userCanvases = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const usersDrawingManagers = useRef<Map<string, DrawingManager>>(new Map());
  const usersSettings = useRef<Map<string, WsData>>(new Map());


  if (!userIdRef.current) {
    userIdRef.current = uuidv4()
  }

  const sendWsData = useCallback((data: WsData): void => {
    if (userIdRef.current) {
      console.log("📤 sending:", { ...data, userId: userIdRef.current });
      wsRef.current?.send(JSON.stringify({ ...data, userId: userIdRef.current }));
    }
  }, []);
  

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

  const ensureUserInitialized = (userId: string) => {
    if (!userCanvases.current.has(userId) && containerCanvasesRef.current) {
      const newCanvas = document.createElement("canvas");
      newCanvas.width = window.innerWidth;
      newCanvas.height = window.innerHeight;
      newCanvas.style.position = "absolute";
      newCanvas.style.left = "0";
      newCanvas.style.top = "0";
      newCanvas.style.pointerEvents = "none";
      newCanvas.style.zIndex = "1";
  
      containerCanvasesRef.current.appendChild(newCanvas);
      userCanvases.current.set(userId, newCanvas);
  
      const manager = new DrawingManager(newCanvas);
      usersDrawingManagers.current.set(userId, manager);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    wsRef.current?.connect((data: WsData) => {
      const { tool='pencil', lineWidth=5, eraserLineWidth=25, color=PALETTE_COLORS.BLACK, fontSize=24, outline=["Normal"], opacity=1, type, points, key, userId } = data;
      console.log("📥 received WS message:", data);
      if (!userId || userId === userIdRef.current) return;
      ensureUserInitialized(userId);

      if (type === "requestCurrentSettings") {
        console.log('userId !== userIdRef.current', userId, userIdRef.current)
        if (userId !== userIdRef.current) {
          sendWsData({
            type: "setTool",
            tool,
            lineWidth,
            eraserLineWidth,
            color,
            opacity,
          });
      
          if (tool === "writeText") {
            sendWsData({
              type: "setTextSettings",
              color,
              fontSize,
              outline,
            });
          }
        }
        return;
      }
      
      if (type === 'setTool' && userId) {
        usersSettings.current.set(userId, { tool, color, lineWidth, eraserLineWidth, opacity });

      }

      if (type === 'setTextSettings' && userId) {
        const prev = usersSettings.current.get(userId) || {};
        usersSettings.current.set(userId, { ...prev, color, fontSize, outline });
      }

      if (type === 'startDraw' && userId && userId !== userIdRef.current) {
        const currentSettings = usersSettings.current.get(userId) || {};

        usersSettings.current.set(userId, {
          ...currentSettings,
          tool,
          color,
          opacity,
          lineWidth,
          eraserLineWidth,
          fontSize,
          outline,
        });
        

        const manager = usersDrawingManagers.current.get(userId);
        if (!manager || !points || !points[0]) return;

        const settings = usersSettings.current.get(userId);
        if (settings) {
          manager.setTool(settings.tool || 'pencil');
          manager.setBrushSettings(
            settings.lineWidth ?? 5,
            settings.eraserLineWidth ?? 25,
            settings.color ?? PALETTE_COLORS.BLACK,
            settings.opacity ?? 1
          );
        }

        if (tool === 'eraser' || tool === 'pencil') {
          manager.startDraw(points[0]);
        }

        if (tool === 'writeText') {
          manager.startWriteText(points[0]);
        }
      }

      if (type === 'inDrawProgress' && userId !== userIdRef.current) {
        const manager = userId ? usersDrawingManagers.current.get(userId) : undefined;
        if (!manager || !points || !points[0]) return;

        const settings = usersSettings.current.get(userId ?? "");
        if (settings) {
          manager.setTool(settings.tool || 'pencil');
          manager.setBrushSettings(
            settings.lineWidth ?? 5,
            settings.eraserLineWidth ?? 25,
            settings.color ?? PALETTE_COLORS.BLACK,
            settings.opacity ?? 1
          );
        }

        manager.draw(points[0]);
      }

      if (type === 'writeText' && userId !== userIdRef.current) {
        const manager = usersDrawingManagers.current.get(userId ?? "");
        if (!manager || !key) return;
      
        const settings = usersSettings.current.get(userId ?? "");
        if (settings) {
          manager.setTextSettings(
            settings.color ?? PALETTE_COLORS.BLACK,
            settings.fontSize ?? 24,
            settings.outline ?? ["Normal"]
          );
        }
      
        manager.writeText(key);
      }
      
    },
    () => {
      console.log("✅ WS ready → отправляю requestCurrentSettings");
      sendWsData({ type: "requestCurrentSettings" });
    }
  );

    console.log("👋 sending requestCurrentSettings");
    sendWsData({ type: "requestCurrentSettings" });

    return () => {
      wsRef.current?.close();
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
