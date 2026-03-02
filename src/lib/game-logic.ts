export type CareerMode = 'title' | 'top4' | 'relegation' | 'season';

export interface CareerConfig {
  id: CareerMode;
  name: string;
  description: string;
  durations: { label: string; matches: number; target: number; startGW: number }[];
}

export const CAREER_MODES: Record<CareerMode, CareerConfig> = {
  title: { 
    id: 'title',
    name: "League Title", 
    description: "Win the league or you're out. Zero tolerance.",
    durations: [
      { label: "Short Burst (5)", matches: 5, target: 1, startGW: 33 },
      { label: "Final Push (10)", matches: 10, target: 1, startGW: 28 },
      { label: "Full Campaign", matches: 38, target: 1, startGW: 1 }
    ]
  },
  top4: { 
    id: 'top4',
    name: "Top 4 $$", 
    description: "Champions League qualification is the only goal.",
    durations: [
      { label: "Final Stretch (8)", matches: 8, target: 4, startGW: 30 },
      { label: "Race for CL (15)", matches: 15, target: 4, startGW: 23 },
      { label: "Long Haul (38)", matches: 38, target: 4, startGW: 1 }
    ]
  },
  relegation: { 
    id: 'relegation',
    name: "Relegation Battle", 
    description: "Keep them up by any means necessary.",
    durations: [
      { label: "Great Escape (6)", matches: 6, target: 17, startGW: 32 },
      { label: "Survival Run (12)", matches: 12, target: 17, startGW: 26 },
      { label: "Bottom Half Fight", matches: 20, target: 17, startGW: 18 }
    ]
  },
  season: { 
    id: 'season',
    name: "Full Season", 
    description: "Classic managerial campaign.",
    durations: [
      { label: "Half Season (19)", matches: 19, target: 10, startGW: 20 },
      { label: "Full 38 Games", matches: 38, target: 10, startGW: 1 }
    ]
  },
};

export type LeagueTeam = {
  pos: number;
  team: string;
  gp: number;
  pts: number;
  isUser: boolean;
};

export type GameState = {
  mode: CareerMode;
  durationIndex: number;
  boardSupport: number;
  fanSupport: number;
  dressingRoom: number;
  aggression: number;
  userTeam: string;
  currentLeaguePosition: number;
  cardsSeen: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  isSacked: boolean;
  isSeasonEnd: boolean;
  history: string[];
};

export const INITIAL_STATE = (mode: CareerMode, durationIndex: number): GameState => {
  const config = CAREER_MODES[mode].durations[durationIndex];
  return {
    mode,
    durationIndex,
    boardSupport: 0.5,
    fanSupport: 0.5,
    dressingRoom: 0.5,
    aggression: 0.3,
    userTeam: "United FC",
    currentLeaguePosition: config.target + 2,
    cardsSeen: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    isSacked: false,
    isSeasonEnd: false,
    history: [],
  };
};

export type ManagerMood = 'happy' | 'neutral' | 'stressed' | 'angry' | 'sacked';

export function calculateMood(state: GameState): ManagerMood {
  if (state.isSacked) return 'sacked';
  const avgSupport = (state.boardSupport + state.fanSupport) / 2;
  if (avgSupport >= 0.7) return 'happy';
  if (avgSupport >= 0.5) return 'neutral';
  if (avgSupport >= 0.3) return 'stressed';
  return 'angry';
}

export function getMatchOdds(aggression: number) {
  // Purely visual representation of odds based on aggression
  const win = (2.20 - (aggression * 0.8)).toFixed(2);
  const draw = "3.40";
  const loss = (2.40 + (aggression * 1.2)).toFixed(2);
  return { win, draw, loss };
}

export function calculateMatchResult(state: GameState): 'win' | 'draw' | 'loss' {
  const mood = calculateMood(state);
  
  // Base win probability (starts at 35%)
  let winProb = 0.35;
  
  // Aggression bonus/penalty (0.0 to 1.0 scale)
  // Moderate aggression (0.4-0.6) is optimal
  const aggressionEffect = 1 - Math.abs(0.5 - state.aggression) * 0.5;
  winProb *= aggressionEffect;

  // Mood multiplier
  const moodMultipliers = {
    happy: 1.2,
    neutral: 1.0,
    stressed: 0.8,
    angry: 0.6,
    sacked: 0.0
  };
  winProb *= moodMultipliers[mood];

  const roll = Math.random();
  if (roll < winProb) return 'win';
  if (roll < winProb + 0.25) return 'draw';
  return 'loss';
}

export function getLeagueTable(state: GameState): LeagueTeam[] {
  const modeConfig = CAREER_MODES[state.mode];
  const config = modeConfig.durations[state.durationIndex];
  const teams = [
    "City", "Reds", "London Blue", "North White", "Villa", 
    "Toffees", "Seagulls", "Eagles", "Wolves", "Hammers",
    "United FC", "Magpies", "Hornets", "Cherries", "Saints",
    "Forest", "Foxes", "Bees", "Clarets", "Hatters"
  ];
  
  const currentGW = config.startGW + state.matchesPlayed;
  
  return teams.map((team, i) => {
    const isUser = team === state.userTeam;
    const ppg = (20 - i) * 0.12 + 0.5;
    let teamPts = Math.floor(ppg * currentGW);
    
    if (isUser) {
      teamPts = state.points;
    }

    return {
      pos: i + 1,
      team: team,
      gp: currentGW,
      pts: teamPts,
      isUser: isUser
    };
  }).sort((a, b) => b.pts - a.pts).map((t, i) => ({ ...t, pos: i + 1 }));
}

export function saveGameLocally(state: GameState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tt_save_v2', JSON.stringify(state));
  }
}

export function loadGameLocally(): GameState | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('tt_save_v2');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
  return null;
}