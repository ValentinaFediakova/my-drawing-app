import { useState } from 'react';
import { useDispatch } from "react-redux";
import { AppDispatch } from '@/store';
import { logout } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { DrawingManager } from '@/utils/DrawingManager';
import './ActionBar.scss';

interface ActionBarProps {
  drawingManagerRef: React.RefObject<DrawingManager | null>;
}

export const ActionBar: React.FC<ActionBarProps> = ({ drawingManagerRef }) => {
  const [actionBarOpen, setActionBarOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter();
  

  const handleClear = () => {
    drawingManagerRef.current?.clearCanvas();
  };

  const handleLogOut = () => {
    dispatch(logout())
    router.push("/auth");
  }

  return (
    <>
      <button className={`action-bar__button-open`} onClick={() => setActionBarOpen(!actionBarOpen)}>
        <div className={actionBarOpen ? `action-bar__button-open-img action-bar__button-open-img_opacity` : `action-bar__button-open-img`}></div>
      </button>
      {actionBarOpen && (
        <div className={'action-bar'}>
        {/* <button className="action-bar__item">
          <div className="action-bar__undo"></div>
        </button>
        <button className="action-bar__item">
          <div className="action-bar__redo"></div>
        </button> */}
        <button className="action-bar__item action-bar__item_margin" onClick={handleClear}>
          <div className="action-bar__clear-img action-bar__clear-img_trash"></div>
          <div className="action-bar__item-title">Очистить лист</div>
        </button>
        <button className="action-bar__item" onClick={handleLogOut}>
          <div className="action-bar__logout-img action-bar__logout-img_exit"></div>
          <div className="action-bar__item-title">Выход</div>
        </button>
      </div>
      )}
      
    </>
  );
}