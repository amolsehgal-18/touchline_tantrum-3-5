import { NextResponse } from 'next/server';

// ── Manager / coach keywords to filter headlines ─────────────────────────
const KEYWORDS = [
  'manager', 'coach', 'head coach', 'sacked', 'appointed', 'resign', 'fired',
  'dismissed', 'press conference', 'contract', 'gaffer', 'boss', 'tactician',
  // Top 5 league managers (2025-26 season)
  'guardiola', 'slot', 'arteta', 'amorim', 'postecoglou', 'maresca',
  'ancelotti', 'flick', 'simeone', 'tuchel', 'conte', 'mourinho',
  'nagelsmann', 'enrique', 'kompany', 'allegri', 'inzaghi', 'gasperini',
  'de zerbi', 'glasner', 'favre', 'sarri', 'garcia',
  'pochettino', 'ten hag', 'moyes', 'howe', 'edwards', 'emery',
];

// ── Dramatic prefixes for sensationalization ─────────────────────────────
const CRISIS_WORDS = ['sacked', 'fired', 'dismissed', 'resign', 'quits', 'leaves', 'walks out'];
const TENSION_WORDS = ['pressure', 'crisis', 'demands', 'threatens', 'row', 'rift', 'bust-up', 'feud'];
const BIG_WORDS = ['exclusive', 'bombshell', 'shock', 'breaking', 'revealed'];
const PREFIXES_CRISIS   = ['BOMBSHELL:', 'SHOCK:', 'BREAKING:'];
const PREFIXES_TENSION  = ['EXCLUSIVE:', 'REVEALED:', 'CRISIS:'];
const PREFIXES_NEUTRAL  = ['EXCLUSIVE:', 'REVEALED:'];

function sensationalize(title: string): string {
  const lower = title.toLowerCase();
  // Don't double-prefix if already dramatic
  if (BIG_WORDS.some(w => lower.startsWith(w))) return title;
  if (CRISIS_WORDS.some(w => lower.includes(w))) {
    const prefix = PREFIXES_CRISIS[Math.floor(Math.random() * PREFIXES_CRISIS.length)];
    return `${prefix} ${title}`;
  }
  if (TENSION_WORDS.some(w => lower.includes(w))) {
    const prefix = PREFIXES_TENSION[Math.floor(Math.random() * PREFIXES_TENSION.length)];
    return `${prefix} ${title}`;
  }
  // 50% chance to add neutral prefix
  if (Math.random() > 0.5) {
    const prefix = PREFIXES_NEUTRAL[Math.floor(Math.random() * PREFIXES_NEUTRAL.length)];
    return `${prefix} ${title}`;
  }
  return title;
}

// ── Fallback headlines shown when feeds are unreachable ───────────────────
const FALLBACK: string[] = [
  "BOMBSHELL: Guardiola considered walking out on Man City mid-season over transfer betrayal",
  "EXCLUSIVE: Slot handed £200m war chest after secret FSG emergency summit — sources",
  "MELTDOWN: Arteta confronts Arsenal board in furious 90-minute showdown over squad depth",
  "SHOCK: Tuchel demands two England starters sold immediately or threatens to quit role",
  "CRISIS: Simeone told by Atletico board his contract WON'T be renewed past 2027 — reports",
  "FURIOUS: Postecoglou storms out of Spurs training after senior player refuses position",
  "EXCLUSIVE: Conte secretly interviewed for Premier League role while still managing Naples",
  "CHAOS: Mourinho texts Real Madrid players directly despite being out of management work",
  "BREAKING: Flick reveals Barcelona dressing room split into factions over key player's role",
  "ULTIMATUM: Ancelotti gives Real Madrid 48 hours to sign striker or he walks in January",
  "HOT MIC: Amorim caught on camera ranting at Man United board after training session ends",
  "STANDOFF: Gasperini locks himself in office as Atalanta ownership crisis deepens — exclusive",
  "EXCLUSIVE: Nagelsmann turned down £15m PSG deal to stay committed to Germany national side",
  "REVEALED: Kompany privately threatened to resign if Bayern miss the Bundesliga title",
  "SCANDAL: Top-flight manager under FA investigation over alleged illegal approach for player",
  "BOMBSHELL: Champions League winner set to quit and take over struggling Premier League club",
];

// ── RSS feed URLs (public, no auth required) ──────────────────────────────
const FEEDS = [
  'https://feeds.bbci.co.uk/sport/football/rss.xml',
  'https://www.theguardian.com/football/rss',
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

  const results = await Promise.allSettled(
    FEEDS.map(url =>
      fetch(url, {
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

  // Filter to manager/coach news, then sensationalize each headline
  const managerNews = allTitles
    .filter(isRelevant)
    .map(sensationalize);

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
