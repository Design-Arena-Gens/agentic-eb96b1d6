import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const name = process.env.INFLUENCER_NAME || '';
  const niche = process.env.INFLUENCER_NICHE || '';
  const hashtags = process.env.HASHTAGS || '';
  return NextResponse.json({ name, niche, hashtags });
}
