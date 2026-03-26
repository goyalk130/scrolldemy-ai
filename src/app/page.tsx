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
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <Wand2 className="w-5 h-5 text-purple-400" />
          Scrolldemy
        </div>
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

      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 pt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Scrolldemy AI Video Engine v1.0</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
            Turn Long Blogs into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
              Scrolling Gold.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Paste any YouTube or Blog URL. Our AI extracts the core ideas, writes a script, adds realistic voiceovers, and generates a TikTok-ready video.
          </p>

          <div className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-[#111] border border-white/10 rounded-full p-2 pl-6 shadow-2xl">
              <Link className="text-gray-500 w-5 h-5 flex-shrink-0" />
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube or Blog URL here..." 
                className="bg-transparent border-none outline-none text-white px-4 py-3 w-full placeholder:text-gray-500"
              />
              <button 
                onClick={handleGenerateClick}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full px-8 py-3 hover:scale-105 transition-transform min-w-[160px]"
              >
                <Wand2 className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* 3D Scroll Features Section */}
      <section className="relative z-10 py-32 px-4 max-w-6xl mx-auto">
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
          <p className="text-gray-400 text-lg">Three steps to viral educational content.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 perspective-[1000px]">
          {[
            {
              icon: <Rocket className="w-8 h-8 text-blue-400" />,
              title: "1. AI Extraction",
              description: "We scrape transcripts and blog posts, automatically filtering out noise to find the core learning moments."
            },
            {
              icon: <Wand2 className="w-8 h-8 text-purple-400" />,
              title: "2. Script & Voice",
              description: "A customized LLM writes a 60-second engaging hook and script, paired with ultra-realistic AI voices."
            },
            {
              icon: <Video className="w-8 h-8 text-pink-400" />,
              title: "3. Auto Rendering",
              description: "Dynamic captions, B-roll footage, and audio are stitched together instantly for you to download."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-8 hover:bg-white/5 hover:-translate-y-2 transition-all duration-300 group shadow-lg"
            >
              <div className="bg-[#1a1a1a] border border-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Futuristic Footer CTA */}
      <section className="relative z-10 py-32 text-center border-t border-white/5 bg-gradient-to-b from-transparent to-purple-900/10">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to automate your learning?</h2>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full px-12 py-4 hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)]">
          Start Generating Free
        </button>
      </section>
    </main>
  );
}
