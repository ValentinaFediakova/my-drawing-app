import { Button } from "@/components/Authorization/Button/Button";


import './RightPanel.scss';

interface RightPanelProps {
  onSetAuthStep: (step: "signIn" | "signUp") => void
}

export const RightPanel: React.FC<RightPanelProps> = ({ onSetAuthStep }) => {

  return (
    <div className='rightPanel-container'>
      <div className='inner-wrap'>
        <h1 className='rightPanel__title'>🚀 Hello, Friend!</h1>
        <h2 className='rightPanel__subtitle'>Enter your personal details and start your journey with us 💫 </h2>
        <Button 
          text="Sign Up" 
          type="secondary" 
          onHandleClick={() => onSetAuthStep("signUp")} 
        />
      </div>

    </div>
  );
}