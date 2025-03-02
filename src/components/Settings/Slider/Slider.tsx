

import React from 'react';

import './Slider.scss'

interface SliderProps {
  type: 'range';
  min: string;
  max: string;
  step: string;
  defaultValue: string;
  onChangeValue: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ type = 'range', min, max, step, defaultValue, onChangeValue }) => {

  return (
      <input
        className="slider__input-range"
        type={type}
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        // onChange={(e) => a(e)}
        onChange={(e) => onChangeValue(Number(e.target.value))}
      />
  )
}
