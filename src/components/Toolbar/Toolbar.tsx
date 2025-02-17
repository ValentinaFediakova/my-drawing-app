"use client";

import "./Toolbar.scss";

interface ToolbarProps {
  setColor: (color: string) => void;
  setLineWidth: (width: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ setColor, setLineWidth }) => {
  return (
    <div className="toolbar">
      <input type="color" onChange={(e) => setColor(e.target.value)} />
      <input
        type="range"
        min="1"
        max="20"
        defaultValue="5"
        onChange={(e) => setLineWidth(Number(e.target.value))}
      />
    </div>
  );
};

export default Toolbar;
