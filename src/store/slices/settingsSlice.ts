import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { convertColorToRgba } from "../../utils/ColorConvertations";
import { Tool } from "@/types";

interface SettingsState {
  color: string;
  lineWidth: number;
  eraserLineWidth: number;
  opacity: number;
  tool: Tool;
}

const initialState: SettingsState = {
  color: "#000000",
  lineWidth: 5,
  eraserLineWidth: 25,
  opacity: 1.0,
  tool: "pencil",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setColor: (state, action: PayloadAction<string>) => {
      state.color = convertColorToRgba(action.payload, String(state.opacity));
    },
    setLineWidth: (state, action: PayloadAction<number>) => {
      state.lineWidth = action.payload;
    },
    setEraserLineWidth: (state, action: PayloadAction<number>) => {
      state.eraserLineWidth = action.payload;
    },
    setOpacity: (state, action: PayloadAction<number>) => {
      state.opacity = action.payload;
      state.color = convertColorToRgba(state.color, String(action.payload));
    },
    setTool: (state, action: PayloadAction<Tool>) => {
      state.tool = action.payload;
    },
  },
});

export const {
  setColor,
  setLineWidth,
  setEraserLineWidth,
  setOpacity,
  setTool,
} = settingsSlice.actions;
export default settingsSlice.reducer;
