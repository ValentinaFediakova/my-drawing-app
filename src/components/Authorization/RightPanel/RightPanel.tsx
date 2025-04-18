// import { useRouter } from "next/navigation";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store/index";
import { Button } from "@/components/Authorization/Button/Button";


import './RightPanel.scss';

interface RightPanelProps {
  onSetAuthStep: (step: "signIn" | "signUp") => void
}

export const RightPanel: React.FC<RightPanelProps> = ({ onSetAuthStep }) => {
  // const router = useRouter();

  // const name = useSelector((state: RootState) => state.authorization.name);

  return (
    <div className='rightPanel-container'>
      <div className='inner-wrap'>
        <h1 className='rightPanel__title'>🚀 Hello, Friend!</h1>
        <h2 className='rightPanel__subtitle'>Enter your personal details and start your journey with us 💫 </h2>
        {/* <button className='leftPanel__button' onClick={() => router.push("/canvas")}>START MISSION</button> */}
        <Button 
          text="Sign Up" 
          type="secondary" 
          onHandleClick={() => onSetAuthStep("signUp")} 
        />
      </div>

    </div>
  );
}