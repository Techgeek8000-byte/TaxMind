import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { analyzeDocument, guessDocType } from '@/lib/ai'

const scanSchema = z.object({
  documentId: z.string().min(1),
})

// ── POST /api/documents/scan ────────────────────────────────
// Accept { documentId }, extract base64 from extractedData,
// call analyzeDocument(), persist results, return extraction.

export async function POST(request: NextRequest) {
  try {
    // --- Auth ---
    const session = await verifyAuth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // --- Validate request body ---
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const parsed = scanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { documentId } = parsed.data

    // --- Load document ---
    const document = await db.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Ownership check
    if (document.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // --- Extract base64 content from extractedData ---
    const data = document.extractedData as Record<string, unknown> | null
    const base64Content = data?._fileContent as string | undefined
    const mimeType = (data?._mimeType as string | undefined) || document.fileType

    if (!base64Content) {
      return NextResponse.json(
        { error: 'No file data available for scanning. The document may not have been uploaded correctly.' },
        { status: 400 }
      )
    }

    // --- Call AI analysis ---
    const extraction = await analyzeDocument(base64Content, mimeType)

    // --- Check if AI actually succeeded ---
    const aiFailed = extraction.confidence === 0 && !extraction.summary

    if (aiFailed) {
      await db.document.update({
        where: { id: documentId },
        data: {
          status: 'failed',
          extractedData: {
            ...data,
            _scanResult: extraction,
            _scanError: extraction.summary || 'AI scan returned no useful data',
          },
        },
      })

      await logAudit({
        userId: session.userId,
        action: 'DOCUMENT_SCAN',
        resource: documentId,
        details: {
          fileName: document.fileName,
          status: 'failed',
          error: extraction.summary,
        },
      })

      return NextResponse.json(
        { error: 'Document scan failed', details: extraction.summary },
        { status: 500 }
      )
    }

    // --- Persist successful results ---
    // Keep the original _fileContent/_mimeType metadata and merge in scan results
    const updatedExtractedData = {
      ...data,               // keep _fileContent, _mimeType, _guessedDocType
      ...extraction,         // merge all extraction fields on top
    }

    const updated = await db.document.update({
      where: { id: documentId },
      data: {
        extractedData: updatedExtractedData,
        status: 'processed',
      },
    })

    // --- Audit log ---
    await logAudit({
      userId: session.userId,
      action: 'DOCUMENT_SCAN',
      resource: documentId,
      details: {
        fileName: document.fileName,
        documentType: extraction.documentType,
        confidence: extraction.confidence,
        provider: extraction.provider,
        guessedDocType: guessDocType(document.fileName),
      },
    })

    // --- Return extraction results (strip _fileContent from response) ---
    const { _fileContent: _, ...responseExtraction } = updatedExtractedData

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      extractedData: responseExtraction,
    })
  } catch (error) {
    console.error('Document scan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
