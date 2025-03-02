import { ReduxProvider } from "@/components/ReduxProvider";
import { Canvas } from "@/components/Canvas/Canvas";

export default function Home() {
  return (
    <ReduxProvider>
      <Canvas />
    </ReduxProvider>
  );
}
