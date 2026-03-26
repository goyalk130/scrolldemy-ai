import React from "react";
import { Composition, registerRoot } from "remotion";
import { TikTokComposition } from "./TikTokComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TikTokComposition"
        component={TikTokComposition}
        durationInFrames={1800} // Dynamic default
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          script: [],
          audioUrl: "",
          durationInFrames: 1800
        }}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: props.durationInFrames || 1800
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
