"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/components/heading";
import { Video, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface VideoItem {
  id: string;
  filename: string;
  storageUrl: string;
  fileSize: number;
  duration: number;
  status: string;
  createdAt: Date;
}

const VideosPage = () => {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/videos");
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast.error("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Heading
          title="My Videos"
          description="Manage your uploaded videos"
          icon={Video}
          iconColor="text-pink-700"
          bgColor="bg-pink-700/10"
        />
        <Button onClick={() => router.push("/upload")} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Upload New
        </Button>
      </div>

      <div className="px-4 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : videos.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Video className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
            <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
              Upload your first video to start creating clips with AI-generated subtitles.
            </p>
            <Button onClick={() => router.push("/upload")}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Video
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate" title={video.filename}>
                      {video.filename}
                    </CardTitle>
                    <Badge className={getStatusColor(video.status)}>
                      {video.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{formatFileSize(video.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="pt-4">
                  <div className="w-full flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/videos/${video.id}`)}
                    >
                      View
                    </Button>
                    {video.status === "ready" && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/process/${video.id}`)}
                      >
                        Create Clip
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage; 