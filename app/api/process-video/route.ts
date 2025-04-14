import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { supabaseAdmin, STORAGE_BUCKETS } from '@/lib/supabase';

const execPromise = promisify(exec);

// Configure ffmpeg to use the static binary
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

// Create temp directory if it doesn't exist
const TMP_DIR = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      videoUrl,
      startTime,
      endTime,
      resolution,
      watermark,
      outputFormat,
      clipUrl,
      subtitlesUrl,
      fontFamily,
      fontSize,
      textColor,
      backgroundColor,
      position,
    } = body;

    // Generate temporary filenames
    const inputFilename = `input-${Date.now()}.mp4`;
    const outputFilename = `output-${Date.now()}.${outputFormat || 'mp4'}`;
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

      // Process video based on operation type
      if (clipUrl && subtitlesUrl) {
        // Burn subtitles operation
        const subtitlesFilename = `subtitles-${Date.now()}.srt`;
        const subtitlesPath = path.join(TMP_DIR, subtitlesFilename);

        // Download subtitles
        const { data: subtitlesData, error: subtitlesError } = await supabaseAdmin
          .storage
          .from(STORAGE_BUCKETS.SUBTITLES)
          .download(subtitlesUrl.replace(`${STORAGE_BUCKETS.SUBTITLES}/`, ''));

        if (subtitlesError || !subtitlesData) {
          throw new Error(`Error downloading subtitles: ${subtitlesError?.message}`);
        }

        // Write subtitles to temp file
        fs.writeFileSync(subtitlesPath, new Uint8Array(await subtitlesData.arrayBuffer()));

        // Determine subtitle position
        let positionValue = '(h-th-50)'; // Default to bottom
        if (position === 'top') {
          positionValue = '50';
        } else if (position === 'middle') {
          positionValue = '(h-th)/2';
        }

        // Burn subtitles
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .outputOptions([
              '-vf', `subtitles=${subtitlesPath}:force_style='FontName=${fontFamily},FontSize=${fontSize},PrimaryColour=${textColor},BackColour=${backgroundColor},Alignment=2,MarginV=20'`,
            ])
            .output(outputPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
        });

        // Clean up subtitles file
        fs.unlinkSync(subtitlesPath);
      } else {
        // Extract clip operation
        let command = ffmpeg(inputPath)
          .setStartTime(startTime)
          .setDuration(endTime - startTime)
          .size(`${resolution.width}x${resolution.height}`)
          .outputOptions('-c:v libx264')
          .outputOptions('-preset fast')
          .outputOptions('-crf 22');

        // Add watermark if needed
        if (watermark) {
          command = command
            .outputOptions([
              '-vf drawtext=text=\'Clippie\':fontcolor=white:fontsize=24:alpha=0.7:x=10:y=10',
            ]);
        }

        // Process video
        await new Promise((resolve, reject) => {
          command
            .output(outputPath)
            .on('end', resolve)
            .on('error', reject)
            .run();
        });
      }

      // Upload processed video to Supabase
      const fileBuffer = new Uint8Array(fs.readFileSync(outputPath));
      const clipPath = `clips/${outputFilename}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from(STORAGE_BUCKETS.CLIPS)
        .upload(clipPath, fileBuffer, {
          contentType: `video/${outputFormat || 'mp4'}`,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Error uploading clip: ${uploadError.message}`);
      }

      // Clean up temporary files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      return NextResponse.json({ clipUrl: clipPath });
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Error processing video: ${error}` },
      { status: 500 }
    );
  }
} 