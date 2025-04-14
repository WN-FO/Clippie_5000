import { NextResponse } from "next/server";
import { supabaseAdmin, STORAGE_BUCKETS, getStorageUrl } from "@/lib/supabase";
import prismadb from "@/lib/prismadb";
import { getUserSubscription } from "@/lib/subscription";
import { getVideoInfo } from "@/lib/video-service";
import { PLANS } from "@/constants/subscription-plans";
import { getServerSession } from "@/lib/auth-utils";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload the original video to Supabase
    const buffer = await file.arrayBuffer();
    const filename = `${Date.now()}-${file.name}`;
    
    const { data, error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKETS.VIDEOS)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      filename,
      path: `${STORAGE_BUCKETS.VIDEOS}/${filename}`,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const videos = await prismadb.video.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error("[VIDEOS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 