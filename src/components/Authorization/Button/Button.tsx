import './Button.scss';

interface ButtonProps {
  text: string;
  type: 'main' | 'secondary';
  isLoading?: boolean;
  onHandleClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({text, type, onHandleClick, isLoading}) => {
console.log('isLoading', isLoading)
  return (
    <button 
      className={type === 'main' ? 'button button_main' : 'button button_secondary'} 
      onClick={onHandleClick}>{text.toUpperCase()}
      {isLoading &&(
        <div className='button__loader'></div>
      )}
    </button>
)
}


