import { NextResponse } from 'next/server';

// ── Manager / coach keywords to filter headlines ─────────────────────────
const KEYWORDS = [
  'manager', 'coach', 'head coach', 'sacked', 'appointed', 'resign', 'fired',
  'dismissed', 'press conference', 'contract', 'gaffer', 'boss', 'tactician',
  // Top 5 league managers (2025-26 season)
  'guardiola', 'slot', 'arteta', 'amorim', 'postecoglou', 'maresca',
  'ancelotti', 'flick', 'simeone', 'tuchel', 'conte', 'mourinho',
  'nagelsmann', 'enrique', 'kompany', 'allegri', 'inzaghi', 'gasperini',
  'de zerbi', 'glasner', 'oliver glasner', 'favre', 'sarri', 'garcia',
  'pochettino', 'ten hag', 'moyes', 'howe', 'edwards', 'emery',
];

// ── Fallback headlines shown when feeds are unreachable ───────────────────
const FALLBACK: string[] = [
  "Guardiola dismisses talk of Man City crisis after Champions League exit",
  "Slot hails Liverpool's pressing intensity ahead of title run-in",
  "Arteta calls for calm as Arsenal face pivotal week in Premier League",
  "Tuchel plots England formation overhaul ahead of Nations League campaign",
  "Simeone extends Atlético contract through 2027 despite board tensions",
  "Postecoglou under pressure as Spurs board weighs managerial alternatives",
  "Conte admits Napoli squad depth will be tested in final stretch",
  "Mourinho breaks silence on Roma dismissal: 'I'll be back at the top'",
  "Flick credits Barcelona youth academy after comeback win over Sevilla",
  "Ancelotti backs Real Madrid stars to deliver in European last-16",
  "Amorim sets strict new training protocols after Man United's mid-table slump",
  "Gasperini demands January reinforcements or threatens to leave Atalanta",
  "Nagelsmann reveals private talks with DFB over Germany's tactical future",
  "Kompany silences Munich critics with brace of crucial Bundesliga victories",
];

// ── RSS feed URLs (public, no auth required) ──────────────────────────────
const FEEDS = [
  'https://feeds.bbci.co.uk/sport/football/rss.xml',      // BBC Sport Football
  'https://www.theguardian.com/football/rss',              // The Guardian Football
];

// ── Simple RSS title extractor (no extra dependencies) ───────────────────
function extractTitles(xml: string): string[] {
  const titles: string[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  const cdataRx   = /<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]>/i;
  const plainRx   = /<title[^>]*>([\s\S]*?)<\/title>/i;

  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const item  = m[1];
    const cdata = cdataRx.exec(item);
    const plain = plainRx.exec(item);
    const raw   = (cdata?.[1] ?? plain?.[1] ?? '').trim();
    const title = raw
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, '')
      .trim();
    if (title.length >= 20 && title.length < 220) titles.push(title);
  }
  return titles;
}

function isRelevant(title: string): boolean {
  const lower = title.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

export const runtime = 'nodejs';

export async function GET() {
  const allTitles: string[] = [];

  // Fetch all feeds in parallel; ignore individual failures
  const results = await Promise.allSettled(
    FEEDS.map(url =>
      fetch(url, {
        // Next.js ISR: revalidate every 12 hours on the server
        next: { revalidate: 43200 },
        headers: { 'User-Agent': 'TouchlineTantrum/1.0 (football manager game)' },
        signal: AbortSignal.timeout(7000),
      }).then(r => (r.ok ? r.text() : Promise.reject(r.status)))
    )
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allTitles.push(...extractTitles(result.value));
    }
  }

  // Filter down to manager/coach news
  const managerNews = allTitles.filter(isRelevant);

  // Need at least 4 live headlines to use live data
  const items = managerNews.length >= 4 ? managerNews.slice(0, 20) : FALLBACK;

  return NextResponse.json(
    { items, source: managerNews.length >= 4 ? 'live' : 'fallback' },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
      },
    }
  );
}
