import { useDispatch } from "react-redux";
import { setName } from "@/store/slices/authorizationSlice";

import './SignIn.scss';

interface SignInProps {
  onSetAuthStep: (step: "info" | "form") => void
}

export const SignIn: React.FC<SignInProps> = ({ onSetAuthStep }) => {

  const dispatch = useDispatch();

  const handleNameChange = (name: string) => {
    dispatch(setName(name));
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    handleNameChange(newName);
  }

  const handleSignIn = () => {
    onSetAuthStep('info')
  }

  return (
    <div className='signIn-container'>
      <div className='inner-wrap'>
        <h1 className='signIn__title'>Please enter the name or nickname you want other members to see you by</h1>
        <input className='signIn__input' placeholder='name, login, nickname ...' onChange={(event) => handleInputChange(event)}></input>
        <button className='signIn__button' onClick={handleSignIn}>SIGN IN</button>
      </div>

    </div>
  );
}