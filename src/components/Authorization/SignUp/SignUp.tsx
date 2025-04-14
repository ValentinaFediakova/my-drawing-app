// import { useDispatch } from "react-redux";
// import { setName, setPassword } from "@/store/slices/authorizationSlice";
import { Input } from "@/components/Authorization/Input/Input";

import './SignUp.scss';

interface SignUpProps {
  onSetAuthStep: (step: "signIn" | "signUp") => void
}

export const SignUp: React.FC<SignUpProps> = ({ onSetAuthStep }) => {

  const handleSignUp = () => {
    onSetAuthStep('signUp')
  }

  return (
    <div className='signUp-container'>
      <div className='inner-wrap'>
        <h1 className='signUp__title'>Create Account</h1>
        <Input placeholder='Enter your name'/>
        <Input placeholder='Enter your e-mail'/>
        <Input placeholder='Enter your password' />
        <button className="signUp__button" onClick={handleSignUp}>SIGN UP</button>
      </div>

    </div>
  );
}