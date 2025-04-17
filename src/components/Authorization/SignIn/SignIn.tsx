import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { clearError } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/store";
import { signInThunk } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Authorization/Input/Input";
import { Button } from "@/components/Authorization/Button/Button";

import './SignIn.scss';


export const SignIn: React.FC = ({ }) => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const dispatch = useDispatch<AppDispatch>(); 
  const error = useSelector((state: RootState) => state.auth.signIn.error);
  const router = useRouter();


  const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setUsername(name)
    dispatch(clearError('signIn'))
  }

  const handleInputPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;
    setPassword(password)
    dispatch(clearError("signIn"))
  }

  const handleSignIn = async () => {
    const result = await dispatch(signInThunk({ username, password }))

    if (result.meta.requestStatus === "fulfilled") {
      router.push("/canvas");
    } else {
      console.error("Login failed:", result);
    }
  }

  return (
    <div className='signIn-container'>
      <div className='inner-wrap'>
        <h1 className='signIn__title'>Please enter the name or nickname you want other members to see you by</h1>
        {error &&  <div className="error-text">Incorrect login or password</div>}
        <Input placeholder='Enter your name' onHandleChange={handleInputName} />
        <Input placeholder='Enter your password' onHandleChange={handleInputPassword} />
        <Button text="Sign In" onHandleClick={handleSignIn} type="main"/>
      </div>

    </div>
  );
}