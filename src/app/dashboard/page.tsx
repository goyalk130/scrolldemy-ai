"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Link, Video, Rocket, Wand2, Loader2, Sparkles, ArrowLeft, Download } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Player } from "@remotion/player";
import { TikTokComposition } from "@/remotion/TikTokComposition";
import { getAudioDurationInSeconds } from "@remotion/media-utils";

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";

  const { isLoaded, userId } = useAuth();
  const [url, setUrl] = useState(initialUrl);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<any[]>([]);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [hasStartedInitialGeneration, setHasStartedInitialGeneration] = useState(false);
  const [renderingVideoIndex, setRenderingVideoIndex] = useState<number | null>(null);
  const [videoAudioUrls, setVideoAudioUrls] = useState<Record<number, string>>({});
  const [audioDurations, setAudioDurations] = useState<Record<number, number>>({});
  const [isDownloading, setIsDownloading] = useState<string | null>(null); // 'mp4' or 'mov'

  // Auto-generate if url is passed via query param on first load
  useEffect(() => {
    if (initialUrl && isLoaded && !hasStartedInitialGeneration) {
      setHasStartedInitialGeneration(true);
      handleGenerate(false);
    }
  }, [initialUrl, isLoaded, hasStartedInitialGeneration]);

  const handleGenerate = async (isGeneratingMore = false) => {
    if (!url) return alert("Please enter a URL first");
    
    if (isGeneratingMore) {
       if (!userId && generatedVideos.length >= 3) {
          alert("Please Sign In to generate more videos from this content!");
          return;
       }
       if (userId && generatedVideos.length >= 6) {
          alert("You've generated the maximum of 6 free videos! Please wait for Premium.");
          return;
       }
    }

    const nextChunkIndex = isGeneratingMore ? chunkIndex + 1 : 0;
    if (!isGeneratingMore) {
      setGeneratedVideos([]);
      setVideoAudioUrls({});
      setAudioDurations({});
      setRenderingVideoIndex(null);
      setIsDownloading(null);
    }
    
    try {
      setIsGenerating(true);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, chunkIndex: nextChunkIndex })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setChunkIndex(nextChunkIndex);
      setGeneratedVideos(prev => isGeneratingMore ? [...prev, ...data.videos] : data.videos);
      
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRenderVideo = async (videoIndex: number) => {
    // Toggle view if already rendering
    if (renderingVideoIndex === videoIndex) {
      setRenderingVideoIndex(null);
      return;
    }
    
    setRenderingVideoIndex(videoIndex);

    // Output cached audio if it exists
    if (videoAudioUrls[videoIndex]) return;

    const vid = generatedVideos[videoIndex];
    if (!vid) return;

    try {
      // Flatten the script sentences to get the raw spoken text
      const fullText = vid.script.map((s:any) => s.text).join(" ");
      
      const res = await fetch("/api/voice", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ text: fullText })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Save base64 audio and trigger Remotion
      setVideoAudioUrls(prev => ({ ...prev, [videoIndex]: data.audioUrl }));
      
      try {
        const duration = await getAudioDurationInSeconds(data.audioUrl);
        setAudioDurations(prev => ({ ...prev, [videoIndex]: duration }));
      } catch (e) {
        setAudioDurations(prev => ({ ...prev, [videoIndex]: 60 })); // fallback to 60s
      }
      
    } catch(err: any) {
      alert("Audio Generation Error: " + err.message);
      setRenderingVideoIndex(null);
    }
  };

  const handleDownload = async (videoIndex: number, format: 'mp4' | 'mov') => {
    setIsDownloading(format);
    try {
      const vid = generatedVideos[videoIndex];
      const audioUrl = videoAudioUrls[videoIndex];
      const duration = audioDurations[videoIndex] ? Math.max(30, Math.ceil(audioDurations[videoIndex] * 30)) : 1800;

      const res = await fetch("/api/download", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ script: vid.script, audioUrl, format, durationInFrames: duration })
      });

      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.error || "Failed to render video");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `scrolldemy-export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err: any) {
      alert("Download Error: " + err.message);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-24">
      <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">AI Studio</h1>
          <div className="relative flex items-center bg-[#111] border border-white/10 rounded-full p-2 pl-6 shadow-2xl overflow-hidden ring-1 ring-white/5">
            <Link className="text-gray-500 w-5 h-5 flex-shrink-0" />
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube or Blog URL here..." 
              className="bg-transparent border-none outline-none text-white px-4 py-3 w-full placeholder:text-gray-500"
            />
            <button 
              onClick={() => handleGenerate(false)}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full px-8 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 min-w-[160px]"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isGenerating ? "Analyzing..." : "Generate"}
            </button>
          </div>
      </div>

      {isGenerating && generatedVideos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
            <p className="text-lg">AI is reading your content and drafting scripts...</p>
          </div>
      )}

      {generatedVideos.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Video className="w-6 h-6 text-pink-400" />
            Generated Scripts ({generatedVideos.length})
          </h3>
          
          <div className="grid gap-6">
            {generatedVideos.map((vid, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="bg-[#111] rounded-2xl p-6 border border-white/10 shadow-xl relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded-l-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <h4 className="font-bold text-xl mb-4 pl-4 text-white">{vid.title}</h4>
                <div className="space-y-4 pl-2 mt-6 border-l-2 border-purple-500/20 ml-2">
                    {vid.script.map((s:any, i:number) => (
                      <div key={i} className="pl-6 relative">
                        <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_2px_rgba(168,85,247,0.5)]" />
                        <p className="text-gray-100 text-lg mb-1.5 leading-snug">"{s.text}"</p>
                        <p className="text-sm text-gray-400 font-mono flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-yellow-500/70" /> [{s.imagePrompt}]
                        </p>
                      </div>
                    ))}
                </div>
                
                {/* Render Action and Player Mount */}
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-end gap-4">
                   <button 
                     onClick={() => handleRenderVideo(idx)}
                     className="flex items-center gap-2 text-sm font-semibold bg-white text-black px-6 py-2.5 rounded-full hover:scale-105 transition-transform"
                   >
                      <Video className="w-4 h-4" />
                      {renderingVideoIndex === idx ? "Close Render Preview" : "Generate Audio & View Result"}
                   </button>
                   
                   {renderingVideoIndex === idx && (
                     <div className="w-full mt-4 bg-black rounded-2xl overflow-hidden border border-purple-500/30 flex flex-col items-center justify-center min-h-[400px]">
                       {!videoAudioUrls[idx] ? (
                         <div className="flex flex-col items-center gap-4 py-12 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                            <p>Synthesizing ultra-realistic ElevenLabs Voiceover...</p>
                         </div>
                       ) : (
                         <Player
                           component={TikTokComposition}
                           inputProps={{
                             script: vid.script,
                             audioUrl: videoAudioUrls[idx]
                           }}
                           durationInFrames={audioDurations[idx] ? Math.max(30, Math.ceil(audioDurations[idx] * 30)) : 1800} // precise accurate length
                           fps={30}
                           compositionWidth={1080}
                           compositionHeight={1920}
                           style={{
                             width: '100%',
                             maxHeight: '700px',
                             aspectRatio: '9/16'
                           }}
                           controls
                           autoPlay
                           loop
                         />
                       )}
                       
                       {/* Download Buttons Below Player */}
                       {videoAudioUrls[idx] && (
                           <div className="flex gap-4 mt-6 mb-4 w-full px-8 justify-center">
                               <button 
                                 onClick={() => handleDownload(idx, 'mp4')}
                                 disabled={isDownloading !== null}
                                 className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-transform text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 w-full"
                               >
                                  {isDownloading === 'mp4' ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}
                                  {isDownloading === 'mp4' ? "Rendering Studio MP4... Wait ~1 min" : "Download MP4"}
                               </button>
                               <button 
                                 onClick={() => handleDownload(idx, 'mov')}
                                 disabled={isDownloading !== null}
                                 className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105 transition-transform text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 w-full"
                               >
                                  {isDownloading === 'mov' ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}
                                  {isDownloading === 'mov' ? "Rendering Studio MOV... Wait ~1 min" : "Download MOV (Apple ProRes)"}
                               </button>
                           </div>
                       )}
                       
                     </div>
                   )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="pt-8 text-center">
            <button 
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl px-8 py-5 border border-white/10 transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5 text-purple-400" />}
              {isGenerating ? "Studying next segment..." : "Generate More Videos from this Link!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Static Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5 bg-[#050505]/80">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
          <Wand2 className="w-5 h-5 text-purple-400 ml-2" />
          Scrolldemy
        </button>
        <div>
          {isLoaded && !userId && (
            <SignInButton mode="modal">
              <button className="text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
          {isLoaded && userId && (
            <UserButton />
          )}
        </div>
      </header>
      
      <Suspense fallback={<div className="pt-32 text-center text-gray-500">Loading Studio...</div>}>
         <DashboardContent />
      </Suspense>
    </main>
  );
}
