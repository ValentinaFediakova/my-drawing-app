"use client";
import React from "react";

import { Drawing } from "../Drawing/Drawing";
import Toolbar from "../Toolbar/Toolbar";
import { Settings } from "../Settings/Settings";
import { DEFAULT_BG_COLOR } from "@/constants";
import "./Canvas.scss";

export const Canvas = () => {

  return (
    <div className={`canvas-wrapper`} style={{ backgroundColor: DEFAULT_BG_COLOR }}>
      <Toolbar/>
      <Settings/>
      <Drawing />
    </div>
  );
};