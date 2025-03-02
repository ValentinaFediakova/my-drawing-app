"use client";

import { useEffect, useRef } from "react";
import { convertColorToRgba } from "@/utils";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

import "./Drawing.scss";

export const Drawing = ({}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const savedImageData = useRef<ImageData | null>(null);

  const color = useSelector((state: RootState) => state.settings.color);
  const lineWidth = useSelector((state: RootState) => state.settings.lineWidth);
  const opacity = useSelector((state: RootState) => state.settings.opacity);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startDraw = (e: MouseEvent) => {
      isDrawing.current = true;

      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = convertColorToRgba(color, String(opacity));
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);

      points.current = [{ x: e.clientX, y: e.clientY }];
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current) return;
    
      points.current.push({ x: e.clientX, y: e.clientY });

      if (savedImageData.current) {
        ctx.putImageData(savedImageData.current, 0, 0);
      }

      ctx.beginPath();
      ctx.moveTo(points.current[0].x, points.current[0].y);
    
      points.current.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    };

    const stopDraw = () => {
      isDrawing.current = false;

      points.current = [];

      if (ctx) {
        savedImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
    };

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);

    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDraw);
      canvas.removeEventListener("mouseleave", stopDraw);
    };
  }, [color, lineWidth, opacity]);

  return <canvas ref={canvasRef} className="drawing-canvas"></canvas>;
};
