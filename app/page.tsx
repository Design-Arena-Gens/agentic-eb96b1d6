"use client";
import { useEffect, useMemo, useRef, useState } from 'react';

function useEnvDefaults() {
  // Provide client-visible hints; secure secrets are server-only and not exposed
  const [defaults, setDefaults] = useState({ name: '', niche: '', hashtags: '' });
  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setDefaults).catch(() => {});
  }, []);
  return defaults;
}

export default function HomePage() {
  const { name, niche, hashtags } = useEnvDefaults();
  const [personaName, setPersonaName] = useState(name || 'Ava');
  const [personaNiche, setPersonaNiche] = useState(niche || 'fitness and wellness');
  const [personaTags, setPersonaTags] = useState(hashtags || '#fitness #wellness #motivation');
  const [caption, setCaption] = useState('');
  const [seed, setSeed] = useState(() => String(Math.floor(Math.random() * 1e9)));
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ name: personaName, niche: personaNiche, hashtags: personaTags, seed });
    fetch('/api/caption?' + params.toString())
      .then(r => r.json())
      .then(d => setCaption(d.caption))
      .catch(() => setCaption(''));
  }, [personaName, personaNiche, personaTags, seed]);

  const imageUrl = useMemo(() => {
    const params = new URLSearchParams({ seed, title: personaNiche, name: personaName });
    return '/api/image?' + params.toString();
  }, [seed, personaNiche, personaName]);

  async function postNow(kind: 'image' | 'video' = 'image') {
    setPosting(true);
    try {
      const res = await fetch('/api/cron?manual=1&kind=' + kind, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Triggered');
    } catch (e) {
      alert('Failed to trigger');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="h" style={{ fontSize: 28 }}>AI Influencer Auto Poster</h1>
        <span className="badge">Daily Instagram</span>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid">
          <div className="col-6">
            <label>Persona name</label>
            <input className="input" value={personaName} onChange={e => setPersonaName(e.target.value)} />
          </div>
          <div className="col-6">
            <label>Niche</label>
            <input className="input" value={personaNiche} onChange={e => setPersonaNiche(e.target.value)} />
          </div>
          <div className="col-12">
            <label>Hashtags</label>
            <input className="input" value={personaTags} onChange={e => setPersonaTags(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={() => setSeed(String(Math.floor(Math.random() * 1e9)))}>Regenerate</button>
          <button className="btn" onClick={() => postNow('image')} disabled={posting}>{posting ? 'Posting?' : 'Post now (image)'}</button>
        </div>
        <p className="small" style={{ marginTop: 8 }}>Server cron will auto-post daily if Instagram credentials are configured as environment variables.</p>
      </div>

      <div className="grid">
        <div className="col-6">
          <div className="card">
            <h3 className="h" style={{ fontSize: 18, marginTop: 0 }}>Caption</h3>
            <textarea className="textarea" rows={10} value={caption} readOnly />
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <h3 className="h" style={{ fontSize: 18, marginTop: 0 }}>Image Preview</h3>
            <div className="preview">
              <img src={imageUrl} alt="preview" style={{ width: '100%', borderRadius: 12 }} />
              <p className="small" style={{ marginTop: 8 }}>
                Direct image URL (public): <a href={imageUrl} target="_blank" rel="noreferrer">{imageUrl}</a>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
