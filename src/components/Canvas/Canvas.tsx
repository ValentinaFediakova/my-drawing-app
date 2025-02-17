"use client";

import { useState } from "react";
import Drawing from "../Drawing/Drawing";
import Toolbar from "../Toolbar/Toolbar";
import "./Canvas.scss";
import React from "react";

const Canvas = () => {
  const [color, setColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(5);

  return (
    <div className="canvas-wrapper">
      <Toolbar setColor={setColor} setLineWidth={setLineWidth} />
      <Drawing color={color} lineWidth={lineWidth} />
    </div>
  );
};

export default Canvas;
