import './StyleButton.scss';

interface StyleButtonProps {
  isActive: boolean;
  onHandleClick: (value: string) => void;
  icon: React.ReactNode;
  value: string;
}

export const StyleButton: React.FC<StyleButtonProps> = ({ isActive, onHandleClick, icon, value }) => {
  return (
    <button
      className={`style-button ${isActive ? "style-button_active" : ""}`}
      onClick={() => onHandleClick(value)}
    >
      {icon}
    </button>
  );
}