import { NextRequest, NextResponse } from 'next/server';
import { verifySession, createAuditLog } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    const session = await verifySession(token || '');
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: PNG, JPEG, WebP, PDF' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 10MB' },
        { status: 400 }
      );
    }

    // Convert file to base64 and store in database (no filesystem needed — Vercel compatible)
    const arrayBuffer = await file.arrayBuffer();
    const base64Content = Buffer.from(arrayBuffer).toString('base64');

    const { db } = await import('@/lib/db');
    const document = await db.document.create({
      data: {
        userId: session.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: `base64://${file.type}`, // Marker indicating base64 storage
        status: 'uploaded',
      },
    });

    // Store base64 content in analysisResult temporarily until analysis runs
    // We use a separate approach: store in a temp field
    await db.document.update({
      where: { id: document.id },
      data: { analysisResult: JSON.stringify({ _tempBase64: base64Content, _tempFileType: file.type }) },
    });

    await createAuditLog(session.id, 'document_upload', { documentId: document.id, fileName: file.name, fileSize: file.size });

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        status: document.status,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
