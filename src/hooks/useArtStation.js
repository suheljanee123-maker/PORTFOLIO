// ============================================================
// useArtStation — Live ArtStation data for suhel
//
// Proxy strategy (tried in order):
//  1. /artstation-api  — Vite server-side proxy (best, needs dev restart)
//  2. corsproxy.io    — free CORS passthrough
//  3. allorigins.win  — fallback wrapper proxy
//
// Caching: localStorage, 1-hour TTL so each session only
//          hits the API once even if proxies are slow.
// ============================================================
import { useState, useEffect } from 'react';

const USERNAME  = 'suhel';
const CACHE_KEY = 'as_suhel_projects_v14'; // exclude sketchfab from gallery
const CACHE_TTL = 60 * 60 * 1000;         // 1 hour

/* ── LocalStorage cache ─────────────────────── */
function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    console.log('[useArtStation] Loaded from cache');
    return data;
  } catch { return null; }
}
function setCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

/* ── Multi-proxy fetch ──────────────────────── */
async function fetchURL(url) {
  const proxies = [
    // 1. Vite server proxy (needs dev server restart to activate)
    async () => {
      const path = url.replace('https://www.artstation.com', '');
      const res  = await fetch(`/artstation-api${path}`, {
        signal: AbortSignal.timeout(7000),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`vite-proxy ${res.status}`);
      return res.json();
    },
    // 2. corsproxy.io
    async () => {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(14000),
        headers: { 'x-requested-with': 'XMLHttpRequest' },
      });
      if (!res.ok) throw new Error(`corsproxy ${res.status}`);
      const text = await res.text();
      return JSON.parse(text);
    },
    // 3. allorigins.win
    async () => {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(14000),
      });
      if (!res.ok) throw new Error(`allorigins ${res.status}`);
      const wrapper = await res.json();
      if (!wrapper.contents) throw new Error('allorigins: empty contents');
      return JSON.parse(wrapper.contents);
    },
    // 4. thingproxy.freeboard.io
    async () => {
      const res = await fetch(`https://thingproxy.freeboard.io/fetch/${url}`, {
        signal: AbortSignal.timeout(14000),
      });
      if (!res.ok) throw new Error(`thingproxy ${res.status}`);
      return res.json();
    },
  ];

  for (const proxy of proxies) {
    try {
      return await proxy();
    } catch (err) {
      console.warn(`[useArtStation] Proxy failed, trying next: ${err.message}`);
    }
  }
  throw new Error('All proxies exhausted');
}

/* ── Helpers ────────────────────────────────── */
function deriveSize(i)  { return i === 0 ? 'featured' : i % 3 === 1 ? 'medium' : 'small'; }
function stripHtml(h)   { return (h || '').replace(/<[^>]+>/g, '').trim(); }

export function sanitizeHtml(html) {
  return (html || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

export function formatDate(iso) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }); }
  catch { return null; }
}

