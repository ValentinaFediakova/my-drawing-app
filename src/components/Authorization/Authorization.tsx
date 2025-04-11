import { useState } from 'react';
import { SignIn } from './SignIn/SignIn'
import { RightPanel } from './RightPanel/RightPanel'

import './Authorization.scss'


export const AuthorizationPage = () => {
  const [authStep, setAuthStep] = useState<"form" | "info">("form");

  
  return (
    <div className='authorization-container'>
      <div className={`${authStep === 'info' ? 'clmn clmn_left_animate' : 'clmn clmn_left'}`}><SignIn onSetAuthStep={setAuthStep}/></div>
      <div className={`${authStep === 'info' ? 'clmn clmn_right_animate' : 'clmn clmn_right'}`}><RightPanel onSetAuthStep={setAuthStep}/></div>
    </div>
  )
  };