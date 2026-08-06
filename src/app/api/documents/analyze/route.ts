import { NextRequest, NextResponse } from 'next/server';
import { verifySession, createAuditLog } from '@/lib/auth';
import { analyzeDocument, guessDocType } from '@/lib/ai-provider';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    const session = await verifySession(token || '');
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { documentId } = await request.json();
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const { db } = await import('@/lib/db');
    const doc = await db.document.findFirst({
      where: { id: documentId, userId: session.id },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update status to analyzing
    await db.document.update({
      where: { id: documentId },
      data: { status: 'analyzing' },
    });

    // Get base64 content from document record
    // Documents are stored as base64 in analysisResult with a _tempBase64 marker
    let base64Content: string;
    let mimeType: string;

    if (doc.analysisResult) {
      try {
        const tempData = JSON.parse(doc.analysisResult);
        if (tempData._tempBase64) {
          base64Content = tempData._tempBase64;
          mimeType = tempData._tempFileType || doc.fileType;
        } else {
          // Already analyzed — return existing result
          return NextResponse.json({
            message: 'Already analyzed',
            result: JSON.parse(doc.analysisResult),
          });
        }
      } catch {
        base64Content = '';
        mimeType = doc.fileType;
      }
    } else {
      base64Content = '';
      mimeType = doc.fileType;
    }

    // Run AI analysis (Vercel-compatible — pure HTTP, no filesystem, no SDK)
    let analysisResult: any;

    if (base64Content) {
      try {
        analysisResult = await analyzeDocument(base64Content, mimeType);
      } catch (aiError: any) {
        console.error('AI analysis error:', aiError);
        analysisResult = {
          documentType: guessDocType(doc.fileName),
          summary: `AI analysis failed: ${aiError.message}. Please enter data manually in the Tax Calculator.`,
          confidence: 0,
          _provider: 'error',
          _error: aiError.message,
        };
      }
    } else {
      analysisResult = {
        documentType: guessDocType(doc.fileName),
        summary: 'Document data not found. The file may not have been uploaded correctly. Please re-upload and try again.',
        confidence: 0,
        _provider: 'none',
      };
    }

    // Remove temp base64 data before saving (don't store raw base64 long-term — too large)
    const saveData = { ...analysisResult };
    delete (saveData as any)._tempBase64;
    delete (saveData as any)._tempFileType;

    // Update document with analysis results
    await db.document.update({
      where: { id: documentId },
      data: {
        analysisResult: JSON.stringify(saveData),
        status: 'completed',
        analyzedAt: new Date(),
      },
    });

    await createAuditLog(session.id, 'document_analyze', {
      documentId,
      fileName: doc.fileName,
      provider: (saveData as any)._provider || 'unknown',
    });

    return NextResponse.json({
      message: 'Analysis complete',
      result: saveData,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
