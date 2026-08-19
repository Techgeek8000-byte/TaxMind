import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { guessDocType } from '@/lib/ai'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]

// ── GET /api/documents ──────────────────────────────────────
// Return the authenticated user's documents, newest first, max 50.

export async function GET() {
  try {
    const session = await verifyAuth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documents = await db.document.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Strip base64 file content from list response to reduce payload size
    const sanitized = documents.map((doc) => {
      const { extractedData, ...rest } = doc
      const cleanData = extractedData
        ? { ...(extractedData as Record<string, unknown>), _fileContent: undefined }
        : extractedData
      return { ...rest, extractedData: cleanData }
    })

    return NextResponse.json(sanitized)
  } catch (error) {
    console.error('Documents list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── POST /api/documents ─────────────────────────────────────
// Upload a file. File content is stored as base64 inside extractedData
// with status 'pending'.  Max file size: 10 MB.

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // --- Parse multipart form data ---
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: 'Invalid multipart form data' },
        { status: 400 }
      )
    }

    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Send the file under the "file" form field.' },
        { status: 400 }
      )
    }

    // --- Validate file type ---
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF, PDF.',
        },
        { status: 400 }
      )
    }

    // Secondary validation: check file extension (client MIME type can be spoofed)
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf']
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Invalid file extension. Allowed: .jpg, .jpeg, .png, .webp, .gif, .pdf' },
        { status: 400 }
      )
    }

    // --- Validate file size (10 MB) ---
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
        },
        { status: 400 }
      )
    }

    // --- Convert to base64 ---
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    // Store base64 content and guessed doc type in extractedData
    const guessedType = guessDocType(file.name)
    const extractedData = {
      _fileContent: base64,     // base64-encoded file bytes
      _mimeType: file.type,
      _guessedDocType: guessedType,
    }

    // --- Persist to DB ---
    const document = await db.document.create({
      data: {
        userId: session.userId,
        fileName: file.name,
        fileType: file.type,
        fileSize: buffer.length,
        extractedData,
        status: 'pending',
      },
    })

    // --- Audit log ---
    await logAudit({
      userId: session.userId,
      action: 'DOCUMENT_UPLOAD',
      resource: document.id,
      details: {
        fileName: file.name,
        fileType: file.type,
        fileSize: buffer.length,
        guessedDocType: guessedType,
      },
    })

    // Return document metadata without the base64 file content
    const { extractedData: rawExtracted, ...docWithoutFileContent } = document
    const extractedDataRaw = rawExtracted as Record<string, unknown> | null
    return NextResponse.json({ ...docWithoutFileContent, extractedData: {
      _mimeType: extractedDataRaw?._mimeType as string | undefined,
      _guessedDocType: extractedDataRaw?._guessedDocType as string | undefined,
    }}, { status: 201 })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
