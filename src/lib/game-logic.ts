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

// Realistic PPG based on position (approximate Premier League averages)
const getPPGForPosition = (pos: number): number => {
  if (pos === 1) return 2.45;
  if (pos === 2) return 2.15;
  if (pos <= 4) return 1.95;
  if (pos <= 6) return 1.75;
  if (pos <= 10) return 1.35;
  if (pos <= 17) return 1.05;
  return 0.75;
};

export const INITIAL_STATE = (mode: CareerMode, durationIndex: number): GameState => {
  const config = CAREER_MODES[mode].durations[durationIndex];
  
  // Starting positions based on user requirement
  let startPos = 10;
  if (mode === 'title') startPos = 2;
  else if (mode === 'top4') startPos = 5;
  else if (mode === 'relegation') startPos = 18;

  const startGW = config.startGW - 1; // Points earned BEFORE the game starts
  const startingPoints = Math.max(0, Math.floor(getPPGForPosition(startPos) * startGW));

  return {
    mode,
    durationIndex,
    boardSupport: 0.5,
    fanSupport: 0.5,
    dressingRoom: 0.5,
    aggression: 0.3,
    userTeam: "United FC",
    currentLeaguePosition: startPos,
    cardsSeen: 0,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: startingPoints,
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
  const win = (2.20 - (aggression * 0.8)).toFixed(2);
  const draw = "3.40";
  const loss = (2.40 + (aggression * 1.2)).toFixed(2);
  return { win, draw, loss };
}

export function calculateMatchResult(state: GameState): 'win' | 'draw' | 'loss' {
  const mood = calculateMood(state);
  let winProb = 0.35;
  
  const aggressionEffect = 1 - Math.abs(0.5 - state.aggression) * 0.5;
  winProb *= aggressionEffect;

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
  
  const currentGW = (config.startGW - 1) + state.matchesPlayed;
  
  return teams.map((team, i) => {
    const isUser = team === state.userTeam;
    // Base position for other teams based on original array index
    const teamBasePos = i + 1;
    let teamPts = Math.floor(getPPGForPosition(teamBasePos) * currentGW);
    
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