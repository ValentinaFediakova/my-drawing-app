import { useState } from 'react';
import { SignIn } from './SignIn/SignIn'
import { RightPanel } from './RightPanel/RightPanel'
import { LeftPanel } from './LeftPanel/LeftPanel'
import { SignUp } from './SignUp/SignUp';

import './Authorization.scss'

export const AuthorizationPage = () => {
  const [authStep, setAuthStep] = useState<"signIn" | "signUp">("signIn");

  
  return (
    <div className='auth-container'>
      <div className={`auth__inner-wrap auth__inner-wrap_right  ${authStep === 'signUp' ? 'auth__inner-wrap_animate-left' : ''}`}>
        <div className='clmn clmn_left'>
          <div className={`${authStep === 'signUp' ? 'auth__signIn-wrap_animate-left' : 'auth__signIn-wrap_animate-right'}`}>
            <SignIn/>
          </div>
        </div>
      </div>

      <div className='auth__panel-wrap auth__panel-wrap_right'>
        <RightPanel onSetAuthStep={setAuthStep}/>
      </div>

      <div className={`auth__inner-wrap auth__inner-wrap_left ${authStep === 'signUp' ? 'auth__inner-wrap_animate-right' : ''}`}>
        <div className={`clmn clmn_right`}>
          <div className={`${authStep === 'signUp' ? 'auth__signUp-wrap_animate-right' : 'auth__signUp-wrap_animate-left'}`}>
            <SignUp/>
          </div>
        </div>
      </div>

      <div className='auth__panel-wrap auth__panel-wrap_left'>
        <LeftPanel onSetAuthStep={setAuthStep}/>
      </div>
    </div>
  )
  };