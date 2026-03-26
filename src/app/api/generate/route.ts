import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import * as cheerio from "cheerio";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    // 1. Authenticate Request
    const { userId } = await auth();

    const { url, chunkIndex = 0 } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let extractedText = "";

    // 2. YouTube Extraction
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        extractedText = transcript.map(t => t.text).join(" ");
      } catch (err) {
        console.error("YouTube Error:", err);
        return NextResponse.json({ error: "Failed to extract YouTube transcript. It might be disabled." }, { status: 400 });
      }
    } 
    // 3. Blog/Article Extraction
    else {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch article");
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Remove scripts, styles, navs, footers, etc to get clean text
        $("script, style, nav, footer, header, aside, .ad, .advertisement").remove();
        extractedText = $("body").text().replace(/\s+/g, " ").trim();
      } catch (err) {
        console.error("Scraping Error:", err);
        return NextResponse.json({ error: "Failed to scrape article text" }, { status: 400 });
      }
    }

    // Process text into scalable chunks of 4000 characters
    const chunkSize = 4000;
    const totalChunks = Math.ceil(extractedText.length / chunkSize);

    if (chunkIndex >= totalChunks) {
       return NextResponse.json({ error: "No more content to generate videos from! We've exhausted the source material." }, { status: 400 });
    }

    const currentTextChunk = extractedText.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);

    // 4. OpenAI Script Generation
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Cost-effective model for the POC
        response_format: { type: "json_object" },
        messages: [
           { 
             role: "system", 
             content: `You are a top-tier TikTok and Reels scriptwriter specialized in high-retention, value-dense educational content. Your only output format must be valid JSON matching exactly this structure: { "videos": [ { "title": "Catchy Title", "script": [{ "text": "Spoken sentence", "imagePrompt": "Visual description" }] } ] }`
           },
           {
             role: "user",
             content: `Analyze the following excerpt from a larger video/blog.
CRITICAL RULES FOR SCRIPT GNERATION:
1. ABSOLUTELY NO generic hooks/intros like "Ready to dive in?", "Let's explore", or "Welcome to".
2. COMPLETELY IGNORE all sponsored ads, upselling, and basic descriptive summaries (e.g. "DaVinci is a great tool").
3. NEVER write a script that just "summarizes" the video.
4. ONLY extract deeply valuable, counter-intuitive, highly specific, or mind-blowing facts and actionable tutorials.
5. If the excerpt does NOT contain enough highly valuable specific information, DO NOT generate a video for it.
6. Get straight to the point in the first second. Make it punchy and viral.
7. CRITICAL FOR PEXELS API: The "imagePrompt" field MUST BE exactly 1-2 generic search keywords (e.g., "laptop", "money", "developer"). DO NOT write detailed sentences!

TEXT EXCERPT:
${currentTextChunk}`
           }
        ]
      });

      const aiResponse = completion.choices[0].message.content;
      if (!aiResponse) throw new Error("No response from OpenAI");

      const parsedResponse = JSON.parse(aiResponse);

      const fallbackImages = [
         "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
         "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
         "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg",
         "https://images.pexels.com/photos/733852/pexels-photo-733852.jpeg",
         "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg"
      ];

      for (const vid of parsedResponse.videos) {
         for (const scene of vid.script) {
            // Guarantee an image is applied Even if Pexels fails
            scene.backgroundUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
            
            if (process.env.PEXELS_API_KEY) {
                try {
                  const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(scene.imagePrompt)}&per_page=1&orientation=portrait`, {
                     headers: { Authorization: process.env.PEXELS_API_KEY }
                  });
                  if (pexelsRes.ok) {
                     const pexelsData = await pexelsRes.json();
                     if (pexelsData.photos && pexelsData.photos.length > 0) {
                        scene.backgroundUrl = pexelsData.photos[0].src.large2x || pexelsData.photos[0].src.original; 
                     }
                  }
                } catch(e) { }
            }
         }
      }

      // Return the final generated scripts array
      return NextResponse.json({ 
        success: true, 
        videos: parsedResponse.videos
      });

    } catch (llmError) {
       console.error("OpenAI Error:", llmError);
       return NextResponse.json({ error: "Failed to generate AI script from the text" }, { status: 500 });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
