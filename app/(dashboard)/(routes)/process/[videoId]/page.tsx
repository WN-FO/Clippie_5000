"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactPlayer from "react-player";
import { Heading } from "@/components/heading";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Scissors, Play, Pause, Clock, Save, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { formatTime } from "@/lib/utils";

interface VideoData {
  id: string;
  filename: string;
  storageUrl: string;
  duration: number;
  status: string;
}

const ProcessPage = ({ params }: { params: { videoId: string } }) => {
  const { videoId } = params;
  const router = useRouter();
  const playerRef = useRef<ReactPlayer>(null);
  
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [clipTitle, setClipTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/videos/${videoId}`);
        setVideo(response.data);
        
        // Set default end time to 15 seconds after start or video duration, whichever is shorter
        const defaultEndTime = Math.min(15, response.data.duration);
        setEndTime(defaultEndTime);
        setClipTitle(`Clip from ${response.data.filename}`);
      } catch (error) {
        console.error("Error fetching video:", error);
        setError("Failed to load video data");
        toast.error("Failed to load video data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideo();
  }, [videoId]);
  
  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };
  
  const handlePlayPause = () => {
    setPlaying(!playing);
  };
  
  const handleSetStartTime = () => {
    setStartTime(currentTime);
    if (currentTime >= endTime) {
      // If current time is after end time, adjust end time
      setEndTime(Math.min(currentTime + 15, video?.duration || 0));
    }
  };
  
  const handleSetEndTime = () => {
    setEndTime(currentTime);
    if (currentTime <= startTime) {
      // If current time is before start time, adjust start time
      setStartTime(Math.max(currentTime - 15, 0));
    }
  };
  
  const handleSeek = (time: number) => {
    playerRef.current?.seekTo(time, 'seconds');
  };
  
  const handleCreateClip = async () => {
    if (!video) return;
    
    if (endTime <= startTime) {
      toast.error("End time must be after start time");
      return;
    }
    
    if (endTime - startTime < 3) {
      toast.error("Clip must be at least 3 seconds long");
      return;
    }
    
    if (endTime - startTime > 60) {
      toast.error("Clip cannot be longer than 60 seconds");
      return;
    }
    
    setCreating(true);
    
    try {
      const response = await axios.post("/api/clips", {
        videoId: video.id,
        title: clipTitle,
        startTime,
        endTime,
        resolution: '720p', // Default to 720p for now
        subtitlesEnabled,
      });
      
      toast.success("Clip created successfully");
      
      // Redirect to the clip detail page
      router.push(`/clips/${response.data.id}`);
    } catch (error: any) {
      console.error("Error creating clip:", error);
      if (error.response?.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Failed to create clip");
      }
    } finally {
      setCreating(false);
    }
  };
  
  const clipDuration = endTime - startTime;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-2xl font-bold text-red-500 mb-4">Error</div>
        <div className="text-muted-foreground">{error || "Video not found"}</div>
        <Button className="mt-4" onClick={() => router.push("/videos")}>
          Back to Videos
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <Heading
        title="Create Clip"
        description="Select a segment of your video to create a clip"
        icon={Scissors}
        iconColor="text-orange-700"
        bgColor="bg-orange-700/10"
      />
      
      <div className="px-4 lg:px-8 space-y-4">
        <Card className="p-4">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <ReactPlayer
              ref={playerRef}
              url={video.storageUrl}
              width="100%"
              height="100%"
              playing={playing}
              onProgress={handleProgress}
              progressInterval={100}
              controls={false}
            />
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlayPause}
                className="h-10 w-10"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(video.duration)}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetStartTime}
                className="gap-1"
              >
                <Clock className="h-4 w-4" />
                Set Start
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetEndTime}
                className="gap-1"
              >
                <Clock className="h-4 w-4" />
                Set End
              </Button>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <Label>Clip Range</Label>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>0:00</span>
                <span>{formatTime(video.duration)}</span>
              </div>
              <div className="relative pt-1">
                <Slider
                  value={[startTime, endTime]}
                  min={0}
                  max={video.duration}
                  step={0.1}
                  onValueChange={(values) => {
                    setStartTime(values[0]);
                    setEndTime(values[1]);
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <div>
                  <div className="text-xs text-muted-foreground">Start Time</div>
                  <div className="font-medium">{formatTime(startTime)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="font-medium">{formatTime(clipDuration)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">End Time</div>
                  <div className="font-medium">{formatTime(endTime)}</div>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Clip Title</Label>
              <Input
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
                placeholder="Enter a title for your clip"
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="subtitles"
                checked={subtitlesEnabled}
                onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="subtitles">Generate AI subtitles</Label>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => router.push(`/videos/${videoId}`)}
                disabled={creating}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleCreateClip}
                disabled={creating || startTime >= endTime}
              >
                {creating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Clip
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProcessPage; 