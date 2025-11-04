import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0) % 1000000;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name') || process.env.INFLUENCER_NAME || 'Ava';
  const niche = searchParams.get('niche') || process.env.INFLUENCER_NICHE || 'fitness and wellness';
  const hashtags = (searchParams.get('hashtags') || process.env.HASHTAGS || '#fitness #wellness #motivation').trim();
  const seedParam = searchParams.get('seed') || String(Math.floor(Math.random() * 1e9));

  const seed = hash(`${name}|${niche}|${seedParam}`);

  const openers = [
    "Little progress each day adds up.",
    "Your future self is counting on you.",
    "Discipline beats motivation?show up anyway.",
    "Strong body, stronger mind.",
    "You don?t have to be extreme, just consistent.",
  ];
  const calls = [
    "Save this for your next workout.",
    "Share with a friend who needs this.",
    "Double tap if you?re in.",
    "Comment ?YES? if you?re training today.",
    "Tag someone who inspires you.",
  ];
  const emojis = [
    "??", "??", "?", "??", "?????", "??", "??", "??", "??", "?????"
  ];

  const opener = pick(openers, seed + 1);
  const call = pick(calls, seed + 2);
  const emo = [pick(emojis, seed + 3), pick(emojis, seed + 4), pick(emojis, seed + 5)].join(' ');

  const caption = `${emo} ${opener}\n\nHi, I?m ${name} ? your daily ${niche} hype buddy. Here?s your reminder: consistency compounds. Focus on the next small win, then stack another. ${emo}\n\n${call}\n\n${hashtags}`;

  return NextResponse.json({ caption });
}
