import { useState } from 'react';
import { SignIn } from './SignIn/SignIn'
import { RightPanel } from './RightPanel/RightPanel'

import './Authorization.scss'


export const AuthorizationPage = () => {
  const [authStep, setAuthStep] = useState<"form" | "info">("form");
  const [name, setName] = useState<string>('Anonymous')

  
  return (
    <div className='authorization-container'>
      <div className={`${authStep === 'info' ? 'clmn clmn_left_animate' : 'clmn clmn_left'}`}><SignIn onSetName={setName} onSetAuthStep={setAuthStep}/></div>
      <div className={`${authStep === 'info' ? 'clmn clmn_right_animate' : 'clmn clmn_right'}`}><RightPanel name={name} onSetAuthStep={setAuthStep}/></div>
    </div>
  )
  };