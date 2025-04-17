"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUpThunk } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/store/index";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Authorization/Input/Input";
import { Button } from "@/components/Authorization/Button/Button";


import './SignUp.scss';


export const SignUp: React.FC = ({ }) => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const dispatch = useDispatch<AppDispatch>()
  const signUpStatus = useSelector((state: RootState) => state.auth.signUp.status);
  const error = useSelector((state: RootState) => state.auth.signUp.error);
  const router = useRouter();

  const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setUsername(newName)
  }

  const handleInputPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword)
  }

  const handleSignUp = async () => {


    const result = await dispatch(signUpThunk({ username, password }))

    if (result.meta.requestStatus === "fulfilled") {
      router.push("/canvas");
    } else {
      console.error("Registration failed:", result);
    }
  }

  return (
    <div className='signUp-container'>
      <div className='inner-wrap'>
        <h1 className='signUp__title'>Create Account</h1>
        {error && (
          <div className="error-text">Incorrect login or password</div>
        )}
        <Input placeholder='Enter your name' onHandleChange={(event) => handleInputName(event)} />
        <Input placeholder='Enter your password' onHandleChange={(event) => handleInputPassword(event)}/>
        <Button text="Sign Up" onHandleClick={handleSignUp} type="main" isLoading={signUpStatus==='loading'}/>
      </div>

    </div>
  );
}