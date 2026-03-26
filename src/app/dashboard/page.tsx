"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Link as LinkIcon, Video, Rocket, Wand2, Loader2, Sparkles, ArrowLeft, Download } from "lucide-react";
import NextLink from "next/link";
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
    <div className="flex flex-col lg:flex-row h-screen bg-[#0e0e0e] text-white overflow-hidden">
      {/* 1. Sexy Glassmorphism Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-[#131313] border-r border-[#262626] relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-8 flex items-center gap-3">
          <Wand2 className="w-8 h-8 font-bold text-[#cc97ff] drop-shadow-[0_0_15px_rgba(204,151,255,0.8)]" />
          <NextLink href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-black tracking-tighter" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Scrolldemy</h1>
          </NextLink>
        </div>
        <nav className="flex-1 px-6 space-y-2 mt-4">
          <div className="flex items-center gap-3 px-5 py-4 bg-[#262626] rounded-2xl text-[#cc97ff] shadow-[0_0_20px_rgba(204,151,255,0.05)] border border-[#c284ff]/20 font-medium">
             <Rocket className="w-5 h-5" /> Video Studio
          </div>
          <div className="flex items-center gap-3 px-5 py-4 text-[#adaaaa] hover:text-white transition-colors font-medium cursor-not-allowed opacity-50">
             <Video className="w-5 h-5" /> My Library (Soon)
          </div>
        </nav>
        <div className="p-8 pb-10 border-t border-[#262626]">
          <div className="bg-gradient-to-br from-[#c284ff]/10 to-[#553777]/20 p-5 rounded-3xl border border-[#c284ff]/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-[#A855F7]/30 blur-[40px] rounded-full" />
             <h3 className="font-bold text-[#A855F7] mb-1 relative z-10">Alchemist PRO</h3>
             <p className="text-xs text-[#adaaaa] mb-4 relative z-10">Deploy limitless cloud rendering</p>
             <button className="w-full py-2.5 bg-[#fed01b] text-[#594700] rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_15px_rgba(254,208,27,0.3)] relative z-10">Upgrade API</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto scrollbar-hide">
         {/* Ambient Background Glows */}
         <div className="absolute top-[5%] left-[20%] w-[600px] h-[600px] bg-[#cc97ff]/5 rounded-full blur-[150px] pointer-events-none" />
         <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[#c284ff]/5 rounded-full blur-[120px] pointer-events-none" />
         
         {/* Mobile Header / Auth */}
         <header className="flex items-center justify-between p-6 lg:p-8 lg:pb-0 relative z-30">
            <div className="lg:hidden flex items-center gap-2 font-bold text-xl tracking-tighter">
               <Wand2 className="w-6 h-6 text-[#A855F7] drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" /> Scrolldemy
            </div>
            <div className="ml-auto">
               {!isLoaded ? null : userId ? <UserButton /> : (
                   <SignInButton mode="modal">
                     <button className="bg-white/5 hover:bg-white/10 border border-[#494847]/50 px-6 py-2.5 rounded-full font-medium transition-colors backdrop-blur-xl text-sm">Deploy Auth</button>
                   </SignInButton>
               )}
            </div>
         </header>

         {/* Studio Canvas */}
         <div className="flex-1 p-6 lg:p-12 max-w-6xl w-full mx-auto relative z-10 space-y-12 pb-32">
            
            {/* The Prompt Machine */}
            <section className="bg-[#131313]/80 backdrop-blur-2xl border border-[#262626] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#cc97ff]/10 blur-[80px] rounded-full group-hover:bg-[#cc97ff]/20 transition-colors duration-1000" />
               <h2 className="text-3xl font-black mb-3 tracking-tight text-white drop-shadow-md">Compile New Sequence</h2>
               <p className="text-[#adaaaa] mb-8 text-sm">Inject a YouTube or Tech Article link. The Alchemist will synthesize high-retention segments autonomously.</p>
               
               <div className="flex flex-col md:flex-row gap-4 relative z-10">
                  <div className="flex-1 relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                       <LinkIcon className="text-[#777575] w-5 h-5 group-focus-within/input:text-[#cc97ff] transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..." 
                      className="w-full bg-[#0e0e0e] border border-[#262626] focus:border-[#cc97ff] text-white rounded-2xl py-4 pl-14 pr-4 outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_20px_rgba(204,151,255,0.1),inset_0_2px_10px_rgba(0,0,0,0.5)] placeholder:text-[#494847]"
                    />
                  </div>
                  <button 
                    onClick={() => handleGenerate(false)}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#cc97ff] to-[#9c48ea] text-[#360061] font-bold rounded-2xl px-10 py-4 hover:brightness-110 hover:shadow-[0_0_30px_rgba(204,151,255,0.4)] transition-all disabled:opacity-50 min-w-[220px]"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin text-[#360061]" /> : <Sparkles className="w-5 h-5 text-[#360061]" />}
                    {isGenerating ? "Synthesizing Source..." : "Extract Frames"}
                  </button>
               </div>
            </section>

            {/* AI Generator Spinner */}
            {isGenerating && generatedVideos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 transform transition-all">
                  <div className="relative mb-8">
                    <Loader2 className="w-16 h-16 animate-spin text-[#cc97ff] drop-shadow-[0_0_15px_rgba(204,151,255,0.6)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#fed01b] blur-[15px] rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Alchemist is processing data shards...</h3>
                  <p className="text-[#adaaaa] text-sm">Identifying viral retention peaks. Do not close this window.</p>
                </div>
            )}

            {/* Rendered Nodes Array */}
            {generatedVideos.length > 0 && (
              <div className="space-y-10">
                 <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                   <div className="w-1.5 h-8 bg-[#fed01b] rounded-full shadow-[0_0_15px_rgba(254,208,27,0.8)]" /> 
                   Extracted Sequences ({generatedVideos.length})
                 </h2>
                 
                 <div className="grid gap-10">
                    {generatedVideos.map((vid, idx) => (
                       <motion.div
                         initial={{ opacity: 0, y: 30 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                         key={idx}
                         className="flex flex-col xl:flex-row gap-10 bg-[#131313] p-8 lg:p-10 rounded-[2.5rem] border border-[#262626] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                       >
                         {/* Card Internal Glow */}
                         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#cc97ff]/5 blur-[100px] pointer-events-none rounded-full" />
                         
                         {/* Left: Script Breakdown */}
                         <div className="flex-1 space-y-8 relative z-10">
                            <h3 className="text-3xl font-black tracking-tighter leading-tight pr-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#adaaaa] drop-shadow-md">{vid.title}</h3>
                            <div className="space-y-6">
                               {vid.script.map((s:any, i:number) => (
                                  <div key={i} className="pl-6 border-l-2 border-[#262626] hover:border-[#cc97ff] transition-colors relative group py-2">
                                     <div className="absolute -left-[6px] top-4 w-2.5 h-2.5 rounded-full bg-[#131313] border-2 border-[#cc97ff] group-hover:bg-[#cc97ff] group-hover:shadow-[0_0_15px_rgba(204,151,255,0.8)] transition-all" />
                                     <p className="text-[#fcf8f8] text-lg leading-relaxed mb-4 font-medium">"{s.text}"</p>
                                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#262626]/50 rounded-lg border border-[#494847]/50 backdrop-blur-sm">
                                        <Sparkles className="w-3 h-3 text-[#fed01b]" />
                                        <span className="text-[11px] uppercase tracking-wider font-bold text-[#fed01b]">Visual Cue: {s.imagePrompt}</span>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>

                         {/* Right: The Phone Frame & Actions */}
                         <div className="xl:w-[420px] flex flex-col gap-6 relative z-10">
                            {renderingVideoIndex !== idx ? (
                               <div className="h-full min-h-[400px] border border-dashed border-[#494847] rounded-[2.5rem] flex flex-col items-center justify-center p-10 bg-[#0e0e0e]/40 relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#cc97ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  <Video className="w-16 h-16 text-[#494847] mb-6 group-hover:text-[#cc97ff] transition-colors duration-500" />
                                  <p className="text-center text-[#adaaaa] text-sm mb-8 leading-relaxed">JSON Script mapped successfully. Ready to deploy ElevenLabs synthesized vocals and Pexels stock assets.</p>
                                  <button
                                     onClick={() => handleRenderVideo(idx)}
                                     className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-[#777575]/30 font-bold transition-all flex justify-center items-center gap-2 text-[#cc97ff] hover:border-[#cc97ff]/50 hover:shadow-[0_0_20px_rgba(204,151,255,0.1)] relative z-10"
                                  >
                                      <Wand2 className="w-5 h-5" /> Compile to Video
                                  </button>
                               </div>
                            ) : (
                               <div className="flex flex-col gap-4">
                                  
                                  {/* Glass Phone Player */}
                                  <div className="w-full bg-[#000] border-4 border-[#262626] rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(204,151,255,0.15)] relative ring-1 ring-white/10">
                                      {!videoAudioUrls[idx] ? (
                                         <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#0e0e0e]">
                                            <Loader2 className="w-12 h-12 animate-spin text-[#cc97ff] mb-6" />
                                            <p className="text-xs uppercase tracking-widest font-bold text-[#cc97ff] animate-pulse">Synthesizing Vocal Node...</p>
                                         </div>
                                      ) : (
                                         <div className="w-full aspect-[9/16] bg-[#050505]">
                                            <Player
                                               component={TikTokComposition}
                                               inputProps={{ script: vid.script, audioUrl: videoAudioUrls[idx], durationInFrames: audioDurations[idx] ? Math.max(30, Math.ceil(audioDurations[idx] * 30)) : 1800 }}
                                               durationInFrames={audioDurations[idx] ? Math.max(30, Math.ceil(audioDurations[idx] * 30)) : 1800}
                                               fps={30}
                                               compositionWidth={1080}
                                               compositionHeight={1920}
                                               style={{ width: '100%', height: '100%' }}
                                               controls
                                               autoPlay
                                               loop
                                            />
                                         </div>
                                      )}
                                  </div>

                                  {/* Download Triggers */}
                                  {videoAudioUrls[idx] && (
                                     <div className="flex flex-col gap-3 mt-4">
                                        <button 
                                          onClick={() => handleDownload(idx, 'mp4')}
                                          disabled={isDownloading !== null}
                                          className="flex justify-center items-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-[#cc97ff] to-[#9c48ea] text-[#360061] font-black shadow-[0_0_20px_rgba(204,151,255,0.3)] hover:brightness-110 disabled:opacity-50 transition-all text-sm tracking-wide"
                                        >
                                           {isDownloading === 'mp4' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                           {isDownloading === 'mp4' ? "Compiling Node..." : "DOWNLOAD H.264 (MP4)"}
                                        </button>
                                        <button 
                                          onClick={() => handleDownload(idx, 'mov')}
                                          disabled={isDownloading !== null}
                                          className="flex justify-center items-center gap-2 py-3 rounded-2xl bg-[#0e0e0e] text-[#adaaaa] border border-[#262626] hover:border-[#777575] hover:text-white font-bold disabled:opacity-50 transition-all text-xs uppercase tracking-widest"
                                        >
                                           {isDownloading === 'mov' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                           {isDownloading === 'mov' ? "Rendering ProRES..." : "Download ProRes (MOV)"}
                                        </button>
                                     </div>
                                  )}
                               </div>
                            )}
                         </div>

                       </motion.div>
                    ))}
                 </div>

                 {/* Infinity Scroll / Next Block trigger */}
                 <div className="pt-16 pb-8 text-center flex justify-center">
                    <button 
                       onClick={() => handleGenerate(true)}
                       disabled={isGenerating}
                       className="group relative flex items-center justify-center w-full max-w-sm disabled:opacity-50"
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fed01b]/20 to-transparent w-full h-full opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-xl" />
                       <div className="flex items-center gap-4 bg-[#131313] border border-[#262626] group-hover:border-[#fed01b]/50 px-8 py-4 rounded-full transition-all relative z-10 w-full justify-center">
                          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin text-[#fed01b]" /> : <Rocket className="w-5 h-5 text-[#fed01b]" />}
                          <span className="text-white font-bold text-sm tracking-wide">EXTRACT TIMELINE SHARDS</span>
                       </div>
                    </button>
                 </div>

              </div>
            )}
         </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#0e0e0e] flex items-center justify-center text-[#adaaaa]">Waking up Alchemist protocols...</div>}>
       <DashboardContent />
    </Suspense>
  );
}
