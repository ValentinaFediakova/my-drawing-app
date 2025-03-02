"use client";


import { useDispatch } from "react-redux";
import { setColor } from "@/store/slices/settingsSlice";

import './ColorPicker.scss';

interface ColorPickerProps {
  color: string;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ color }) => {
  const dispatch = useDispatch();

    return (
      <div className={`colorPicker__color colorPicker__color_${color}`} onClick={() => dispatch(setColor(color))}></div>
    );
}
