import { useDispatch } from "react-redux";
import { signUpThunk } from "@/features/auth/authSlice";
import { AppDispatch } from "@/store/index";
import { Input } from "@/components/Authorization/Input/Input";

import './SignUp.scss';
import { useState } from "react";

interface SignUpProps {
  onSetAuthStep: (step: "signIn" | "signUp") => void
}

export const SignUp: React.FC<SignUpProps> = ({ onSetAuthStep }) => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const dispatch = useDispatch<AppDispatch>()

  const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setUsername(newName)
  }

  const handleInputPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword)
  }

  const handleSignUp = () => {
    onSetAuthStep('signUp')
    dispatch(signUpThunk({ username, password }))
  }

  return (
    <div className='signUp-container'>
      <div className='inner-wrap'>
        <h1 className='signUp__title'>Create Account</h1>
        <Input placeholder='Enter your name' onHandleChange={(event) => handleInputName(event)} />
        <Input placeholder='Enter your password' onHandleChange={(event) => handleInputPassword(event)}/>
        <button className="signUp__button" onClick={handleSignUp}>SIGN UP</button>
      </div>

    </div>
  );
}