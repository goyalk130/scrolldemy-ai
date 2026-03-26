import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import util from "util";

const execPromise = util.promisify(exec);

export const maxDuration = 300; // Next.js allow up to 5 mins computing

export async function POST(req: Request) {
  try {
    const props = await req.json();
    const { format = 'mp4', durationInFrames = 1800 } = props;

    const tmpPropsPath = path.join(os.tmpdir(), `remotion-props-${Date.now()}.json`);
    const outPath = path.join(os.tmpdir(), `scrolldemy-export-${Date.now()}.${format}`);

    fs.writeFileSync(tmpPropsPath, JSON.stringify(props));

    console.log("Running Remotion CLI...");
    const framesArg = Math.max(30, Math.ceil(durationInFrames));
    
    // By using the Remotion CLI via child_process, we completely bypass 
    // the severe Next.js Turbopack 'Native Module resolution' crash!
    const { stdout, stderr } = await execPromise(`npx remotion render src/remotion/Root.tsx TikTokComposition ${outPath} --props=${tmpPropsPath} --frames=0-${framesArg - 1}`, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer for safety
    });

    console.log("Remotion logs:", stdout);
    if (stderr) console.log("Remotion warnings:", stderr);

    console.log("Rendering complete. Sending buffer to client.");
    const buffer = fs.readFileSync(outPath);

    return new Response(buffer, {
        headers: {
            "Content-Type": format === 'mp4' ? "video/mp4" : "video/quicktime",
            "Content-Disposition": `attachment; filename="scrolldemy-video.${format}"`,
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    });

  } catch (error: any) {
    console.error("Render Command Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
