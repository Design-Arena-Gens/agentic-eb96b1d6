import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const seed = Number(searchParams.get('seed') || 0);
  const name = searchParams.get('name') || 'Ava';
  const title = searchParams.get('title') || 'fitness and wellness';

  const hue = (seed % 360);
  const hue2 = ((seed + 137) % 360);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, hsl(${hue} 80% 60%), hsl(${hue2} 70% 40%))`,
          fontSize: 48,
          color: 'white',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1000px 600px at 80% -10%, rgba(255,255,255,0.15), transparent)' }} />
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 24, padding: 80, width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(255,255,255,0.25)', display: 'grid', placeItems: 'center', fontSize: 36 }}>??</div>
            <div style={{ fontSize: 28, opacity: 0.95 }}>
              {name} ? daily {title}
            </div>
          </div>
          <div style={{ fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, fontSize: 88, textShadow: '0 6px 30px rgba(0,0,0,0.2)' }}>
            Consistency over intensity
          </div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>Show up. Stack wins. Become unstoppable.</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: 32 }}>??</span>
            <span style={{ fontSize: 32 }}>??</span>
            <span style={{ fontSize: 32 }}>??</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      headers: {
        'Cache-Control': 'public, s-maxage=31536000, immutable',
      },
    }
  );
}
