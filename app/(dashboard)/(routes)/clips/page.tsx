"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/components/heading";
import { Download, Loader2, Share, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { formatTime, formatFileSize, formatDate } from "@/lib/utils";

interface ClipItem {
  id: string;
  title: string;
  videoId: string;
  storageUrl: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: string;
  createdAt: Date;
  video: {
    filename: string;
  };
  transcription?: {
    text: string;
    subtitlesUrl: string;
  };
}

const ClipsPage = () => {
  const router = useRouter();
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClips = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/clips");
        setClips(response.data);
      } catch (error) {
        console.error("Error fetching clips:", error);
        toast.error("Failed to load clips");
      } finally {
        setLoading(false);
      }
    };

    fetchClips();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-500";
      case "processing":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleShare = async (clip: ClipItem) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: clip.title,
          text: 'Check out this clip I created with Clippie!',
          url: clip.storageUrl,
        });
      } else {
        await navigator.clipboard.writeText(clip.storageUrl);
        toast.success("Clip URL copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing clip:", error);
      toast.error("Failed to share clip");
    }
  };

  const handleDownload = (clip: ClipItem) => {
    window.open(clip.storageUrl, '_blank');
  };

  return (
    <div>
      <Heading
        title="My Clips"
        description="View and share your created clips"
        icon={Download}
        iconColor="text-green-600"
        bgColor="bg-green-600/10"
      />

      <div className="px-4 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : clips.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Download className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No clips yet</h3>
            <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
              Create your first clip from one of your videos to share on social media.
            </p>
            <Button onClick={() => router.push("/videos")}>
              View My Videos
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clips.map((clip) => (
              <Card key={clip.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate" title={clip.title}>
                      {clip.title}
                    </CardTitle>
                    <Badge className={getStatusColor(clip.status)}>
                      {clip.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From:</span>
                      <span className="truncate max-w-[200px]" title={clip.video.filename}>
                        {clip.video.filename}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatTime(clip.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time Range:</span>
                      <span>
                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(clip.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtitles:</span>
                      <span>{clip.transcription ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  {clip.status === "ready" ? (
                    <div className="w-full grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(clip)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleShare(clip)}
                        className="flex items-center gap-1"
                      >
                        <Share className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full flex justify-center">
                      <p className="text-sm text-muted-foreground">
                        {clip.status === "processing"
                          ? "Your clip is being processed..."
                          : "There was an error processing your clip."}
                      </p>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClipsPage; 