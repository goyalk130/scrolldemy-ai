"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Link, Video, Rocket, Wand2 } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const { isLoaded, userId } = useAuth();
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleGenerateClick = () => {
    if (!url) return alert("Please enter a URL first");
    router.push(`/dashboard?url=${encodeURIComponent(url)}`);
  };

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white overflow-x-hidden selection:bg-[#A855F7]/30">
      {/* 1. Cinematic Ambient Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#842bd2]/10 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[#f1c400]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-[#ddb7ff]/5 rounded-full blur-[120px]" />
      </div>

      {/* 2. Glassmorphic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-xl border-b border-[#353534]/50 bg-[#0e0e0e]/60">
        <div className="flex items-center gap-3 font-black text-2xl tracking-tighter" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <div className="relative">
             <Wand2 className="w-6 h-6 text-[#ddb7ff] relative z-10" />
             <div className="absolute inset-0 bg-[#ddb7ff] blur-[10px] opacity-50" />
          </div>
          Scrolldemy
        </div>
        <div>
          {isLoaded && !userId && (
            <SignInButton mode="modal">
              <button className="text-sm font-bold tracking-wider uppercase bg-[#1c1b1b] hover:bg-[#201f1f] border border-[#4d4354] px-6 py-2.5 rounded-full transition-all text-[#ddb7ff] shadow-[0_0_15px_rgba(221,183,255,0.05)] hover:shadow-[0_0_20px_rgba(221,183,255,0.15)] hover:border-[#ddb7ff]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Sign In
              </button>
            </SignInButton>
          )}
          {isLoaded && userId && (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="hidden md:flex text-sm font-bold tracking-wider uppercase bg-[#1c1b1b] hover:bg-[#201f1f] border border-[#4d4354] px-6 py-2.5 rounded-full transition-all text-[#fed01b] hover:border-[#fed01b] shadow-[0_0_15px_rgba(254,208,27,0.05)] hover:shadow-[0_0_20px_rgba(254,208,27,0.15)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Enter Studio
              </button>
              <UserButton />
            </div>
          )}
        </div>
      </header>

      {/* 3. The Hero Stage */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[100vh] px-4 pt-32 pb-20"
      >
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
           className="text-center max-w-6xl w-full flex flex-col items-center relative"
        >
           {/* Floating abstract Glass element behind text */}
           <motion.div 
             animate={{ y: [0, -20, 0], rotateZ: [0, 2, -2, 0] }}
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-32 -left-20 w-64 h-64 bg-[#353534]/40 backdrop-blur-3xl rounded-[3rem] border border-[#4d4354]/30 -z-10 shadow-[0_24px_48px_-12px_rgba(168,85,247,0.15)] hidden md:block" 
           />
           <motion.div 
             animate={{ y: [0, 30, 0], rotateZ: [0, -3, 3, 0] }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-20 -right-10 w-48 h-48 bg-[#353534]/40 backdrop-blur-3xl rounded-full border border-[#4d4354]/30 -z-10 shadow-[0_24px_48px_-12px_rgba(254,208,27,0.1)] hidden md:block" 
           />

           <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#ddb7ff]/20 bg-[#1c1b1b]/80 backdrop-blur-md mb-10 shadow-[0_0_20px_rgba(221,183,255,0.1)] mt-20 md:mt-0">
             <div className="w-2 h-2 rounded-full bg-[#fed01b] animate-pulse" />
             <span className="text-xs uppercase tracking-widest font-bold text-[#ddb7ff]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Scrolldemy v2.0 Architecture</span>
           </div>

           <h1 className="text-6xl md:text-[5.5rem] lg:text-[7rem] font-black tracking-tighter mb-8 leading-[1]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', textWrap: 'balance' }}>
             Convert Long-Form content to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ddb7ff] to-[#b76dff] drop-shadow-[0_0_30px_rgba(221,183,255,0.4)]">Viral Video.</span>
           </h1>

           <p className="text-xl md:text-2xl text-[#cfc2d6] max-w-3xl mx-auto mb-16 leading-relaxed font-medium" style={{ textWrap: 'balance' }}>
             Paste a YouTube or Blog link and let the Alchemist handle the hook, the script, the voiceover, and the native cinematic rendering. In seconds.
           </p>

           <div className="w-full max-w-3xl relative z-20 flex flex-col items-center gap-8">
              {/* Alchemist Prompt Bar */}
              <div className="relative w-full group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-[#ddb7ff] to-[#b76dff] rounded-full blur-[20px] opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                 <div className="relative flex flex-col sm:flex-row items-center bg-[#0e0e0e] border border-[#ddb7ff]/30 focus-within:border-[#ddb7ff] rounded-full p-2 sm:pl-8 shadow-2xl transition-colors">
                    <Link className="text-[#988d9f] w-6 h-6 flex-shrink-0 hidden sm:block" />
                    <input 
                       type="text" 
                       value={url}
                       onChange={(e) => setUrl(e.target.value)}
                       placeholder="Paste YouTube or Blog URL here..." 
                       className="bg-transparent border-none outline-none text-white px-6 py-4 w-full placeholder:text-[#4d4354] text-lg font-mono tracking-wide"
                       style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    />
                    <button 
                       onClick={handleGenerateClick}
                       className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-br from-[#ddb7ff] to-[#b76dff] text-[#400071] font-black text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(221,183,255,0.3)] mt-2 sm:mt-0 flex-shrink-0"
                       style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                       Launch Engine
                    </button>
                 </div>
              </div>
              
              {/* Secondary Ghost CTA */}
              <button 
                 onClick={() => {
                   document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="flex items-center gap-2 group px-8 py-3 rounded-full border border-[#ffe392]/20 hover:border-[#ffe392]/50 text-[#ffe392] font-semibold text-sm transition-all"
                 style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                 Explore Tech Stack
                 <Wand2 className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
           </div>
        </motion.div>
      </motion.section>

      {/* 4. Organic Asymmetrical Features Board */}
      <section id="features" className="relative z-10 py-32 md:py-48 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-32">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-[#cfc2d6]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
               The Workflow Engine
            </h2>
            <p className="text-[#988d9f] text-lg font-mono uppercase tracking-widest" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Fully Autonomous Architecture</p>
         </div>

         <div className="relative space-y-32 md:space-y-48">
            
            {/* Feature 1: The Alchemist */}
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
               className="flex flex-col md:flex-row items-center gap-12 md:gap-24"
            >
               <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-[#ddb7ff]/10 blur-[80px] rounded-full" />
                  <div className="relative z-10 bg-[#201f1f] border border-[#4d4354]/50 rounded-[3rem] p-12 aspect-square flex flex-col justify-between shadow-[0_24px_48px_-12px_rgba(168,85,247,0.15)] overflow-hidden group">
                     <div className="absolute -right-8 -top-8 w-64 h-64 bg-gradient-to-bl from-[#ddb7ff]/20 to-transparent rounded-full blur-2xl group-hover:bg-[#ddb7ff]/30 transition-all duration-700" />
                     <Rocket className="w-16 h-16 text-[#ddb7ff]" />
                     <div>
                        <div className="text-[#ddb7ff] font-mono text-sm tracking-widest mb-4 opacity-70">PHASE 01</div>
                        <h3 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] leading-tight text-white mb-2">The Alchemist Extractor</h3>
                     </div>
                  </div>
               </div>
               <div className="w-full md:w-1/2 space-y-6">
                  <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">Extracting viral gems with neural precision.</h3>
                  <p className="text-xl text-[#988d9f] leading-relaxed">Paste a link. We bypass the noise, analyze the transcript, and extract the absolute maximum value segments optimized specifically for high-retention TikTok curves.</p>
               </div>
            </motion.div>

            {/* Feature 2: Voice Synthesis (Asymmetrical Right) */}
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
               className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24"
            >
               <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-[#ffe392]/10 blur-[80px] rounded-full" />
                  <div className="relative z-10 bg-[#201f1f] border border-[#4d4354]/50 rounded-[3rem] p-12 aspect-square flex flex-col justify-between shadow-[0_24px_48px_-12px_rgba(254,208,27,0.1)] overflow-hidden group">
                     <div className="absolute -left-8 -bottom-8 w-64 h-64 bg-gradient-to-tr from-[#ffe392]/20 to-transparent rounded-full blur-2xl group-hover:bg-[#ffe392]/30 transition-all duration-700" />
                     <Video className="w-16 h-16 text-[#ffe392]" />
                     <div>
                        <div className="text-[#ffe392] font-mono text-sm tracking-widest mb-4 opacity-70">PHASE 02</div>
                        <h3 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] leading-tight text-white mb-2">ElevenLabs Synthesis</h3>
                     </div>
                  </div>
               </div>
               <div className="w-full md:w-1/2 space-y-6">
                  <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">Human-grade audio in milliseconds.</h3>
                  <p className="text-xl text-[#988d9f] leading-relaxed">Integrated directly with the ElevenLabs Turbo v2.5 models. Emotional, breathing, flawlessly timed voiceovers perfectly mapped over your script.</p>
               </div>
            </motion.div>

            {/* Feature 3: Chromium Rendering */}
            <motion.div 
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
               className="flex flex-col md:flex-row items-center gap-12 md:gap-24"
            >
               <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-[#f8acff]/10 blur-[80px] rounded-full" />
                  <div className="relative z-10 bg-[#201f1f] border border-[#4d4354]/50 rounded-[3rem] p-12 aspect-square flex flex-col justify-between shadow-[0_24px_48px_-12px_rgba(248,172,255,0.15)] overflow-hidden group">
                     <div className="absolute right-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-[#f8acff]/20 to-transparent blur-2xl group-hover:h-3/4 transition-all duration-1000" />
                     <Wand2 className="w-16 h-16 text-[#f8acff]" />
                     <div>
                        <div className="text-[#f8acff] font-mono text-sm tracking-widest mb-4 opacity-70">PHASE 03</div>
                        <h3 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] leading-tight text-white mb-2">Native Chromium Engine</h3>
                     </div>
                  </div>
               </div>
               <div className="w-full md:w-1/2 space-y-6">
                  <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">Blazing fast cinematic frame compilation.</h3>
                  <p className="text-xl text-[#988d9f] leading-relaxed">Our advanced Remotion cluster boots headless browsers, compiles NextJS React code into exact MP4 and Apple ProRes encoded chunks, allowing actual physical video downloads directly to your device.</p>
               </div>
            </motion.div>

         </div>
      </section>

      {/* 5. Terminal Footer CTA */}
      <section className="relative z-10 py-40 border-t border-[#2a2a2a] bg-[#0e0e0e] overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#ddb7ff]/50 to-transparent" />
         
         <div className="text-center max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-12 tracking-tighter" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
               Initiate your first timeline.
            </h2>
            <button 
               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
               className="bg-gradient-to-r from-[#ddb7ff] to-[#b76dff] text-[#400071] font-black rounded-full px-16 py-6 text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(221,183,255,0.4)]"
               style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
               Scroll to Deployment
            </button>
         </div>

         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center pb-8">
            <span className="text-[#4d4354] font-mono text-xs tracking-widest uppercase">Engineered by 'The Alchemist' System</span>
         </div>
      </section>
    </main>
  );
}