/* ── Transform ArtStation project → portfolio shape ── */
function transform(p, index, allItems = [], sketchfabModels = []) {
  const year     = p.created_at ? new Date(p.created_at).getFullYear().toString() : new Date().getFullYear().toString();
  const category = p.categories?.[0]?.name || p.medium_category_name || 'Art';
  const tags     = p.tags || [];

  const assetImg  = p.assets?.find(a => a.image_url)?.image_url;
  const mainImage = assetImg || p.cover_url || '';

  const gallery = (p.assets || [])
    .map(a => ({
      url: a.image_url || null,
      embed: a.has_embedded_player ? a.player_embedded : null,
      width: a.width || null,
      height: a.height || null,
      title: a.title || null,
      type: a.has_embedded_player ? 'video' : 'image'
    }))
    .filter(a => {
      if (a.type === 'image') return !!a.url;
      // Exclude Sketchfab from the gallery stack
      if (a.type === 'video') return a.embed && !a.embed.toLowerCase().includes('sketchfab');
      return false;
    });

  if (!gallery.length && mainImage) gallery.push({ url: mainImage, type: 'image' });

  const moreByArtist = allItems
    .filter(o => o.hash_id !== p.hash_id && o.cover_url)
    .slice(0, 4)
    .map(o => ({ hashId: o.hash_id, title: o.title, cover: o.cover_url, permalink: o.permalink }));

  return {
    id:             `as-${p.hash_id || p.id}`,
    artstationId:   p.hash_id || p.id,
    title:          (p.title || 'Untitled').toUpperCase(),
    titleRaw:       p.title || 'Untitled',
    category,
    description:    stripHtml(p.description_html).slice(0, 280) || `${p.title} — ArtStation`,
    descriptionHtml: sanitizeHtml(p.description_html || ''),
    image:          mainImage,
    gallery,
    galleryUrls:    gallery.map(g => g.url),
    tags,
    size:           deriveSize(index),
    year,
    publishedAt:    p.created_at   || null,
    updatedAt:      p.updated_at   || null,
    publishedLabel: formatDate(p.created_at),
    software:       (p.software_items || []).map(s => s.name),
    likesCount:     p.likes_count    || 0,
    viewsCount:     p.views_count    || 0,
    commentsCount:  p.comments_count || 0,
    permalink:      p.permalink || `https://www.artstation.com/artwork/${p.hash_id}`,
    artist: {
      username:   p.user?.username      || USERNAME,
      fullName:   p.user?.full_name     || 'SUHEL J. RAHMAN',
      headline:   p.user?.headline      || '3D Artist & Digital Creator',
      avatarUrl:  p.user?.medium_avatar_url || p.user?.small_cover_url || null,
      profileUrl: `https://www.artstation.com/${p.user?.username || USERNAME}`,
    },
    // Extract Sketchfab embeds from ArtStation assets, with local overrides
    embed3d: (() => {
      const hash = p.hash_id || p.id;
      
      // 1. Dynamic Auto-Mapping: Match Sketchfab models by title
      if (sketchfabModels.length > 0 && p.title) {
        const cleanTitle = p.title.trim().toUpperCase();
        const sfMatch = sketchfabModels.find(m => {
          const sfName = m.name.trim().toUpperCase();
          return sfName === cleanTitle || sfName.includes(cleanTitle) || cleanTitle.includes(sfName);
        });
        if (sfMatch && sfMatch.uid) {
          return `<iframe src="https://sketchfab.com/models/${sfMatch.uid}/embed?autostart=1&transparent=1&ui_infos=0&ui_watermark=0" allow="autoplay; fullscreen; xr-spatial-tracking" execution-while-out-of-viewport execution-while-not-rendered web-share allowfullscreen></iframe>`;
        }
      }
      
      // 2. Hard-map Sketchfab models to their respective ArtStation projects
      if (hash === 'nJrKxK') {
        // "Stylized Weapon"
        return `<iframe src="https://sketchfab.com/models/657b39877cf64ee79734b0062edd1527/embed?autostart=1&transparent=1&ui_infos=0&ui_watermark=0" allow="autoplay; fullscreen; xr-spatial-tracking" execution-while-out-of-viewport execution-while-not-rendered web-share allowfullscreen></iframe>`;
      }
      if (hash === 'eRkGQ6') {
        // "High Detail 3D Character"
        return `<iframe src="https://sketchfab.com/models/8a3b2dba16e3485d999c28ecedefdf84/embed?autostart=1&transparent=1&ui_infos=0&ui_watermark=0" allow="autoplay; fullscreen; xr-spatial-tracking" execution-while-out-of-viewport execution-while-not-rendered web-share allowfullscreen></iframe>`;
      }
      
      // 3. Extract any embed (Sketchfab, YouTube, Vimeo, etc.)
      const embedAsset = (p.assets || []).find(a => a.has_embedded_player && a.player_embedded);
      if (embedAsset) return embedAsset.player_embedded;
      
      // If no Sketchfab is found, do NOT show the same model. Fall back to the 2D image.
      return null;
    })(),
    // Keep local model fallback just in case
    model: (() => {
      const hash = p.hash_id || p.id;
      if (hash === 'nJrKxK') return null; // removed local GLB since we're using Sketchfab
      return null;
    })(),
  };
}

/* ── Main hook ──────────────────────────────── */
export function useArtStation({ perPage = 20 } = {}) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [synced,   setSynced]   = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. Instantly load from cache if available (Stale-While-Revalidate)
      const cached = getCache();
      if (cached) {
        setProjects(cached);
        setSynced(true);
        setLoading(false); // UI shows instantly
      } else {
        setLoading(true);
      }

      setError(null);

      // 2. Always fetch fresh data in the background
      try {
        const timestamp = Date.now();
        
        // Fetch Sketchfab models for automatic mapping (runs in parallel but awaited before detailed mapping)
        let sketchfabModels = [];
        try {
          const sfRes = await fetch(`https://api.sketchfab.com/v3/models?user=SUHEL3D`);
          if (sfRes.ok) {
            const sfData = await sfRes.json();
            sketchfabModels = sfData.results || [];
          }
        } catch (sfErr) {
          console.warn('[useArtStation] Failed to fetch Sketchfab models for auto-mapping', sfErr);
        }

        let page = 1;
        let allItems = [];
        while (true) {
          const listData = await fetchURL(
            `https://www.artstation.com/users/${USERNAME}/projects.json?page=${page}&per_page=${perPage}&_t=${timestamp}`
          );
          const items = listData.data || [];
          if (!items.length) break;
          allItems = [...allItems, ...items];
          if (items.length < perPage) break; // last page
          page++;
        }
        if (!allItems.length) throw new Error('No projects returned');

        // Fetch full detail for each project
        const detailed = await Promise.all(
          allItems.map(async (item, i) => {
            try {
              const detail = await fetchURL(
                `https://www.artstation.com/projects/${item.hash_id || item.id}.json?_t=${timestamp}`
              );
              return transform({ ...item, ...detail }, i, allItems, sketchfabModels);
            } catch {
              return transform(item, i, allItems, sketchfabModels);
            }
          })
        );

        if (!cancelled) {
          setProjects(detailed);
          setSynced(true);
          setCache(detailed); // Update cache with fresh data
        }
      } catch (err) {
        if (!cancelled && !cached) {
          // Only show error if we also have no cache
          console.error('[useArtStation] Background fetch failed:', err.message);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [perPage]);

  return { projects, loading, error, synced, username: USERNAME };
}
