"use client";

import { Slider } from '@/components/Settings/Slider/Slider';
import { ColorPicker } from './ColorPicker/ColorPicker';
import { PALETTE_COLORS } from '@/constants'
import { useSelector, useDispatch } from "react-redux";
import { setColor } from "@/store/slices/settingsSlice";
import { RootState } from "@/store/index";
import { convertRgbaToHex } from "@/utils/ColorConvertations";

import "./Settings.scss";


export const Settings: React.FC = ({ }) => {
  const dispatch = useDispatch();
  const color = useSelector((state: RootState) => state.settings.color);
  const tool = useSelector((state: RootState) => state.settings.tool);

  return (
    <div className="settings">
      <div className={tool === "pencil" ? "settings__block" : "settings__block_hidden"}>
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
      
      <div className={tool === "pencil" ? "settings__block" : "settings__block_hidden"}>
        <div className="settings__title">Толщина штриха</div>
        <Slider type='range' min='0' max='20' step='2' defaultValue='5' purpose='lineWidth' />
      </div>

      <div className={tool === "eraser" ? "settings__block" : "settings__block_hidden"}>
        <div className="settings__title">Толщина ластика</div>
        <Slider type='range' min='0' max='50' step='2' defaultValue={'25'} purpose='eraserLieneWidth' />
      </div>
    
      <div className={tool === "pencil" ? "settings__block" : "settings__block_hidden"}>
        <div className="settings__title">Непрозрачность</div>
        <Slider type={'range'} min={'0.1'} max={'1'} step='0.1' defaultValue={'1'} purpose='opacity' />
      </div>

      <div className="settings__block">
        <div className="settings__title">Действия</div>
        <button className="settings__action"></button>
        <button className="settings__action"></button>
        <button className="settings__action"></button>
      </div>

      <button>Свернуть</button>
      
    </div>
  );
};
