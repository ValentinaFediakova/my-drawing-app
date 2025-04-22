import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { convertColorToRgba } from "../../utils/ColorConvertations";
import { Tool, ShapeType } from "@/types";
import { PALETTE_COLORS, SHAPES } from "@/constants";

interface SettingsState {
  color: string;
  lineWidth: number;
  eraserLineWidth: number;
  opacity: number;
  tool: Tool;
  fontSize: number;
  outline: string[];
  shapeType: ShapeType;
}

const initialState: SettingsState = {
  color: PALETTE_COLORS.BLACK,
  lineWidth: 5,
  eraserLineWidth: 25,
  opacity: 1.0,
  tool: "pencil",
  fontSize: 24,
  outline: [],
  shapeType: SHAPES.RECTANGLE as ShapeType,
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
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },
    setOutline: (state, action: PayloadAction<string>) => {
      const newStateoutline = state.outline.includes(action.payload)
        ? state.outline.filter((item) => item !== action.payload)
        : [...state.outline, action.payload];
      state.outline = newStateoutline;
    },
    setShape: (state, action: PayloadAction<string>) => {
      state.shapeType = action.payload as ShapeType;
    },
  },
});

export const {
  setColor,
  setLineWidth,
  setEraserLineWidth,
  setOpacity,
  setTool,
  setFontSize,
  setOutline,
  setShape,
} = settingsSlice.actions;
export default settingsSlice.reducer;
