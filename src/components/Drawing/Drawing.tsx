"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { DrawingManager } from "@/utils/DrawingManager";



import "./Drawing.scss";

export const Drawing = ({}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingManagerRef = useRef<DrawingManager | null>(null);

  const color = useSelector((state: RootState) => state.settings.color);
  const lineWidth = useSelector((state: RootState) => state.settings.lineWidth);
  const opacity = useSelector((state: RootState) => state.settings.opacity);

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
    
    drawingManagerRef.current.setBrushSettings(lineWidth, color, opacity);
  }, [color, lineWidth, opacity]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const points = { x: e.clientX, y: e.clientY };
    drawingManagerRef.current?.startDraw(points);
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawingManagerRef.current?.draw(e.nativeEvent as MouseEvent);
  }

  const handleMouseUp = () => {
    drawingManagerRef.current?.stopDraw();
  }

  return (
    <canvas 
    ref={canvasRef} 
    className="drawing-canvas" 
    onMouseDown={handleMouseDown} 
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}>
    </canvas>
  );
};
