
"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameState, INITIAL_STATE, calculateMood, saveGameLocally, getMatchOdds, getLeagueTable, CAREER_MODES, CareerMode } from '@/lib/game-logic';
import { SlantedButton } from './slanted-elements';
import { ManagerMoodView } from './manager-mood';
import { MatchRadar } from './match-radar';
import { TensionArcs } from './tension-arcs';
import { SwipeCard } from './swipe-card';
import { SeasonSummary } from './season-summary';
import { getAiScenarioPresentation } from '@/ai/flows/ai-scenario-presentation-flow';
import type { AiScenarioPresentationOutput } from '@/ai/flows/ai-scenario-presentation-flow';
import { RefreshCw, AlertTriangle, Trophy, Target, Shield, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GameContainer = ({ initialState }: { initialState?: GameState }) => {
  const [state, setState] = useState<GameState | null>(initialState || null);
  const [currentScenario, setCurrentScenario] = useState<AiScenarioPresentationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const config = state ? CAREER_MODES[state.mode] : null;

  const fetchScenario = useCallback(async () => {
    if (!state || state.isSacked || state.isSeasonEnd || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await getAiScenarioPresentation({
        boardSupport: state.boardSupport,
        fanSupport: state.fanSupport,
        dressingRoom: state.dressingRoom,
        aggression: state.aggression,
        userTeam: state.userTeam,
        currentLeaguePosition: state.currentLeaguePosition,
        sagaObjective: config?.name || "Season",
        objectiveMet: state.currentLeaguePosition <= (config?.target || 10),
        excludedScenarioTexts: state.history,
      });
      setCurrentScenario(result);
    } catch (err) {
      setError("Intel transmission interrupted.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [state, config]);

  useEffect(() => {
    if (state && !currentScenario && !isSimulating && !state.isSacked && !state.isSeasonEnd && !loading && !error) {
      fetchScenario();
    }
  }, [state, currentScenario, isSimulating, loading, error, fetchScenario]);

  const handleDecision = (side: 'left' | 'right') => {
    if (!currentScenario || !state) return;

    const impact = side === 'left' ? currentScenario.impactLeft : currentScenario.impactRight;
    
    const newState: GameState = {
      ...state,
      boardSupport: Math.min(1, Math.max(0, state.boardSupport + (impact.board / 100))),
      fanSupport: Math.min(1, Math.max(0, state.fanSupport + (impact.fans / 100))),
      dressingRoom: Math.min(1, Math.max(0, state.dressingRoom + (impact.squad / 100))),
      aggression: Math.min(1, Math.max(0.05, state.aggression + impact.aggression)),
      cardsSeen: state.cardsSeen + 1,
      history: [...state.history, currentScenario.scenario],
    };

    if (newState.boardSupport <= 0.05 || newState.fanSupport <= 0.05) {
      newState.isSacked = true;
    }

    setState(newState);
    saveGameLocally(newState);
    setCurrentScenario(null);
    setIsSimulating(true);
  };

  const onMatchComplete = (result: 'win' | 'draw' | 'loss') => {
    if (!state || !config) return;

    setIsSimulating(false);
    const newMatchesPlayed = state.matchesPlayed + 1;
    const ptsEarned = result === 'win' ? 3 : result === 'draw' ? 1 : 0;
    
    const newState: GameState = {
      ...state,
      matchesPlayed: newMatchesPlayed,
      wins: result === 'win' ? state.wins + 1 : state.wins,
      draws: result === 'draw' ? state.draws + 1 : state.draws,
      losses: result === 'loss' ? state.losses + 1 : state.losses,
      points: state.points + ptsEarned,
      isSeasonEnd: newMatchesPlayed >= config.duration
    };

    const table = getLeagueTable(newState);
    newState.currentLeaguePosition = table.find(t => t.isUser)?.pos || state.currentLeaguePosition;

    if (newState.isSeasonEnd && newState.currentLeaguePosition > config.target) {
      newState.isSacked = true;
    }

    setState(newState);
    saveGameLocally(newState);
  };

  const startNewCareer = (mode: CareerMode) => {
    const newState = INITIAL_STATE(mode);
    setState(newState);
    saveGameLocally(newState);
  };

  // Live windowed league table (3 teams centered on user)
  const windowedLeagueTable = useMemo(() => {
    if (!state) return [];
    const fullTable = getLeagueTable(state);
    const userIndex = fullTable.findIndex(t => t.isUser);
    
    let start = Math.max(0, userIndex - 1);
    let end = start + 3;
    
    if (end > fullTable.length) {
      end = fullTable.length;
      start = Math.max(0, end - 3);
    }
    
    return fullTable.slice(start, end);
  }, [state]);

  if (!state) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background p-6 overflow-y-auto">
        <h2 className="text-3xl font-headline font-bold mb-8 text-accent">SELECT CAREER PATH</h2>
        <div className="grid gap-4">
          {(Object.keys(CAREER_MODES) as CareerMode[]).map((modeKey) => {
            const m = CAREER_MODES[modeKey];
            const Icon = modeKey === 'title' ? Trophy : modeKey === 'top4' ? Target : modeKey === 'relegation' ? Shield : Calendar;
            return (
              <button 
                key={modeKey}
                onClick={() => startNewCareer(modeKey)}
                className="text-left p-6 premium-glass slanted-container border-white/10 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-headline font-bold uppercase">{m.name}</h3>
                    <p className="text-xs text-white/50 mb-2">{m.description}</p>
                    <div className="flex gap-4 text-[10px] font-headline opacity-40 uppercase">
                      <span>{m.duration} Matches</span>
                      <span>Target: Top {m.target}</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  if (state.isSeasonEnd || state.isSacked) {
    return <SeasonSummary state={state} onRestart={() => setState(null)} />;
  }

  const mood = calculateMood(state);
  const odds = getMatchOdds(state.aggression);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-background shadow-2xl border-x border-white/5">
      {/* Live Windowed League Table (Compact 3-Team View) */}
      <div className="bg-black/60 border-b border-white/10 p-3 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-headline uppercase tracking-widest text-accent flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Live Standings
          </span>
          <span className="text-[10px] font-headline uppercase opacity-50">Matchday {config!.startGW + state.matchesPlayed}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="grid grid-cols-4 text-[7px] font-headline uppercase opacity-40 px-2 pb-1 border-b border-white/5">
            <span>Pos</span>
            <span>Team</span>
            <span className="text-center">GP</span>
            <span className="text-right">Pts</span>
          </div>
          {windowedLeagueTable.map((team) => (
            <div 
              key={team.team} 
              className={cn(
                "grid grid-cols-4 items-center px-2 py-0.5 rounded text-[9px] transition-colors border",
                team.isUser ? "bg-primary/20 border-primary/50" : "bg-white/5 border-transparent"
              )}
            >
              <span className="font-headline opacity-50">{team.pos}</span>
              <span className={cn("font-bold truncate", team.isUser ? "text-primary" : "text-white")}>{team.team}</span>
              <span className="text-center opacity-40">{team.gp}</span>
              <span className="text-right font-bold">{team.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tension Dashboard */}
      <div className="p-2 grid grid-cols-2 premium-glass border-b border-white/5 bg-black/20 z-30">
        <div className="flex justify-center items-center border-r border-white/5">
          <TensionArcs board={state.boardSupport} fans={state.fanSupport} />
        </div>
        <div className="flex justify-center items-center">
          <ManagerMoodView mood={mood} />
        </div>
      </div>

      {/* Main Game Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 relative overflow-hidden">
        {isSimulating ? (
          <MatchRadar onComplete={onMatchComplete} />
        ) : (
          <div className="w-full flex-1 flex items-center justify-center relative">
            {loading ? (
              <div className="text-center space-y-4">
                <RefreshCw className="w-10 h-10 animate-spin text-primary mx-auto" />
                <p className="text-[10px] font-headline uppercase tracking-[0.3em] opacity-40">Decrypting Comms...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
                <p className="text-xs uppercase font-headline opacity-50">{error}</p>
                <SlantedButton onClick={fetchScenario}>Retry Decryption</SlantedButton>
              </div>
            ) : currentScenario ? (
              <SwipeCard 
                scenario={currentScenario} 
                onDecision={handleDecision} 
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 premium-glass bg-black/60 border-t border-white/10 z-30">
        <div className="flex justify-between items-end mb-3">
          <div className="space-y-1">
            <div className="text-[10px] font-headline uppercase opacity-50">Win Probability</div>
            <div className="font-headline text-lg flex items-center gap-2">
              <span className="text-blue-400">{odds.win}</span>
              <span className="text-white/20">|</span>
              <span className="text-white/40">{odds.draw}</span>
              <span className="text-white/20">|</span>
              <span className="text-orange-400">{odds.loss}</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-[10px] font-headline uppercase opacity-50">Squad Aggression</div>
            <div className="text-lg font-headline text-primary font-bold">{Math.round(state.aggression * 100)}%</div>
          </div>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000" 
            style={{ width: `${state.aggression * 100}%` }} 
          />
        </div>
      </div>
    </div>
  );
};
