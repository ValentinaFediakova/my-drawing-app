"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { DrawingManager } from "@/utils/DrawingManager";


import "./Drawing.scss";
import { setOpacity } from "@/store/slices/settingsSlice";

interface DrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingManagerRef: React.RefObject<DrawingManager | null>;
}


export const Drawing: React.FC<DrawingProps> = ({ canvasRef, drawingManagerRef}) => {

  const dispatch = useDispatch();
  const color = useSelector((state: RootState) => state.settings.color);
  const lineWidth = useSelector((state: RootState) => state.settings.lineWidth);
  const eraserLineWidth = useSelector((state: RootState) => state.settings.eraserLineWidth);
  const opacity = useSelector((state: RootState) => state.settings.opacity);
  const tool = useSelector((state: RootState) => state.settings.tool);
  const fontSize = useSelector((state: RootState) => state.settings.fontSize);
  const outline = useSelector((state: RootState) => state.settings.outline);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
  }, [color, lineWidth, eraserLineWidth, opacity, tool]);

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
