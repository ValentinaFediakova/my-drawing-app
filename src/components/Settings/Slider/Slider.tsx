

import React from 'react';

import { useDispatch } from "react-redux";
import { setLineWidth, setOpacity } from "@/store/slices/settingsSlice";

import './Slider.scss'

interface SliderProps {
  type: 'range';
  min: string;
  max: string;
  step: string;
  defaultValue: string;
	purpose: "opacity" | "lineWidth";
}

export const Slider: React.FC<SliderProps> = ({ type = 'range', min, max, step, defaultValue, purpose }) => {
  const dispatch = useDispatch();
	const changeValue = (value: number) => {
		switch (purpose) {
			case "opacity":
				dispatch(setOpacity(value));
				break;
			case "lineWidth":
				dispatch(setLineWidth(value));
				break;
		}
	}

  return (
    <input
      className="slider__input-range"
      type={type}
      min={min}
      max={max}
      step={step}
      defaultValue={defaultValue}
      onChange={(e) => changeValue(Number(e.target.value))}
    />
  )
}
