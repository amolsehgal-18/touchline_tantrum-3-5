export type LeagueTeam = {
  pos: number;
  team: string;
  pts: number;
  isUser: boolean;
};

export type GameState = {
  boardSupport: number; // 0.01 - 1.0
  fanSupport: number;   // 0.01 - 1.0
  dressingRoom: number; // 0.01 - 1.0
  aggression: number;   // 0.1 - 1.0
  userTeam: string;
  currentLeaguePosition: number;
  sagaObjective: string;
  objectiveMet: boolean;
  cardsSeen: number;
  wins: number;
  draws: number;
  losses: number;
  isSacked: boolean;
  history: string[];
};

export const INITIAL_STATE: GameState = {
  boardSupport: 0.5,
  fanSupport: 0.5,
  dressingRoom: 0.5,
  aggression: 0.3,
  userTeam: "United FC",
  currentLeaguePosition: 10,
  sagaObjective: "Top 4",
  objectiveMet: false,
  cardsSeen: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  isSacked: false,
  history: [],
};

export type ManagerMood = 'happy' | 'neutral' | 'stressed' | 'angry' | 'sacked';

export function calculateMood(state: GameState): ManagerMood {
  if (state.isSacked) return 'sacked';
  
  const avgSupport = (state.boardSupport + state.fanSupport + state.dressingRoom) / 3;
  
  if (state.objectiveMet && avgSupport > 0.3) return 'happy';
  
  if (avgSupport >= 0.7) return 'happy';
  if (avgSupport >= 0.5) return 'neutral';
  if (avgSupport >= 0.3) return 'stressed';
  return 'angry';
}

export function calculateWinProbability(state: GameState): number {
  return 0.30 + (state.aggression * 0.20) + (state.dressingRoom * 0.20);
}

export function getMatchOdds(aggression: number) {
  const win = (2.20 - (aggression * 0.8)).toFixed(2);
  const draw = "3.40";
  const loss = (2.40 + (aggression * 1.2)).toFixed(2);
  return { win, draw, loss };
}

export function getLeagueTable(state: GameState): LeagueTeam[] {
  // Mock logic to generate a table around the user's position
  const teams = [
    "City", "Reds", "London Blue", "North White", "Villa", 
    "Toffees", "Seagulls", "Eagles", "Wolves", "Hammers",
    "United FC", "Magpies", "Hornets", "Cherries", "Saints",
    "Forest", "Foxes", "Bees", "Clarets", "Hatters"
  ];
  
  const pts = teams.map((_, i) => (20 - i) * 3 + Math.floor(Math.random() * 5));
  pts.sort((a, b) => b - a);

  return teams.map((team, i) => ({
    pos: i + 1,
    team: team,
    pts: pts[i],
    isUser: team === state.userTeam
  })).slice(Math.max(0, state.currentLeaguePosition - 3), Math.min(20, state.currentLeaguePosition + 2));
}

export function saveGameLocally(state: GameState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tt_save', JSON.stringify(state));
  }
}

export function loadGameLocally(): GameState | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('tt_save');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
  return null;
}
