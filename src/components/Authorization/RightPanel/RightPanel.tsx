import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/index";

import './RightPanel.scss';

interface RightPanelProps {
  onSetAuthStep: (step: "info" | "form") => void
}

export const RightPanel: React.FC<RightPanelProps> = ({ onSetAuthStep }) => {
  const router = useRouter();

  const name = useSelector((state: RootState) => state.authorization.name);

  return (
    <div className='rightPanel-container'>
      <div className='inner-wrap'>
        <h1 className='rightPanel__title'>🚀 Preparing to dock at the Drawing Station...</h1>
        <h2 className='rightPanel__subtitle'>Other crew members will see you as: {name}
        <br/>Let’s create some art across the stars 💫 </h2>
        <button className='rightPanel__button' onClick={() => router.push("/canvas")}>START MISSION</button>
        <button className='rightPanel__button rightPanel__button_transparent-bg' onClick={() => onSetAuthStep('form')}>CHANGE NAME</button>
      </div>

    </div>
  );
}