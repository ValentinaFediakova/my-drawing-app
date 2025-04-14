import './Button.scss';

interface ButtonProps {
  text: string;
  type: 'main' | 'secondary';
  onHandleClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({text, type, onHandleClick}) => {

  return (
    <button className={type === 'main' ? 'button button_main' : 'button button_secondary'} onClick={onHandleClick}>{text.toUpperCase()}</button>
)
}


