"use client";

interface ColorPickerProps {
	color: string;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({}) => {
    return (
        <div>
            {/* Add your color picker elements here */}
        </div>
    );
}




        //   <div className="settings__color settings__color_black" onClick={() => setColor('black')}></div>
        //   <div className="settings__color settings__color_brown" onClick={() => setColor('brown')}></div>
        //   <div className="settings__color settings__color_blue" onClick={() => setColor('blue')}></div>
        //   <div className="settings__color settings__color_green" onClick={() => setColor('limegreen')}></div>
        //   <div className="settings__color settings__color_coral" onClick={() => setColor('coral')}></div>
        //   <div className="settings__color settings__color_violet" onClick={() => setColor('darkviolet')}></div>
        //   <input className="settings__choose-many-colors" type="color" value='#ffffff' onChange={(e) => setColor(e.target.value)} />