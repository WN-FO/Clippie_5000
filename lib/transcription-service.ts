import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, STORAGE_BUCKETS } from '@/lib/supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create temp directory if it doesn't exist
const TMP_DIR = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Transcribe an audio file using OpenAI's Whisper API
export async function transcribeAudio(audioFilePath: string, language: string = 'en') {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model: 'whisper-1',
    language,
    response_format: 'json',
  });
  
  return transcription.text;
}

// Extract audio from video and transcribe it
export async function transcribeVideo(videoUrl: string, language: string = 'en') {
  // Generate temporary filenames
  const videoFilename = `video-${uuidv4()}.mp4`;
  const audioFilename = `audio-${uuidv4()}.mp3`;
  const videoPath = path.join(TMP_DIR, videoFilename);
  const audioPath = path.join(TMP_DIR, audioFilename);
  
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
    fs.writeFileSync(videoPath, Buffer.from(await data.arrayBuffer()));
    
    // Extract audio using ffmpeg
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegStatic = require('ffmpeg-static');
    
    if (ffmpegStatic) {
      ffmpeg.setFfmpegPath(ffmpegStatic);
    }
    
    // Return a promise that resolves when the audio extraction is complete
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .output(audioPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run();
    });
    
    // Transcribe the audio
    const transcription = await transcribeAudio(audioPath, language);
    
    // Clean up temporary files
    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);
    
    return transcription;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    throw error;
  }
}

// Extract audio from a specific clip of a video and transcribe it
export async function transcribeClip(
  videoUrl: string,
  startTime: number,
  endTime: number,
  language: string = 'en'
) {
  // Generate temporary filenames
  const videoFilename = `video-${uuidv4()}.mp4`;
  const clipFilename = `clip-${uuidv4()}.mp4`;
  const audioFilename = `audio-${uuidv4()}.mp3`;
  const videoPath = path.join(TMP_DIR, videoFilename);
  const clipPath = path.join(TMP_DIR, clipFilename);
  const audioPath = path.join(TMP_DIR, audioFilename);
  
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
    fs.writeFileSync(videoPath, Buffer.from(await data.arrayBuffer()));
    
    // Extract clip using ffmpeg
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegStatic = require('ffmpeg-static');
    
    if (ffmpegStatic) {
      ffmpeg.setFfmpegPath(ffmpegStatic);
    }
    
    // Extract the clip
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .output(clipPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run();
    });
    
    // Extract audio from the clip
    await new Promise<void>((resolve, reject) => {
      ffmpeg(clipPath)
        .output(audioPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run();
    });
    
    // Transcribe the audio
    const transcription = await transcribeAudio(audioPath, language);
    
    // Clean up temporary files
    fs.unlinkSync(videoPath);
    fs.unlinkSync(clipPath);
    fs.unlinkSync(audioPath);
    
    return transcription;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (fs.existsSync(clipPath)) fs.unlinkSync(clipPath);
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    throw error;
  }
} 