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
      { label: "Final Push (6)", matches: 6, target: 1, startGW: 33 },
      { label: "Title Charge (8)", matches: 8, target: 1, startGW: 31 },
      { label: "Title Race (10)", matches: 10, target: 1, startGW: 29 }
    ]
  },
  top4: {
    id: 'top4',
    name: "Top 4 $$",
    description: "Champions League qualification is the only goal.",
    durations: [
      { label: "Final Stretch (6)", matches: 6, target: 4, startGW: 33 },
      { label: "Race for CL (8)", matches: 8, target: 4, startGW: 31 },
      { label: "Euro Hunt (10)", matches: 10, target: 4, startGW: 29 }
    ]
  },
  relegation: {
    id: 'relegation',
    name: "Relegation Battle",
    description: "Keep them up by any means necessary.",
    durations: [
      { label: "Great Escape (6)", matches: 6, target: 17, startGW: 33 },
      { label: "Survival Run (8)", matches: 8, target: 17, startGW: 31 },
      { label: "The Fight (10)", matches: 10, target: 17, startGW: 29 }
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
  id: string;
  managerName: string;
  userTeam: string;
  mode: CareerMode;
  durationIndex: number;
  boardSupport: number;
  fanSupport: number;
  dressingRoom: number;
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

const getPPGForPosition = (pos: number): number => {
  if (pos === 1) return 2.45;
  if (pos === 2) return 2.20;
  if (pos <= 4) return 1.95;
  if (pos <= 6) return 1.70;
  if (pos <= 10) return 1.35;
  if (pos <= 17) return 1.05;
  return 0.75;
};

export const INITIAL_STATE = (
  mode: CareerMode,
  durationIndex: number,
  managerName: string = "Gaffer",
  userTeam: string = "United FC"
): GameState => {
  const config = CAREER_MODES[mode].durations[durationIndex];

  let startPos = 10;
  if (mode === 'title') startPos = 2;
  else if (mode === 'top4') startPos = 5;
  else if (mode === 'relegation') startPos = 18;

  const startGW = config.startGW - 1;
  const startingPoints = Math.max(0, Math.floor(getPPGForPosition(startPos) * startGW));

  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });

  return {
    id,
    managerName,
    userTeam,
    mode,
    durationIndex,
    boardSupport: 0.5,
    fanSupport: 0.5,
    dressingRoom: 0.5,
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
  const tensionAvg = (state.boardSupport + state.fanSupport + state.dressingRoom) / 3;
  if (tensionAvg >= 0.7) return 'happy';
  if (tensionAvg >= 0.5) return 'neutral';
  if (tensionAvg >= 0.3) return 'stressed';
  return 'angry';
}

// Win probability driven purely by the Tension Triangle
export function getMatchOdds(state: GameState) {
  const winProb = Math.min(0.70, 0.30 + (state.dressingRoom * 0.20) + (state.boardSupport * 0.10) + (state.fanSupport * 0.10));
  const win = winProb.toFixed(2);
  const draw = "0.25";
  const loss = Math.max(0, 1 - winProb - 0.25).toFixed(2);
  return { win, draw, loss };
}

export function calculateMatchResult(state: GameState): 'win' | 'draw' | 'loss' {
  const winProb = Math.min(0.70, 0.30 + (state.dressingRoom * 0.20) + (state.boardSupport * 0.10) + (state.fanSupport * 0.10));
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

  const displayTeams = teams.map(t => t === "United FC" ? state.userTeam : t);
  const currentGW = (config.startGW - 1) + state.matchesPlayed;

  return displayTeams.map((team, i) => {
    const isUser = team === state.userTeam;
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
    localStorage.setItem('tt_save_v8', JSON.stringify(state));
  }
}

export function loadGameLocally(): GameState | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('tt_save_v8');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
  return null;
}
