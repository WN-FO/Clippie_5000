"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, FileText, X, Check } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabaseClient, STORAGE_BUCKETS } from '@/lib/supabase';
import { createBrowserClient } from '@supabase/ssr';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_VIDEO_TYPES = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm': ['.webm'],
};

export const UploadDropzone = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [client, setClient] = useState(supabaseClient);

  // Initialize client on the browser side if needed
  useEffect(() => {
    if (typeof window !== 'undefined' && !client) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      const browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
      setClient(browserClient);
    }
  }, [client]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    if (!selectedFile) return;
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadError("File is too large. Maximum size is 500MB.");
      return;
    }
    
    // Clear any previous errors
    setUploadError(null);
    setFile(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_VIDEO_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  const uploadFile = async () => {
    if (!file || !client) {
      if (!client) {
        setUploadError("Upload client not available");
        toast.error("Upload client not available");
      }
      return;
    }
    
    try {
      setUploading(true);
      setProgress(0);
      
      // Generate a unique ID for the file
      const fileId = uuidv4();
      const fileExt = file.name.split('.').pop();
      const fileName = `${fileId}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Setup manual progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);
      
      // Upload to Supabase Storage
      const { data, error } = await client.storage
        .from(STORAGE_BUCKETS.VIDEOS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      // Clear interval and set to 100% when upload is complete
      clearInterval(progressInterval);
      setProgress(100);
      
      if (error) {
        throw error;
      }
      
      // Create database record for the video
      const response = await axios.post('/api/videos', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath: filePath,
      });
      
      setUploadComplete(true);
      toast.success('Video uploaded successfully');
      
      // Redirect to the video page after a short delay
      setTimeout(() => {
        router.push(`/videos/${response.data.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Upload error:', error);
      let message = 'An error occurred during upload';
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadError(null);
    setProgress(0);
    setUploadComplete(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!file ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'} 
            transition-colors duration-200 ease-in-out
            flex flex-col items-center justify-center
            cursor-pointer h-64
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mb-4 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            MP4, MOV, AVI, or WebM (Max 500MB)
          </p>
          {uploadError && (
            <p className="mt-4 text-sm font-medium text-red-500">{uploadError}</p>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
                {" · "}
                {file.type}
              </p>
            </div>
            {!uploading && !uploadComplete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetUpload}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {uploadComplete && (
              <div className="rounded-full bg-green-100 p-1">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            )}
          </div>
          
          {(uploading || uploadComplete) && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="mt-2 text-xs text-gray-500">
                {uploadComplete
                  ? "Upload complete"
                  : `Uploading... ${progress}%`}
              </p>
            </div>
          )}
          
          {!uploading && !uploadComplete && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={uploadFile}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upload Video
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 