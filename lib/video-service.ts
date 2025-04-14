import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
const ffmpeg = require('fluent-ffmpeg');
import ffmpegStatic from 'ffmpeg-static';
import { supabaseAdmin, STORAGE_BUCKETS, getStorageUrl } from '@/lib/supabase';

// Configure ffmpeg to use the static binary
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const execPromise = promisify(exec);

// Create temp directory if it doesn't exist
const TMP_DIR = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Social media platform formats
export const EXPORT_FORMATS = {
  TIKTOK: {
    name: 'TikTok',
    width: 1080,
    height: 1920,
    resolution: '1080x1920',
    aspectRatio: '9:16',
  },
  INSTAGRAM_REELS: {
    name: 'Instagram Reels',
    width: 1080,
    height: 1920,
    resolution: '1080x1920',
    aspectRatio: '9:16',
  },
  INSTAGRAM_FEED: {
    name: 'Instagram Feed',
    width: 1080,
    height: 1080,
    resolution: '1080x1080',
    aspectRatio: '1:1',
  },
  YOUTUBE_SHORTS: {
    name: 'YouTube Shorts',
    width: 1080,
    height: 1920,
    resolution: '1080x1920',
    aspectRatio: '9:16',
  },
};

// Resolution options
export const RESOLUTIONS = {
  '720p': {
    width: 720,
    height: 1280,
    name: '720p',
  },
  '1080p': {
    width: 1080, 
    height: 1920,
    name: '1080p',
  },
  '4K': {
    width: 2160,
    height: 3840,
    name: '4K',
  },
};

