import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const groupId = formData.get('groupId') as string;
    const file = formData.get('image') as File | null;

    if (!name || !groupId || !file) {
      return NextResponse.json(
        { error: 'Name, Group ID, and Image are required.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Save submission to database
    const submission = await prisma.submission.create({
      data: {
        name,
        groupId,
        imagePath: blob.url,
      },
    });

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during upload.' },
      { status: 500 }
    );
  }
}
