"use client";

import React, { useRef } from "react";
import { Drawing } from "../Drawing/Drawing";
import { ActionBar } from "../ActionBar/ActionBar";
import { Toolbar } from "../Toolbar/Toolbar";
import { Settings } from "../Settings/Settings";
import { DEFAULT_BG_COLOR } from "@/constants";
import { DrawingManager } from "@/utils/DrawingManager";

import "./Canvas.scss";

export const CanvasPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingManagerRef = useRef<DrawingManager | null>(null);

  return (
    <div className={`canvas-wrapper`} style={{ backgroundColor: DEFAULT_BG_COLOR }}>
      <ActionBar drawingManagerRef={drawingManagerRef} />
      <Toolbar/>
      <Settings/>
      <Drawing canvasRef={canvasRef}  drawingManagerRef={drawingManagerRef}/>
    </div>
  );
};