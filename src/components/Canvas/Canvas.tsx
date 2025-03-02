"use client";
import React from "react";

import { Drawing } from "../Drawing/Drawing";
import Toolbar from "../Toolbar/Toolbar";
import { Settings } from "../Settings/Settings";
import "./Canvas.scss";

export const Canvas = () => {

  return (
    <div className="canvas-wrapper">
      <Toolbar/>
      <Settings/>
      <Drawing />
    </div>
  );
};