export type CareerMode = 'title' | 'top4' | 'relegation' | 'season19' | 'season38';

export interface CareerConfig {
  id: CareerMode;
  name: string;
  duration: number;
  target: number;
  startGW: number;
  description: string;
}

export const CAREER_MODES: Record<CareerMode, CareerConfig> = {
  title: { 
    id: 'title',
    name: "League Title", 
    duration: 8, 
    target: 1, 
    startGW: 30, 
    description: "Win the league or you're out. Zero tolerance." 
  },
  top4: { 
    id: 'top4',
    name: "Top 4 $$", 
    duration: 10, 
    target: 4, 
    startGW: 28, 
    description: "Champions League qualification is the only goal." 
  },
  relegation: { 
    id: 'relegation',
    name: "Relegation Battle", 
    duration: 6, 
    target: 17, 
    startGW: 32, 
    description: "Keep them up by any means necessary." 
  },
  season19: { 
    id: 'season19',
    name: "Full Season (Half)", 
    duration: 19, 
    target: 10, 
    startGW: 20, 
    description: "Take over for the second half of the campaign." 
  },
  season38: { 
    id: 'season38',
    name: "Full Season (38)", 
    duration: 38, 
    target: 10, 
    startGW: 1, 
    description: "The long haul. From Matchday 1 to 38." 
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

export const INITIAL_STATE = (mode: CareerMode = 'top4'): GameState => ({
  mode,
  boardSupport: 0.5,
  fanSupport: 0.5,
  dressingRoom: 0.5,
  aggression: 0.3,
  userTeam: "United FC",
  currentLeaguePosition: CAREER_MODES[mode].target + 2,
  cardsSeen: 0,
  matchesPlayed: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  points: 0,
  isSacked: false,
  isSeasonEnd: false,
  history: [],
});

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

export function getLeagueTable(state: GameState): LeagueTeam[] {
  const config = CAREER_MODES[state.mode];
  const teams = [
    "City", "Reds", "London Blue", "North White", "Villa", 
    "Toffees", "Seagulls", "Eagles", "Wolves", "Hammers",
    "United FC", "Magpies", "Hornets", "Cherries", "Saints",
    "Forest", "Foxes", "Bees", "Clarets", "Hatters"
  ];
  
  const currentGW = config.startGW + state.matchesPlayed;
  
  return teams.map((team, i) => {
    const isUser = team === state.userTeam;
    // Base points on expected PPG for that position
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