// Helper to get video information
export async function getVideoInfo(filepath: string) {
  return new Promise<any>((resolve, reject) => {
    ffmpeg.ffprobe(filepath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
}

// Helper to extract clip from video
export async function extractClip(
  videoUrl: string,
  startTime: number,
  endTime: number,
  resolution: string = '720p',
  watermark: boolean = false,
  outputFormat: string = 'mp4'
) {
  // Generate temporary filenames
  const inputFilename = `input-${uuidv4()}.mp4`;
  const outputFilename = `output-${uuidv4()}.${outputFormat}`;
  const inputPath = path.join(TMP_DIR, inputFilename);
  const outputPath = path.join(TMP_DIR, outputFilename);
  
  try {
    // Download video from Supabase
    const { data, error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKETS.VIDEOS)
      .download(videoUrl.replace(`${STORAGE_BUCKETS.VIDEOS}/`, ''));
    
    if (error || !data) {
      throw new Error(`Error downloading video: ${error?.message}`);
    }
    
    // Write the video to a temp file
    fs.writeFileSync(inputPath, new Uint8Array(await data.arrayBuffer()));
    
    // Get the selected resolution
    const targetRes = RESOLUTIONS[resolution as keyof typeof RESOLUTIONS] || RESOLUTIONS['720p'];
    
    // Extract the clip
    let command = ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .size(`${targetRes.width}x${targetRes.height}`)
      .outputOptions('-c:v libx264')
      .outputOptions('-preset fast')
      .outputOptions('-crf 22');
    
    // Add watermark if needed
    if (watermark) {
      // Create watermark text
      command = command
        .outputOptions([
          '-vf drawtext=text=\'Clippie\':fontcolor=white:fontsize=24:alpha=0.7:x=10:y=10',
        ]);
    }
    
    // Return a promise that resolves when the processing is complete
    return new Promise<string>((resolve, reject) => {
      command
        .output(outputPath)
        .on('end', async () => {
          try {
            // Upload the processed clip to Supabase
            const fileBuffer = new Uint8Array(fs.readFileSync(outputPath));
            const clipPath = `clips/${outputFilename}`;
            
            const { data, error } = await supabaseAdmin
              .storage
              .from(STORAGE_BUCKETS.CLIPS)
              .upload(clipPath, fileBuffer, {
                contentType: `video/${outputFormat}`,
                upsert: true,
              });
            
            if (error) {
              throw new Error(`Error uploading clip: ${error.message}`);
            }
            
            // Clean up temporary files
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            
            // Return the Supabase URL to the clip
            resolve(clipPath);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          // Clean up on error
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          reject(err);
        })
        .run();
    });
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    throw error;
  }
}

// Helper to generate SRT subtitles from transcription
export async function generateSubtitles(
  transcription: string,
  clipDuration: number,
) {
  const words = transcription.trim().split(/\s+/);
  const wordsPerLine = 7; // Adjust for readability
  const secondsPerLine = 3; // Adjust timing
  
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '));
  }
  
  let srtContent = '';
  
  lines.forEach((line, index) => {
    const startTimeSeconds = Math.min(index * secondsPerLine, clipDuration - secondsPerLine);
    const endTimeSeconds = Math.min(startTimeSeconds + secondsPerLine, clipDuration);
    
    const startTime = formatSrtTime(startTimeSeconds);
    const endTime = formatSrtTime(endTimeSeconds);
    
    srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${line}\n\n`;
  });
  
  // Generate unique filename
  const subtitleFilename = `subtitles-${uuidv4()}.srt`;
  const subtitlePath = path.join(TMP_DIR, subtitleFilename);
  
  // Write SRT file
  fs.writeFileSync(subtitlePath, srtContent);
  
  try {
    // Upload to Supabase
    const fileBuffer = new Uint8Array(fs.readFileSync(subtitlePath));
    const uploadPath = `subtitles/${subtitleFilename}`;
    
    const { data, error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKETS.SUBTITLES)
      .upload(uploadPath, fileBuffer, {
        contentType: 'text/srt',
        upsert: true,
      });
    
    if (error) {
      throw new Error(`Error uploading subtitles: ${error.message}`);
    }
    
    // Clean up
    fs.unlinkSync(subtitlePath);
    
    return uploadPath;
  } catch (error) {
    if (fs.existsSync(subtitlePath)) fs.unlinkSync(subtitlePath);
    throw error;
  }
}

// Helper to format seconds to SRT time format (HH:MM:SS,MMM)
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

// Helper to burn subtitles into video
export async function burnSubtitles(
  clipUrl: string,
  subtitlesUrl: string,
  fontFamily: string = 'Arial',
  fontSize: number = 24,
  textColor: string = 'white',
  backgroundColor: string = 'black@0.5',
  position: string = 'bottom', // top, middle, bottom
  outputFormat: string = 'mp4'
) {
  // Generate temporary filenames
  const inputFilename = `input-${uuidv4()}.${outputFormat}`;
  const subtitlesFilename = `subtitles-${uuidv4()}.srt`;
  const outputFilename = `output-${uuidv4()}.${outputFormat}`;
  
  const inputPath = path.join(TMP_DIR, inputFilename);
  const subtitlesPath = path.join(TMP_DIR, subtitlesFilename);
  const outputPath = path.join(TMP_DIR, outputFilename);
  
  try {
    // Download clip from Supabase
    const { data: clipData, error: clipError } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKETS.CLIPS)
      .download(clipUrl.replace(`${STORAGE_BUCKETS.CLIPS}/`, ''));
    
    if (clipError || !clipData) {
      throw new Error(`Error downloading clip: ${clipError?.message}`);
    }
    
    // Download subtitles from Supabase
    const { data: subtitlesData, error: subtitlesError } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKETS.SUBTITLES)
      .download(subtitlesUrl.replace(`${STORAGE_BUCKETS.SUBTITLES}/`, ''));
    
    if (subtitlesError || !subtitlesData) {
      throw new Error(`Error downloading subtitles: ${subtitlesError?.message}`);
    }
    
    // Write files to temp directory
    fs.writeFileSync(inputPath, new Uint8Array(await clipData.arrayBuffer()));
    fs.writeFileSync(subtitlesPath, new Uint8Array(await subtitlesData.arrayBuffer()));
    
    // Determine subtitle position (y value)
    let positionValue = '(h-th-50)'; // Default to bottom
    if (position === 'top') {
      positionValue = '50';
    } else if (position === 'middle') {
      positionValue = '(h-th)/2';
    }
    
    // Burn subtitles into video
    return new Promise<string>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-vf', `subtitles=${subtitlesPath}:force_style='FontName=${fontFamily},FontSize=${fontSize},PrimaryColour=${textColor},BackColour=${backgroundColor},Alignment=2,MarginV=20'`,
        ])
        .output(outputPath)
        .on('end', async () => {
          try {
            // Upload the processed clip to Supabase
            const fileBuffer = new Uint8Array(fs.readFileSync(outputPath));
            const clipPath = `clips/${outputFilename}`;
            
            const { data, error } = await supabaseAdmin
              .storage
              .from(STORAGE_BUCKETS.CLIPS)
              .upload(clipPath, fileBuffer, {
                contentType: `video/${outputFormat}`,
                upsert: true,
              });
            
            if (error) {
              throw new Error(`Error uploading final clip: ${error.message}`);
            }
            
            // Clean up temporary files
            fs.unlinkSync(inputPath);
            fs.unlinkSync(subtitlesPath);
            fs.unlinkSync(outputPath);
            
            // Return the Supabase URL to the clip
            resolve(clipPath);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          // Clean up on error
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(subtitlesPath)) fs.unlinkSync(subtitlesPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          reject(err);
        })
        .run();
    });
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(subtitlesPath)) fs.unlinkSync(subtitlesPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    throw error;
  }
} 