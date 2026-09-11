import { NextRequest, NextResponse } from 'next/server';

function isAllowedExportHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
  if (host.endsWith('.amazonaws.com') || host === 'amazonaws.com') return true;
  if (host === 'shettar.com' || host.endsWith('.shettar.com')) return true;
  return false;
}

/** Same-origin proxy so html2canvas can inline cross-origin QR / receipt images. */
export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src');
  if (!src) {
    return NextResponse.json({ error: 'missing src' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: 'invalid src' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(target.protocol) || !isAllowedExportHost(target.hostname)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const upstream = await fetch(target.toString(), { redirect: 'follow' });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'upstream' }, { status: upstream.status || 502 });
  }

  const contentType = upstream.headers.get('content-type') || 'image/png';
  if (!contentType.startsWith('image/') && contentType !== 'application/octet-stream') {
    return NextResponse.json({ error: 'not an image' }, { status: 415 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=60',
    },
  });
}
