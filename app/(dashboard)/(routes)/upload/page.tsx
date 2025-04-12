"use client";

import { Heading } from "@/components/heading";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

const UploadPage = () => {
  return (
    <div>
      <Heading
        title="Upload Video"
        description="Upload a video to start creating clips"
        icon={Upload}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8 space-y-4">
        <Card className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Upload a video</h2>
              <p className="text-sm text-muted-foreground">
                Upload a video file to get started. You can upload MP4, MOV, AVI, or WebM files up to 500MB.
              </p>
            </div>
            <UploadDropzone />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Video Requirements</h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>Maximum file size: 500MB</li>
            <li>Supported formats: MP4, MOV, AVI, WebM</li>
            <li>Recommended resolution: 1080p or higher</li>
            <li>Aspect ratio: 16:9 recommended</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default UploadPage; 