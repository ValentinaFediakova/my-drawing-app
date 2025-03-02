"use client";

import { Slider } from '@/components/Settings/Slider/Slider';
import "./Settings.scss";

interface SettingsProps {
  onSetColor: (color: string) => void;
  onSetLineWidth: (width: number) => void;
  onSetOpacity: (opacity: number) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSetColor, onSetLineWidth, onSetOpacity }) => {
  return (
    <div className="settings">
      <div className="settings__block">
        <div className="settings__title">Color</div>
        <div className="settings__colors">

        </div>
      </div>
      
      <div className="settings__block">
        <div className="settings__title">Толщина штриха</div>
        <Slider type='range' min='0' max='20' step='2' defaultValue='5' onChangeValue={onSetLineWidth} />
      </div>
    
      <div className="settings__block">
        <div className="settings__title">Непрозрачность</div>
        <Slider type={'range'} min={'0.1'} max={'1'} step='0.1' defaultValue={'1'} onChangeValue={ onSetOpacity } />
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
