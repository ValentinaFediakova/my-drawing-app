"use client";

import { useState } from "react";
import Drawing from "../Drawing/Drawing";
import Toolbar from "../Toolbar/Toolbar";
import { Settings } from "../Settings/Settings";
import "./Canvas.scss";
import React from "react";

const Canvas = () => {
  const [color, setColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(5);
  const [opacity, setOpacity] = useState(1)

  console.log('@@@@@@@@@@ opacity CANVAS', opacity)

  return (
    <div className="canvas-wrapper">
      <Toolbar/>
      <Settings onSetColor={setColor} onSetLineWidth={setLineWidth} onSetOpacity={setOpacity} />
      <Drawing color={color} lineWidth={lineWidth} opacity={opacity} />
    </div>
  );
};

export default Canvas;
