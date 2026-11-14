import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const relativePath = path.join(/*turbopackIgnore: true*/ ...pathSegments);

  // Security check: prevent directory traversal
  if (relativePath.includes('..')) {
    return new NextResponse('Invalid path', { status: 400 });
  }

  const candidateDirs = [
    path.join(process.cwd(), 'public', 'lecture-notes-images'),
    process.env.HASTAREKHA_DIR
      ? path.join(process.env.HASTAREKHA_DIR, 'public', 'lecture-notes-images')
      : '/Users/anurag/pworkspace/hastarekha/public/lecture-notes-images',
  ];

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      const fullPath = path.join(/*turbopackIgnore: true*/ dir, relativePath);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const ext = path.extname(fullPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const fileBuffer = fs.readFileSync(fullPath);

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          },
        });
      }
    }
  }

  return new NextResponse('Image not found', { status: 404 });
}
