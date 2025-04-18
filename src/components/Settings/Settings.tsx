"use client";

import { useState } from 'react';
import { Slider } from '@/components/Settings/Slider/Slider';
import { Dropdown } from '@/components/Settings/Dropdown/Dropdown';
import { ColorPicker } from './ColorPicker/ColorPicker';
import { PALETTE_COLORS, SHAPES } from '@/constants'
import { useSelector, useDispatch } from "react-redux";
import { setColor, setOutline, setShape } from "@/store/slices/settingsSlice";
import { RootState } from "@/store/index";
import { convertRgbaToHex } from "@/utils/ColorConvertations";
import { StyleButton } from '@/components/Settings/StyleButton/StyleButton';


import "./Settings.scss";


export const Settings: React.FC = ({ }) => {
  const [activeOutlineButtons, setActiveOutlineButtons] = useState<string[]>();
  const [activeShapeButton, setActiveShapeButton] = useState<string>();

  const dispatch = useDispatch();
  const color = useSelector((state: RootState) => state.settings.color);
  const tool = useSelector((state: RootState) => state.settings.tool);

  const handleOutlineButton = (outline: string) => {
    const newValueOutline = activeOutlineButtons?.includes(outline) 
      ? activeOutlineButtons.filter((item) => item !== outline)
      : [...(activeOutlineButtons || []), outline];
    setActiveOutlineButtons(newValueOutline);
    dispatch(setOutline(outline))
  }

  const handleShapeButton = (shape: string) => {
    dispatch(setShape(shape))
    setActiveShapeButton(shape)
  }

  return (
    <div className="settings">
      {tool === 'pencil' && (
        <>
          <div className={"settings__block"}>
            <div className="settings__title">Color</div>
            <div className="settings__colors">
              {Object.values(PALETTE_COLORS).map((color) => (
                <ColorPicker key={color} color={color} />
              ))}
              <input 
                className="settings__choose-many-colors" 
                type="color" 
                value={convertRgbaToHex(color)} 
                onChange={(e) => dispatch(setColor(e.target.value))} 
              />
            </div>
          </div>

          <div className={"settings__block"}>
            <div className="settings__title">Stroke thickness</div>
            <Slider type='range' min='1' max='21' step='2' defaultValue='5' purpose='lineWidth' />
          </div>



          <div className={"settings__block"}>
            <div className="settings__title">Opacity</div>
            <Slider type={'range'} min={'0.1'} max={'1'} step='0.1' defaultValue={'1'} purpose='opacity' />
          </div>
        </>
      )}

      {tool === 'eraser' && (
        <div className={"settings__block"}>
          <div className="settings__title">Eraser thickness</div>
          <Slider type='range' min='1' max='51' step='2' defaultValue={'25'} purpose='eraserLieneWidth' />
        </div>
      )}

      {tool === 'writeText' && (
        <>
          <div className={"settings__block"}>
            <div className="settings__title">Color</div>
            <div className="settings__colors">
              {Object.values(PALETTE_COLORS).map((color) => (
                <ColorPicker key={color} color={color} />
              ))}
              <input 
                className="settings__choose-many-colors" 
                type="color" 
                value={convertRgbaToHex(color)} 
                onChange={(e) => dispatch(setColor(e.target.value))} 
              />
            </div>
          </div>

          <div className={"settings__block"}>
            <div className="settings__title">Font size</div>
            <Dropdown/>
          </div>

          <div className={"settings__block"}>
            <div className="settings__title">Outline</div>
            <div className='settings__buttons-outline'>
              <button 
                className={activeOutlineButtons?.includes('Bold') ? `settings__button-outline settings__button-outline_bold settings__button-outline_active` : `settings__button-outline settings__button-outline_bold`}
                onClick={() => handleOutlineButton('Bold')}
              ></button>
              <button 
                className={activeOutlineButtons?.includes('Italic') ? `settings__button-outline settings__button-outline_italic settings__button-outline_active` : `settings__button-outline settings__button-outline_italic`}
                onClick={() => handleOutlineButton('Italic')}
              ></button>
            </div>
          </div>
        </>
      )}

      {tool === 'shape' && (
        <>
          <div className={"settings__block"}>
            <div className="settings__title">Shape</div>
            <div className='settings__buttons-shape'>
              {Object.values(SHAPES).map((item, index) => (
                <StyleButton 
                  key={index} 
                  isActive={activeShapeButton === item} 
                  onHandleClick={handleShapeButton} 
                  icon={<div className={`style-button__img style-button__img_${item}`}></div>} 
                  value={item}
                />
              ))}
            </div>
            {/* <div className="settings__title">Style</div>
            <div className="settings__title">Color</div>
            <div className="settings__colors">
              {Object.values(PALETTE_COLORS).map((color) => (
                <ColorPicker key={color} color={color} />
              ))}
              <input 
                className="settings__choose-many-colors" 
                type="color" 
                value={convertRgbaToHex(color)} 
                // onChange={(e) => dispatch(setColor(e.target.value))} 
              />
            </div> */}
          </div>

          {/* <div className={"settings__block"}>
            <div className="settings__title">Line thickness</div>
            <Slider type='range' min='1' max='21' step='2' defaultValue='5' purpose='lineWidth' />
          </div> */}
        </>
      )}      
    </div>
  );
};
