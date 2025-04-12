// Type declarations for fluent-ffmpeg
declare module 'fluent-ffmpeg' {
  interface FfmpegCommand {
    input(input: string): this;
    output(output: string): this;
    on(event: string, callback: (err: Error | null, data?: any) => void): this;
    run(): this;
    save(outputPath: string): this;
    duration(duration: number): this;
    seekInput(time: number): this;
    seek(time: number): this;
    format(format: string): this;
    size(size: string): this;
    fps(fps: number): this;
    videoBitrate(bitrate: string): this;
    audioBitrate(bitrate: string): this;
    audioChannels(channels: number): this;
    audioFrequency(freq: number): this;
    videoCodec(codec: string): this;
    audioCodec(codec: string): this;
    outputOptions(options: string | string[]): this;
    complexFilter(filters: string | string[]): this;
    addInput(input: string): this;
    addOutput(output: string): this;
    mergeToFile(output: string, tempDir?: string): this;
    ffprobe(callback: (err: Error | null, data?: any) => void): void;
    setStartTime(time: number): this;
    setDuration(duration: number): this;
  }

  function ffmpeg(input?: string): FfmpegCommand;
  namespace ffmpeg {
    function setFfmpegPath(path: string): void;
    function ffprobe(file: string, callback: (err: Error | null, data?: any) => void): void;
  }
  export = ffmpeg;
} 