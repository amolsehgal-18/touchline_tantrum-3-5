"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, INITIAL_STATE, calculateMood, saveGameLocally, getMatchOdds, getLeagueTable } from '@/lib/game-logic';
import { SlantedContainer, SlantedButton } from './slanted-elements';
import { ManagerMoodView } from './manager-mood';
import { MatchRadar } from './match-radar';
import { TensionArcs } from './tension-arcs';
import { getAiScenarioPresentation, AiScenarioPresentationOutput } from '@/ai/flows/ai-scenario-presentation-flow';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GameContainer = ({ initialState }: { initialState?: GameState }) => {
  const [state, setState] = useState<GameState>(initialState || INITIAL_STATE);
  const [currentScenario, setCurrentScenario] = useState<AiScenarioPresentationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [timer, setTimer] = useState(15);
  const [error, setError] = useState<string | null>(null);
  
  const isFetchingRef = useRef(false);

  const fetchScenario = useCallback(async () => {
    if (state.isSacked || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
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
      setError(null);
    } catch (err) {
      console.error("Failed to fetch scenario", err);
      setError("Intel transmission failed. Reconnecting...");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [state.boardSupport, state.fanSupport, state.dressingRoom, state.aggression, state.userTeam, state.currentLeaguePosition, state.sagaObjective, state.objectiveMet, state.history, state.isSacked]);

  useEffect(() => {
    if (!currentScenario && !isSimulating && !state.isSacked && !loading && !error) {
      fetchScenario();
    }
  }, [currentScenario, isSimulating, state.isSacked, loading, error, fetchScenario]);

  useEffect(() => {
    if (currentScenario && !isSimulating && !loading && !error) {
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
  }, [currentScenario, isSimulating, loading, error]);

  const handleDecision = (side: 'left' | 'right') => {
    if (!currentScenario) return;

    const impact = side === 'left' ? currentScenario.impactLeft : currentScenario.impactRight;
    
    setState(prev => {
      const newState = {
        ...prev,
        boardSupport: Math.min(1, Math.max(0, prev.boardSupport + (impact.board / 100))),
        fanSupport: Math.min(1, Math.max(0, prev.fanSupport + (impact.fans / 100))),
        dressingRoom: Math.min(1, Math.max(0, prev.dressingRoom + (impact.squad / 100))),
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
  const leagueTable = useMemo(() => getLeagueTable(state), [state.currentLeaguePosition, state.userTeam]);

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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-background shadow-2xl border-x border-white/5">
      {/* Live League Table Header */}
      <div className="bg-black/60 border-b border-white/10 p-2 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-headline uppercase tracking-widest text-accent flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Live League Standing
          </span>
          <span className="text-[10px] font-headline uppercase opacity-50">Matchday {Math.floor(state.cardsSeen / 3) + 1}</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {leagueTable.map((team) => (
            <div 
              key={team.team} 
              className={cn(
                "flex flex-col items-center py-1 rounded text-[10px] transition-colors border",
                team.isUser ? "bg-primary/20 border-primary/50" : "bg-white/5 border-transparent"
              )}
            >
              <span className="font-headline opacity-50">{team.pos}</span>
              <span className={cn("font-bold truncate w-full text-center px-1", team.isUser ? "text-primary" : "text-white")}>{team.team}</span>
              <span className="text-[8px] opacity-40">{team.pts}P</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tension Dashboard Section */}
      <div className="p-4 grid grid-cols-2 premium-glass border-b border-white/5 bg-black/20 z-30">
        <div className="flex justify-center items-center border-r border-white/5 pr-4">
          <TensionArcs board={state.boardSupport} fans={state.fanSupport} morale={state.dressingRoom} />
        </div>
        <div className="flex justify-center items-center pl-4">
          <ManagerMoodView mood={mood} />
        </div>
      </div>

      {/* Main Game Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto relative bg-gradient-to-b from-transparent to-black/20">
        {isSimulating ? (
          <MatchRadar onComplete={onMatchComplete} />
        ) : (
          <div className="w-full min-h-[360px] flex items-center justify-center">
            {loading || error ? (
              <SlantedContainer className="w-full h-full flex flex-col items-center justify-center gap-4 border-white/10 bg-white/5">
                {error ? (
                  <>
                    <AlertTriangle className="w-12 h-12 text-destructive animate-pulse" />
                    <div className="space-y-4 text-center">
                      <span className="text-sm font-headline uppercase tracking-[0.2em] text-destructive block">
                        Transmission Cut
                      </span>
                      <p className="text-[10px] opacity-40 uppercase font-headline">
                        Intel feed interrupted. Re-syncing with HQ...
                      </p>
                      <SlantedButton onClick={() => fetchScenario()} className="bg-destructive/20 text-destructive text-[10px] px-4 py-2 mt-4">
                        RECONNECT MANUALLY
                      </SlantedButton>
                    </div>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-12 h-12 animate-spin text-primary" />
                    <div className="space-y-2 text-center">
                      <span className="text-sm font-headline uppercase tracking-[0.2em] text-primary block">
                        Transmitting Intel
                      </span>
                      <p className="text-[10px] opacity-40 uppercase font-headline">
                        Parsing Squad Tension Triangle...
                      </p>
                    </div>
                  </>
                )}
              </SlantedContainer>
            ) : currentScenario ? (
              <SlantedContainer className="w-full relative scanline animate-in fade-in zoom-in duration-500 shadow-2xl">
                {currentScenario.isBreaking && (
                  <div className="absolute top-0 right-0 bg-destructive text-white text-[8px] font-headline px-3 py-1 z-20 skew-x-[-20deg] shadow-lg">
                    BREAKING NEWS
                  </div>
                )}
                <div className="space-y-8">
                  <p className="text-xl leading-relaxed font-headline font-medium tracking-tight border-l-2 border-accent pl-4">{currentScenario.scenario}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-headline uppercase opacity-40">
                      <span>Tactical Window</span>
                      <span>{timer}s</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(255,173,31,0.5)]" 
                        style={{ width: `${(timer / 15) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <SlantedButton 
                      onClick={() => handleDecision('left')}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-left justify-start py-5 h-auto transition-all active:scale-95"
                    >
                      {currentScenario.leftOption}
                    </SlantedButton>
                    <SlantedButton 
                      onClick={() => handleDecision('right')}
                      className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs text-left justify-start py-5 h-auto transition-all active:scale-95"
                    >
                      {currentScenario.rightOption}
                    </SlantedButton>
                  </div>
                </div>
              </SlantedContainer>
            ) : null}
          </div>
        )}
      </div>

      {/* Bottom Bar: Stats & Aggression */}
      <div className="p-6 premium-glass mt-auto bg-black/60 border-t border-white/10 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-[10px] font-headline uppercase opacity-50 tracking-[0.2em]">Predicted Outcome</div>
              <div className="font-headline text-2xl tracking-tighter flex items-center">
                <span className="text-blue-400 font-bold">{odds.win}</span>
                <span className="mx-3 text-white/5">/</span>
                <span className="text-white/30">{odds.draw}</span>
                <span className="mx-3 text-white/5">/</span>
                <span className="text-orange-400 font-bold">{odds.loss}</span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-[10px] font-headline uppercase opacity-50 tracking-[0.2em]">Squad Aggression</div>
              <div className="text-2xl font-headline text-primary font-bold drop-shadow-sm">{Math.round(state.aggression * 100)}%</div>
            </div>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
             <div 
              className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(34,107,224,0.5)]" 
              style={{ width: `${state.aggression * 100}%` }} 
             />
          </div>
        </div>
      </div>
    </div>
  );
};