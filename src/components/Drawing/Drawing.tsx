"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { DrawingManager } from "@/utils/DrawingManager";
import { WebSocketClient } from "@/utils/websocket";
import { PALETTE_COLORS, WS_URL } from "@/constants";

import "./Drawing.scss";
import { Tool } from "@/types";

interface DrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingManagerRef: React.RefObject<DrawingManager | null>;
}

interface WsData {
  type: 'start' | 'inDrawProgress' | 'end';
  tool?: string;
  color?: string;
  opacity?: number;
  size?: number;
  points?: { x: number; y: number }[];
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

  const sendWsData = useCallback((data: WsData): void => {
    wsRef.current?.send(JSON.stringify(data));
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    sendWsData({
      type: "start",
      tool,
      color,
      opacity,
      size: tool === "eraser" ? eraserLineWidth : lineWidth,
      points: [{ x: e.clientX, y: e.clientY }]
    })

console.log('handleMouseDown lineWidth >>>>>>>>>>>>>>>>>>', lineWidth);
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
      type: "inDrawProgress",
      points: [point]
    });

    drawingManagerRef.current?.draw(point);
  };
  

  const handleMouseUp = () => {
    isDrawing.current = false;
    sendWsData({ type: "end" });
    drawingManagerRef.current?.stopDraw();
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    drawingManagerRef.current?.writeText(e.nativeEvent as KeyboardEvent);
  }


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    wsRef.current?.connect((data: WsData) => {

      const { tool, size, color, opacity, type, points } = data;

      if (tool) {
        if (drawingManagerRef.current) {
          drawingManagerRef.current.setTool(tool as Tool);
          drawingManagerRef.current.setBrushSettings(size ?? 5, size ?? 25, color ?? PALETTE_COLORS.BLACK, opacity ?? 1);
        }
      }

      if (type === 'start') {
        if (tool === 'eraser' || tool === 'pencil') {
          if (points && points[0]) {
            drawingManagerRef.current?.startDraw(points[0]);
          }
        }
        if (tool === 'writeText') {
          if (points && points[0]) {
            drawingManagerRef.current?.startWriteText(points[0]);
          }
        }
      }

      if (type === 'inDrawProgress') {
        if (drawingManagerRef.current && points && points[0]) {
          drawingManagerRef.current.draw(points[0]);
        }
      }
      
    });

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


    drawingManagerRef.current.setTool(tool);
    drawingManagerRef.current.setBrushSettings(lineWidth, eraserLineWidth, color, opacity);
  }, [color, lineWidth, eraserLineWidth, opacity, tool, fontSize]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    if (!drawingManagerRef.current) return;
    if (tool === 'writeText') {
      drawingManagerRef.current?.setTextSettings(color, fontSize, outline)
    }
  }, [color, fontSize, outline, tool])

  return (
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
  );
};
