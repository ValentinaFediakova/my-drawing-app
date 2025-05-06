import { Button } from "@/components/Authorization/Button/Button";

import './LeftPanel.scss';

interface LeftPanelProps {
  onSetAuthStep: (step: "signIn" | "signUp") => void
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onSetAuthStep }) => {

  return (
    <div className='leftPanel-container'>
      <div className='inner-wrap'>
        <h1 className='leftPanel__title'>🚀 Welcome Back!</h1>
        <h2 className='leftPanel__subtitle'>to keep connected with us please login with your personal info 💫 </h2>
        <Button
          text="Sign In" 
          type="secondary" 
          onHandleClick={() => onSetAuthStep("signIn")} 
        />
      </div>

    </div>
  );
}