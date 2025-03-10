import { useState } from 'react';

import { DrawingManager } from '@/utils/DrawingManager';
import './ActionBar.scss';

interface ActionBarProps {
  drawingManagerRef: React.RefObject<DrawingManager | null>;
}

export const ActionBar: React.FC<ActionBarProps> = ({ drawingManagerRef }) => {
  const [actionBarOpen, setActionBarOpen] = useState(false);

  const handleClear = () => {
    drawingManagerRef.current?.clearCanvas();
  };

  return (
    <>
      <button className={`action-bar__button-open`} onClick={() => setActionBarOpen(!actionBarOpen)}>
        <div className={actionBarOpen ? `action-bar__button-open-img action-bar__button-open-img_opacity` : `action-bar__button-open-img`}></div>
      </button>
      <div className={actionBarOpen ? 'action-bar action-bar_open' : 'action-bar'}>
        {/* <button className="action-bar__item">
          <div className="action-bar__undo"></div>
        </button>
        <button className="action-bar__item">
          <div className="action-bar__redo"></div>
        </button> */}
        <button className="action-bar__item" onClick={handleClear}>
          <div className="action-bar__clear-img action-bar__clear-img_trash"></div>
          <div className="action-bar__clear-title">Очистить лист</div>
        </button>
      </div>
    </>
  );
}