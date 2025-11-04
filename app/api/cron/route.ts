import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function env(name: string, fallback = '') { return process.env[name] || fallback; }

function isConfigured() {
  return !!(process.env.IG_ACCESS_TOKEN && process.env.IG_USER_ID);
}

function absoluteUrl(req: NextRequest, path: string) {
  const configured = env('PUBLIC_BASE_URL');
  if (configured) return configured.replace(/\/$/, '') + path;
  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}${path}`;
}

async function createCaption(params: URLSearchParams) {
  const res = await fetch(`/api/caption?${params.toString()}`, { next: { revalidate: 0 } });
  // In node runtime we need absolute URL; above won't work. Placeholder; but we will call via absoluteUrl in caller.
}

async function publishImageToInstagram(imageUrl: string, caption: string) {
  const accessToken = env('IG_ACCESS_TOKEN');
  const userId = env('IG_USER_ID');
  const base = 'https://graph.facebook.com/v19.0';

  const mediaRes = await fetch(`${base}/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ image_url: imageUrl, caption, access_token: accessToken }),
  });
  const mediaJson = await mediaRes.json();
  if (!mediaRes.ok) {
    throw new Error(`IG media create failed: ${mediaRes.status} ${JSON.stringify(mediaJson)}`);
  }
  const creationId = mediaJson.id as string;

  const pubRes = await fetch(`${base}/${userId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ creation_id: creationId, access_token: accessToken }),
  });
  const pubJson = await pubRes.json();
  if (!pubRes.ok) {
    throw new Error(`IG media publish failed: ${pubRes.status} ${JSON.stringify(pubJson)}`);
  }
  return pubJson;
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  const url = new URL(req.url);
  const manual = url.searchParams.get('manual');
  const kind = (url.searchParams.get('kind') || 'image').toLowerCase();

  const seed = String(Math.floor(Date.now() / 86400000)); // day-based seed
  const name = env('INFLUENCER_NAME', 'Ava');
  const niche = env('INFLUENCER_NICHE', 'fitness and wellness');
  const hashtags = env('HASHTAGS', '#fitness #wellness #motivation');

  const captionUrl = absoluteUrl(req, `/api/caption?${new URLSearchParams({ name, niche, hashtags, seed }).toString()}`);
  const capRes = await fetch(captionUrl, { cache: 'no-store' });
  const capJson = await capRes.json();
  const caption = capJson.caption as string;

  const imagePath = `/api/image?${new URLSearchParams({ seed, title: niche, name }).toString()}`;
  const imageUrl = absoluteUrl(req, imagePath);

  if (!isConfigured()) {
    return NextResponse.json({
      ok: true,
      configured: false,
      message: 'Instagram credentials not configured. Generated caption and image URL only.',
      caption,
      imageUrl,
    });
  }

  if (kind !== 'image') {
    // For simplicity, only image is automated; video path could be added similarly
    return NextResponse.json({
      ok: false,
      configured: true,
      message: 'Only image posting is automated in this build.',
    }, { status: 400 });
  }

  try {
    const pub = await publishImageToInstagram(imageUrl, caption);
    return NextResponse.json({ ok: true, configured: true, message: 'Posted image to Instagram', result: pub, caption, imageUrl });
  } catch (e: any) {
    return NextResponse.json({ ok: false, configured: true, error: String(e), caption, imageUrl }, { status: 500 });
  }
}
