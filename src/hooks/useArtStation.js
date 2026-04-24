import { useState, useEffect } from 'react';

const USERNAME = 'suhel';
const RSS_URL = `https://www.artstation.com/${USERNAME}.rss`;
const CACHE_KEY = 'as_suhel_v6_ultra_clean'; // Force fresh sync
const CACHE_TTL = 60 * 60 * 1000;

/* ── Multi-proxy fetch for RSS ───────────────── */
async function fetchRSS() {
  const proxies = [
    // 1. PHP Proxy (Production - most reliable)
    async () => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') throw new Error('Local');
      const res = await fetch(`artstation-proxy.php?url=${encodeURIComponent(RSS_URL)}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const text = await res.text();
      if (!text || text.includes('parsererror') || text.includes('Checking your browser')) {
        throw new Error('Invalid RSS response (Cloudflare or Error)');
      }
      return text;
    },
    // 2. AllOrigins Raw
    async () => {
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`);
      if (!res.ok) throw new Error(res.status);
      return res.text();
    }
  ];

  for (const proxy of proxies) {
    try { return await proxy(); } catch { }
  }
  throw new Error('All proxies failed');
}

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch { }
}


function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, '').trim();
}

export function sanitizeHtml(html = '') {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

export function formatDate(date) {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  } catch {
    return null;
  }
}

export function getText(node, tag) {
  return node.querySelector(tag)?.textContent?.trim() || '';
}

export function deriveSize(i) {
  return i === 0 ? 'featured' : i % 3 === 1 ? 'medium' : 'small';
}

export function makeId(link, index) {
  const clean = link.split('/').filter(Boolean).pop() || `project-${index}`;
  return `rss-${clean}`;
}

export function parseDescriptionContent(html = '') {
  if (!html || typeof html !== 'string') return { description: '', images: [], embeds: [] };

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc || !doc.body) return { description: '', images: [], embeds: [] };

    // 1. Extract Images
    const images = Array.from(doc.querySelectorAll('img'))
      .map(img => img.src)
      .filter(src => src && !src.includes('avatar'));

    // 2. Extract Embeds
    const embeds = Array.from(doc.querySelectorAll('iframe'))
      .map(iframe => iframe.outerHTML);

    // 3. Extract Text Description
    // We want to keep the text but remove the large media elements we already handle elsewhere
    const clone = doc.body.cloneNode(true);

    // Remove only the elements that are definitely NOT part of the text description
    clone.querySelectorAll('img, iframe, script, style, .artstation-embed').forEach(el => el.remove());

    // Get text, but also keep some basic formatting if possible by using innerHTML with a strip
    let description = clone.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '') // Strip remaining tags
      .replace(/\n\s*\n/g, '\n') // Remove double newlines
      .trim();

    // Fallback: If stripping everything left us with nothing, try to just get textContent
    if (!description) {
      description = doc.body.textContent.trim();
    }

    return { description, images, embeds };
  } catch (e) {
    console.error('[useArtStation] Failed to parse content', e);
    return { description: '', images: [], embeds: [] };
  }
}

