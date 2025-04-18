"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import "./Toolbar.scss";
import { setTool } from "@/store/slices/settingsSlice";

export const Toolbar: React.FC = ({ }) => {
  const tool = useSelector((state: RootState) => state.settings.tool);
  const dispatch = useDispatch();
  
  return (
    <div className="toolbar">
      <button 
        className={tool === "pencil" ? "toolbar-item toolbar-item_active" : "toolbar-item"} 
        onClick={() => dispatch(setTool("pencil"))}
      >
        <div className="toolbar-item__img toolbar-item__img_pencil"></div>
      </button>
      <button 
        className={tool === "eraser" ? "toolbar-item toolbar-item_active" : "toolbar-item"} 
        onClick={() => dispatch(setTool("eraser"))}
      >
        <div className="toolbar-item__img toolbar-item__img_eraser"></div>
      </button>
      <button 
        className={tool === "writeText" ? "toolbar-item toolbar-item_active" : "toolbar-item"} 
        onClick={() => dispatch(setTool("writeText"))}
      >
        <div className="toolbar-item__img toolbar-item__img_writeText"></div>
      </button>
      <button 
        className={tool === "shape" ? "toolbar-item toolbar-item_active" : "toolbar-item"} 
        onClick={() => dispatch(setTool("shape"))}
      >
        <div className="toolbar-item__img toolbar-item__img_shape"></div>
      </button>
    </div>
  );
};