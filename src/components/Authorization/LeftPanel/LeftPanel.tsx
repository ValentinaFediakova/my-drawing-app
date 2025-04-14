// import { useRouter } from "next/navigation";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store/index";
import { Button } from "@/components/Authorization/Button/Button";

import './LeftPanel.scss';

interface LeftPanelProps {
  onSetAuthStep: (step: "signIn" | "signUp") => void
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onSetAuthStep }) => {
  // const router = useRouter();

  // const name = useSelector((state: RootState) => state.authorization.name);

  return (
    <div className='leftPanel-container'>
      <div className='inner-wrap'>
        <h1 className='leftPanel__title'>🚀 Welcome Back!</h1>
        <h2 className='leftPanel__subtitle'>to keep connected with us please login with your personal info 💫 </h2>
        {/* <button className='leftPanel__button' onClick={() => router.push("/canvas")}>START MISSION</button> */}
        <Button
          text="Sign In" 
          type="secondary" 
          onHandleClick={() => onSetAuthStep("signIn")} 
        />
      </div>

    </div>
  );
}