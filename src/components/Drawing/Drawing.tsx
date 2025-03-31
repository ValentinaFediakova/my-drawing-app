"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { DrawingManager } from "@/utils/DrawingManager";
import { WebSocketClient } from "@/utils/websocket";
import { WS_URL } from "@/constants";

import "./Drawing.scss";

interface DrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingManagerRef: React.RefObject<DrawingManager | null>;
}

interface WsData {
  type: string;
  tool: string;
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

export const Drawing: React.FC<DrawingProps> = ({ canvasRef, drawingManagerRef}) => {
  const color = useSelector((state: RootState) => state.settings.color);
  const lineWidth = useSelector((state: RootState) => state.settings.lineWidth);
  const eraserLineWidth = useSelector((state: RootState) => state.settings.eraserLineWidth);
  const opacity = useSelector((state: RootState) => state.settings.opacity);
  const tool = useSelector((state: RootState) => state.settings.tool);
  const fontSize = useSelector((state: RootState) => state.settings.fontSize);
  const outline = useSelector((state: RootState) => state.settings.outline);
  const ws = new WebSocketClient(WS_URL);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    sendWsData({
      type: "start",
      tool: tool,
      color: color,
      size: lineWidth,
      points: [{ x: e.clientX, y: e.clientY }]
    })


    const points = { x: e.clientX, y: e.clientY };
    if (tool === 'eraser' || tool === 'pencil') {
      drawingManagerRef.current?.startDraw(points);
    }
    if (tool === 'writeText') {
      drawingManagerRef.current?.startWriteText(points)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawingManagerRef.current?.draw(e.nativeEvent as MouseEvent);
  }

  const handleMouseUp = () => {
    drawingManagerRef.current?.stopDraw();
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    drawingManagerRef.current?.writeText(e.nativeEvent as KeyboardEvent);
  }

  const sendWsData = (data: WsData): void => {
    ws.send(JSON.stringify(data));
  };

  useEffect(() => {
    ws.connect((data) => {
      console.log("📨 Received:", data);
      if (data.type === 'start') {
        const { tool, points } = data;
        if (tool === 'eraser' || tool === 'pencil') {
          drawingManagerRef.current?.startDraw(points[0]);
        }
        if (tool === 'writeText') {
          drawingManagerRef.current?.startWriteText(points[0])
        }
      }
    });

    return () => {
      ws.close();
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
