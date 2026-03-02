"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, INITIAL_STATE, calculateMood, saveGameLocally, getMatchOdds, getLeagueTable } from '@/lib/game-logic';
import { SlantedContainer, StatBar, SlantedButton } from './slanted-elements';
import { ManagerMoodView } from './manager-mood';
import { MatchRadar } from './match-radar';
import { TensionArcs } from './tension-arcs';
import { getAiScenarioPresentation, AiScenarioPresentationOutput } from '@/ai/flows/ai-scenario-presentation-flow';
import { RefreshCw, Share2, Trophy, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GameContainer = ({ initialState }: { initialState?: GameState }) => {
  const [state, setState] = useState<GameState>(initialState || INITIAL_STATE);
  const [currentScenario, setCurrentScenario] = useState<AiScenarioPresentationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [timer, setTimer] = useState(15);
  const [error, setError] = useState<string | null>(null);

  const fetchScenario = useCallback(async () => {
    if (state.isSacked) return;
    setLoading(true);
    setError(null);
    setTimer(15);
    try {
      const result = await getAiScenarioPresentation({
        boardSupport: state.boardSupport,
        fanSupport: state.fanSupport,
        dressingRoom: state.dressingRoom,
        aggression: state.aggression,
        userTeam: state.userTeam,
        currentLeaguePosition: state.currentLeaguePosition,
        sagaObjective: state.sagaObjective,
        objectiveMet: state.objectiveMet,
        excludedScenarioTexts: state.history,
      });
      setCurrentScenario(result);
    } catch (err) {
      console.error("Failed to fetch scenario", err);
      setError("Intel transmission failed. Reconnecting...");
      // Auto-retry after a delay
      setTimeout(() => {
        if (!state.isSacked) fetchScenario();
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    if (!currentScenario && !isSimulating && !state.isSacked && !loading && !error) {
      fetchScenario();
    }
  }, [currentScenario, isSimulating, state.isSacked, fetchScenario, loading, error]);

  useEffect(() => {
    if (currentScenario && !isSimulating && !loading) {
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            handleDecision('left');
            return 15;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScenario, isSimulating, loading]);

  const handleDecision = (side: 'left' | 'right') => {
    if (!currentScenario) return;

    const impact = side === 'left' ? currentScenario.impactLeft : currentScenario.impactRight;
    
    setState(prev => {
      const newState = {
        ...prev,
        boardSupport: Math.min(1, Math.max(0, prev.boardSupport + impact.board / 100)),
        fanSupport: Math.min(1, Math.max(0, prev.fanSupport + impact.fans / 100)),
        dressingRoom: Math.min(1, Math.max(0, prev.dressingRoom + impact.squad / 100)),
        aggression: Math.min(1, Math.max(0.1, prev.aggression + impact.aggression)),
        cardsSeen: prev.cardsSeen + 1,
        history: [...prev.history, currentScenario.scenario],
      };

      if (newState.boardSupport <= 0.05 || newState.fanSupport <= 0.05 || newState.dressingRoom <= 0.05) {
        newState.isSacked = true;
      }

      saveGameLocally(newState);
      return newState;
    });

    setCurrentScenario(null);

    if ((state.cardsSeen + 1) % 3 === 0) {
      setIsSimulating(true);
    }
  };

  const onMatchComplete = (result: 'win' | 'draw' | 'loss') => {
    setIsSimulating(false);
    setState(prev => {
      const newState = {
        ...prev,
        wins: result === 'win' ? prev.wins + 1 : prev.wins,
        draws: result === 'draw' ? prev.draws + 1 : prev.draws,
        losses: result === 'loss' ? prev.losses + 1 : prev.losses,
        currentLeaguePosition: result === 'win' ? Math.max(1, prev.currentLeaguePosition - 1) : result === 'loss' ? Math.min(20, prev.currentLeaguePosition + 1) : prev.currentLeaguePosition
      };
      saveGameLocally(newState);
      return newState;
    });
  };

  const mood = calculateMood(state);
  const odds = getMatchOdds(state.aggression);
  const leagueTable = useMemo(() => getLeagueTable(state), [state]);

  if (state.isSacked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-8 text-center bg-black/40">
        <ManagerMoodView mood="sacked" />
        <div className="space-y-2">
          <h1 className="text-4xl font-headline text-destructive uppercase">YOU ARE SACKED</h1>
          <p className="text-white/60">The board has terminated your contract with immediate effect.</p>
        </div>
        <SlantedContainer className="w-full max-w-sm border-destructive/50">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <div className="text-[10px] opacity-50 uppercase font-headline">Wins</div>
              <div className="text-2xl font-headline">{state.wins}</div>
            </div>
            <div>
              <div className="text-[10px] opacity-50 uppercase font-headline">Losses</div>
              <div className="text-2xl font-headline">{state.losses}</div>
            </div>
          </div>
        </SlantedContainer>
        <SlantedButton onClick={() => window.location.reload()} className="bg-white text-black">
          SIGN NEW CONTRACT
        </SlantedButton>
        <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <Share2 className="w-4 h-4" /> Share Sack Summary
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-background">
      {/* Live League Table Header */}
      <div className="bg-black/40 border-b border-white/5 p-2 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-headline uppercase tracking-widest text-accent flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Live League Standing
          </span>
          <span className="text-[10px] font-headline uppercase opacity-50">Week {Math.floor(state.cardsSeen / 3) + 1}</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {leagueTable.map((team) => (
            <div 
              key={team.team} 
              className={cn(
                "flex flex-col items-center py-1 rounded text-[10px] transition-colors",
                team.isUser ? "bg-primary/20 border border-primary/30" : "bg-white/5"
              )}
            >
              <span className="font-headline opacity-50">{team.pos}</span>
              <span className={cn("font-bold truncate w-full text-center px-1", team.isUser ? "text-primary" : "text-white")}>{team.team}</span>
              <span className="text-[8px] opacity-40">{team.pts} PTS</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="p-4 grid grid-cols-2 premium-glass border-b border-white/5 bg-black/20 z-30">
        <div className="flex justify-center items-center border-r border-white/5">
          <TensionArcs board={state.boardSupport} fans={state.fanSupport} morale={state.dressingRoom} />
        </div>
        <div className="flex justify-center items-center">
          <ManagerMoodView mood={mood} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto relative">
        {isSimulating ? (
          <MatchRadar onComplete={onMatchComplete} />
        ) : (
          <>
            <div className="w-full min-h-[320px] flex items-center justify-center">
              {loading || error ? (
                <div className="flex flex-col items-center gap-4 p-8 bg-white/5 rounded-xl border border-white/10 w-full">
                  {error ? (
                    <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
                  ) : (
                    <RefreshCw className="w-10 h-10 animate-spin text-primary" />
                  )}
                  <div className="space-y-2 text-center">
                    <span className="text-xs font-headline uppercase tracking-widest text-primary">
                      {error ? "Transmission Interrupted" : "Transmitting Intel"}
                    </span>
                    <p className="text-[10px] opacity-40 uppercase font-headline">
                      {error || "Analyzing Squad Morale & Board Trust..."}
                    </p>
                  </div>
                </div>
              ) : currentScenario ? (
                <SlantedContainer className="w-full relative scanline animate-in fade-in zoom-in duration-300">
                  {currentScenario.isBreaking && (
                    <div className="absolute top-0 right-0 bg-destructive text-white text-[8px] font-headline px-3 py-1 z-20 skew-x-[-20deg] origin-top-right">
                      BREAKING NEWS
                    </div>
                  )}
                  <div className="space-y-6">
                    <p className="text-lg leading-snug font-medium tracking-tight">{currentScenario.scenario}</p>
                    
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-1000 ease-linear" 
                        style={{ width: `${(timer / 15) * 100}%` }}
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <SlantedButton 
                        onClick={() => handleDecision('left')}
                        className="bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-left justify-start py-4 h-auto"
                      >
                        {currentScenario.leftOption}
                      </SlantedButton>
                      <SlantedButton 
                        onClick={() => handleDecision('right')}
                        className="bg-primary/10 hover:bg-primary/25 border border-primary/30 text-xs text-left justify-start py-4 h-auto"
                      >
                        {currentScenario.rightOption}
                      </SlantedButton>
                    </div>
                  </div>
                </SlantedContainer>
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* Footer / Aggression & Odds */}
      <div className="p-6 premium-glass mt-auto bg-black/40 border-t border-white/5 z-30">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] font-headline uppercase opacity-50 tracking-widest">Match Odds</div>
              <div className="font-headline text-lg tracking-tighter">
                <span className="text-blue-400 font-bold">{odds.win}</span>
                <span className="mx-2 text-white/10">/</span>
                <span className="text-white/40">{odds.draw}</span>
                <span className="mx-2 text-white/10">/</span>
                <span className="text-orange-400 font-bold">{odds.loss}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-headline uppercase opacity-50 tracking-widest">Aggression</div>
              <div className="text-xl font-headline text-primary font-bold">{Math.round(state.aggression * 100)}%</div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <div 
              className="h-full bg-primary transition-all duration-1000" 
              style={{ width: `${state.aggression * 100}%` }} 
             />
          </div>
        </div>
      </div>
    </div>
  );
};
