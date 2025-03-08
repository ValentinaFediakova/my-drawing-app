import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { convertColorToRgba } from "../../utils/ColorConvertations";

interface SettingsState {
  color: string;
  lineWidth: number;
  opacity: number;
}

const initialState: SettingsState = {
  color: "#000000",
  lineWidth: 5,
  opacity: 1.0,
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
    setOpacity: (state, action: PayloadAction<number>) => {
      state.opacity = action.payload;
      state.color = convertColorToRgba(state.color, String(action.payload));
    },
  },
});

export const { setColor, setLineWidth, setOpacity } = settingsSlice.actions;
export default settingsSlice.reducer;
