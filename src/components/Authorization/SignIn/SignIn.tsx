// import { useDispatch } from "react-redux";
// import { Input } from "@/components/Authorization/Input/Input";
import { Button } from "@/components/Authorization/Button/Button";

import './SignIn.scss';

interface SignInProps {
  onSetAuthStep: (step: "signIn" | "signUp") => void
}

export const SignIn: React.FC<SignInProps> = ({ onSetAuthStep }) => {

  // const dispatch = useDispatch();

  // const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
  // }

  // const handleInputPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
  // }

  const handleSignIn = () => {
    onSetAuthStep('signIn')
  }

  return (
    <div className='signIn-container'>
      <div className='inner-wrap'>
        <h1 className='signIn__title'>Please enter the name or nickname you want other members to see you by</h1>
        {/* <Input placeholder='Enter your name' onHandleChange={handleInputName} /> */}
        {/* <Input placeholder='Enter your password' onHandleChange={handleInputPassword} /> */}
        <Button text="Sign In" onHandleClick={handleSignIn} type="main"/>
      </div>

    </div>
  );
}