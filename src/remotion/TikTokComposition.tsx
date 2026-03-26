import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, interpolate, Sequence, Img } from 'remotion';
import React from 'react';

export const TikTokComposition: React.FC<{ script: any[], audioUrl: string, durationInFrames?: number }> = ({ script, audioUrl }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const totalChars = script.reduce((acc, s) => acc + (s.text ? s.text.length : 1), 0);
  let currentFrameAcc = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050505' }}>
      {audioUrl && <Audio src={audioUrl} />}
      
      {script.map((s, i) => {
         const framesForSlide = Math.floor((s.text.length / totalChars) * durationInFrames);
         const startFrame = currentFrameAcc;
         const endFrame = i === script.length - 1 ? durationInFrames : startFrame + framesForSlide;
         currentFrameAcc = endFrame;

         const isActive = frame >= startFrame && frame < endFrame;
         if (!isActive) return null;

         const yOffset = interpolate(frame - startFrame, [0, 15], [50, 0], { extrapolateRight: 'clamp' });
         const opacity = interpolate(frame - startFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

         return (
           <Sequence key={i} from={startFrame} durationInFrames={endFrame - startFrame}>
             {/* Dynamic Background Image */}
             <AbsoluteFill>
                 {s.backgroundUrl ? (
                     <Img 
                        src={s.backgroundUrl} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          opacity: 0.6, 
                          transform: `scale(${interpolate(frame - startFrame, [0, endFrame - startFrame], [1, 1.1])})` 
                        }} 
                     />
                 ) : (
                     <div style={{ width: '100%', height: '100%', backgroundColor: '#222' }} />
                 )}
                 <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
             </AbsoluteFill>

             {/* Captions */}
             <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
               <h1 
                 style={{ 
                   transform: `translateY(${yOffset}px)`, 
                   opacity,
                   color: 'white',
                   fontSize: '3.5rem',
                   fontWeight: 900,
                   textAlign: 'center',
                   textTransform: 'uppercase',
                   lineHeight: 1.1,
                   textShadow: '0 4px 10px rgba(0,0,0,0.8), 0 0 20px rgba(168,85,247,0.5)',
                   WebkitTextStroke: '2px black'
                 }}
               >
                 {s.text}
               </h1>
             </AbsoluteFill>
           </Sequence>
         );
      })}
    </AbsoluteFill>
  );
};
