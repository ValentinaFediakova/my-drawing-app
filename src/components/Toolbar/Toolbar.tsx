"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import "./Toolbar.scss";
import { setTool } from "@/store/slices/settingsSlice";

const Toolbar: React.FC = ({ }) => {
  const tool = useSelector((state: RootState) => state.settings.tool);
  const dispatch = useDispatch();
  
  return (
    <div className="toolbar">
      <button 
        className={tool === "pencil" ? "toolbar-item toolbar-item_active" : "toolbar-item"} 
        onClick={() => dispatch(setTool("pencil"))}
      >
        <div className="toolbar-item__pen"></div>
      </button>
      <button 
        className={tool === "eraser" ? "toolbar-item toolbar-item_active" : "toolbar-item"} 
        onClick={() => dispatch(setTool("eraser"))}
      >
        <div className="toolbar-item__eraser"></div>
      </button>
    </div>
  );
};

export default Toolbar;
