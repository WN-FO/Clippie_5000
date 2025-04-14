import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, STORAGE_BUCKETS, getStorageUrl } from '@/lib/supabase';

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
export async function getVideoInfo(videoUrl: string) {
  try {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    return {
      format: blob.type,
      size: blob.size,
      duration: 0, // We'll need to implement duration detection differently
    };
  } catch (error) {
    throw new Error(`Error getting video info: ${error}`);
  }
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
  try {
    // Generate unique filename
    const clipPath = `clips/${uuidv4()}.${outputFormat}`;
    
    // Get the selected resolution
    const targetRes = RESOLUTIONS[resolution as keyof typeof RESOLUTIONS] || RESOLUTIONS['720p'];
    
    // Create a request to our video processing API
    const response = await fetch('/api/process-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl,
        startTime,
        endTime,
        resolution: targetRes,
        watermark,
        outputFormat,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process video');
    }
    
    const { clipUrl } = await response.json();
    return clipUrl;
  } catch (error) {
    throw new Error(`Error extracting clip: ${error}`);
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
  const uploadPath = `subtitles/${subtitleFilename}`;
  
  try {
    // Upload to Supabase
    const { data, error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKETS.SUBTITLES)
      .upload(uploadPath, new Blob([srtContent], { type: 'text/srt' }), {
        contentType: 'text/srt',
        upsert: true,
      });
    
    if (error) {
      throw new Error(`Error uploading subtitles: ${error.message}`);
    }
    
    return uploadPath;
  } catch (error) {
    throw new Error(`Error generating subtitles: ${error}`);
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
  position: string = 'bottom',
  outputFormat: string = 'mp4'
) {
  try {
    // Generate unique filename
    const outputPath = `clips/${uuidv4()}.${outputFormat}`;
    
    // Create a request to our video processing API
    const response = await fetch('/api/process-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clipUrl,
        subtitlesUrl,
        fontFamily,
        fontSize,
        textColor,
        backgroundColor,
        position,
        outputFormat,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process video');
    }
    
    const { clipUrl: processedUrl } = await response.json();
    return processedUrl;
  } catch (error) {
    throw new Error(`Error burning subtitles: ${error}`);
  }
} 