function transformRSSItem(item, index, allItems) {
  const title = getText(item, 'title');
  const link = getText(item, 'link');
  const pubDate = getText(item, 'pubDate');

  // Try multiple ways to get the rich content (namespace handling varies)
  const contentEncoded =
    item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')?.[0]?.textContent ||
    item.getElementsByTagName('content:encoded')?.[0]?.textContent ||
    item.querySelector('encoded')?.textContent ||
    '';

  const rawDescription = getText(item, 'description') || '';

  // Parse the richest available HTML
  const { description, images, embeds } = parseDescriptionContent(contentEncoded || rawDescription);

  // 1. Unique Images
  const uniqueImages = [...new Set(images)];
  const mainImage = uniqueImages[0] || '';

  // 2. Build Gallery (Images + Videos)
  const gallery = uniqueImages.map(url => ({ url, type: 'image' }));

  // Add embeds (videos/3D) to the start of the gallery
  let sketchfabUrl = null;
  embeds.forEach(embed => {
    // Only add if not already there (though embeds are usually unique)
    if (!gallery.find(g => g.embed === embed)) {
      gallery.unshift({ url: null, embed, type: 'video' });
    }
    
    // Extract Sketchfab direct link if possible
    if (embed.includes('sketchfab.com/models/')) {
      const match = embed.match(/src="([^"]+)"/);
      if (match && match[1]) {
         // Convert embed URL to project URL: .../models/ID/embed -> .../models/ID
         sketchfabUrl = match[1].split('/embed')[0];
      }
    }
  });

  // AUTO-CATEGORIZATION (Since RSS doesn't provide it)
  let category = 'Hard Surface'; // Default for everything else
  const t = (title || '').toLowerCase();
  const d = (description || '').toLowerCase();
  
  // Characters, anatomy, humans go to Soft Surface
  if (t.includes('character') || d.includes('character') || t.includes('human') || t.includes('anatomy') || d.includes('anatomy')) {
    category = 'Soft Surface';
  }
  const slug = link.split('/').filter(Boolean).pop();

  return {
    id: `rss-${slug}`,
    artstationId: slug,
    title: (title || 'Untitled').toUpperCase(),
    titleRaw: title || 'Untitled',
    category,
    description: description || stripHtml(rawDescription).slice(0, 280) || `${title} — ArtStation`,
    descriptionHtml: sanitizeHtml(description.replace(/\n/g, '<br/>')),
    image: mainImage,
    gallery,
    galleryUrls: uniqueImages,
    tags: ['3D Modeling', 'Texturing', 'ArtStation'],
    size: deriveSize(index),
    year: pubDate ? new Date(pubDate).getFullYear().toString() : new Date().getFullYear().toString(),
    publishedAt: pubDate || null,
    updatedAt: pubDate || null,
    publishedLabel: formatDate(pubDate),
    software: [],
    likesCount: 0,
    viewsCount: 0,
    commentsCount: 0,
    permalink: link,
    hasDetails: true,
    artist: {
      username: USERNAME,
      fullName: 'SUHEL J. RAHMAN',
      headline: '3D Artist & Digital Creator',
      avatarUrl: null,
      profileUrl: `https://www.artstation.com/${USERNAME}`,
    },
    embed3d: embeds.find(e => e.includes('sketchfab')) || embeds[0] || null,
    sketchfabUrl: sketchfabUrl,
  };
}

function parseRSS(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');

  // Handle potential parse errors
  const parseError = xml.getElementsByTagName('parsererror');
  if (parseError.length) throw new Error('XML Parse Error');

  const items = Array.from(xml.querySelectorAll('item'));
  if (!items.length) throw new Error('No projects found in RSS');

  return items.map((item, index) => transformRSSItem(item, index, items));
}

export function useArtStation({ perPage = 20 } = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = getCache();

      if (cached) {
        // De-duplicate cached data just in case
        const uniqueCached = cached.filter((p, index, self) =>
          index === self.findIndex((t) => t.id === p.id)
        );
        setProjects(uniqueCached.slice(0, perPage));
        setSynced(true);
        setLoading(false);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const rssText = await fetchRSS();
        const data = parseRSS(rssText);

        if (!cancelled) {
          // De-duplicate by ID before setting state
          const uniqueData = data.filter((p, index, self) =>
            index === self.findIndex((t) => t.id === p.id)
          );

          const sliced = uniqueData.slice(0, perPage);
          setProjects(sliced);
          setSynced(true);
          setLoading(false);
          setCache(uniqueData);
        }
      } catch (err) {
        if (!cancelled && !cached) {
          setError(err.message);
          setSynced(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [perPage]);

  return {
    projects,
    loading,
    error,
    synced,
    username: USERNAME,
  };
}

export function useSingleProject(hash_id, basicProject) {
  const [detailedProject, setDetailedProject] = useState(basicProject);
  const [isLoading] = useState(false);

  useEffect(() => {
    setDetailedProject(basicProject);
  }, [hash_id, basicProject]);

  return {
    project: detailedProject || basicProject,
    isLoading,
  };
}