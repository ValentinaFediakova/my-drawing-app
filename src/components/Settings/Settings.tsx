"use client";

import { useState } from 'react';
import { Slider } from '@/components/Settings/Slider/Slider';
import { Dropdown } from '@/components/Settings/Dropdown/Dropdown';
import { ColorPicker } from './ColorPicker/ColorPicker';
import { PALETTE_COLORS } from '@/constants'
import { useSelector, useDispatch } from "react-redux";
import { setColor, setOutline } from "@/store/slices/settingsSlice";
import { RootState } from "@/store/index";
import { convertRgbaToHex } from "@/utils/ColorConvertations";

import "./Settings.scss";


export const Settings: React.FC = ({ }) => {
  const [activeOutlineButtons, setActiveOutlineButtons] = useState<string[]>();

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
            <div className="settings__title">Толщина штриха</div>
            <Slider type='range' min='1' max='21' step='2' defaultValue='5' purpose='lineWidth' />
          </div>



          <div className={"settings__block"}>
            <div className="settings__title">Непрозрачность</div>
            <Slider type={'range'} min={'0.1'} max={'1'} step='0.1' defaultValue={'1'} purpose='opacity' />
          </div>
        </>
      )}

      {tool === 'eraser' && (
        <div className={"settings__block"}>
          <div className="settings__title">Толщина ластика</div>
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
            <div className="settings__title">Размер шрифта</div>
            <Dropdown/>
          </div>

          <div className={"settings__block"}>
            <div className="settings__title">Начертание</div>
            <div className='settings__buttons-outline'>
              <button 
                className={activeOutlineButtons?.includes('Bold') ? `settings__button-outline settings__button-outline_bold settings__button-outline_active` : `settings__button-outline settings__button-outline_bold`}
                onClick={() => handleOutlineButton('Bold')}
              ></button>
              <button 
                className={activeOutlineButtons?.includes('Italic') ? `settings__button-outline settings__button-outline_italic settings__button-outline_active` : `settings__button-outline settings__button-outline_italic`}
                onClick={() => handleOutlineButton('Italic')}
              ></button>
              {/* <button 
                className={activeOutlineButtons?.includes('Underline') ? `settings__button-outline settings__button-outline_underline settings__button-outline_active` : `settings__button-outline settings__button-outline_underline`}
                onClick={() => handleOutlineButton('Underline')}
              ></button> */}
            </div>
          </div>
        </>
      )}

      {/* <div className="settings__block">
        <div className="settings__title">Действия</div>
        <button className="settings__action"></button>
        <button className="settings__action"></button>
        <button className="settings__action"></button>
      </div>

      <button>Свернуть</button> */}
      
    </div>
  );
};
