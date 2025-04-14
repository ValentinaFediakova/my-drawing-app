import './Input.scss';

interface InputProps {
  placeholder: string;
  onHandleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({placeholder, onHandleChange}) => {

  return (
    <input className='input' placeholder={placeholder} onChange={(event) => onHandleChange(event)}></input>
  )
}


