import "./index.css";
import { Composition } from "remotion";
import { CombustivelVideo } from "./CombustivelVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CombustivelVideo"
        component={CombustivelVideo}
        durationInFrames={1260}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
