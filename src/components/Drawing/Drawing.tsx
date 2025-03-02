"use client";

import { useEffect, useRef, useState } from "react";
import "./Drawing.scss";

interface DrawingProps {
  color: string;
  lineWidth: number;
  opacity: number;
}

type contextColor = string

const Drawing = ({ color, lineWidth, opacity }: DrawingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const savedImageData = useRef<ImageData | null>(null);

  const convertColorToRgba = (color: string) => {
    if (color.startsWith("rgba")) {
      return color.replace(/, [0-9.]+\)$/, `, ${opacity})`);
    }

    // create temporary div
    const temp = document.createElement("div");
    temp.style.color = color;
    document.body.appendChild(temp);

    const rgbaColor = getComputedStyle(temp).color;  // get color in rgb(...)
    document.body.removeChild(temp);

    // convert rgb to rgba with opacity
    const finalColor = rgbaColor.replace("rgb(", "rgba(").replace(")", `, ${opacity})`);

    console.log('finalColor', finalColor)
    
    return finalColor;
  }


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
      ctx.strokeStyle = convertColorToRgba(ctx.strokeStyle as contextColor);
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

export default Drawing;
