import { DrawingManager } from '@/utils/DrawingManager';
import './ActionBar.scss';

interface ActionBarProps {
  drawingManagerRef: React.RefObject<DrawingManager | null>;
}

export const ActionBar: React.FC<ActionBarProps> = ({ drawingManagerRef }) => {
  const handleClear = () => {
    drawingManagerRef.current?.clearCanvas();
  };

  return (
    <div className="action-bar">
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
  );
}