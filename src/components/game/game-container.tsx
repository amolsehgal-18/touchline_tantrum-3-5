"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, INITIAL_STATE, calculateMood, saveGameLocally, getMatchOdds, calculateWinProbability } from '@/lib/game-logic';
import { SlantedContainer, StatBar, SlantedButton } from './slanted-elements';
import { ManagerMoodView } from './manager-mood';
import { MatchRadar } from './match-radar';
import { getAiScenarioPresentation, AiScenarioPresentationOutput } from '@/ai/flows/ai-scenario-presentation-flow';
import { Trophy, RefreshCw, AlertTriangle, ShieldCheck, Share2 } from 'lucide-react';

export const GameContainer = ({ initialState }: { initialState?: GameState }) => {
  const [state, setState] = useState<GameState>(initialState || INITIAL_STATE);
  const [currentScenario, setCurrentScenario] = useState<AiScenarioPresentationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [timer, setTimer] = useState(15);
  const [lastMatchResult, setLastMatchResult] = useState<'win' | 'draw' | 'loss' | null>(null);

  const fetchScenario = useCallback(async () => {
    if (state.isSacked) return;
    setLoading(true);
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
    } catch (error) {
      console.error("Failed to fetch scenario", error);
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    if (!currentScenario && !isSimulating && !state.isSacked) {
      fetchScenario();
    }
  }, [currentScenario, isSimulating, state.isSacked, fetchScenario]);

  useEffect(() => {
    if (currentScenario && !isSimulating) {
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
  }, [currentScenario, isSimulating]);

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

    // Trigger match every 3 cards
    if ((state.cardsSeen + 1) % 3 === 0) {
      setIsSimulating(true);
    }
  };

  const onMatchComplete = (result: 'win' | 'draw' | 'loss') => {
    setIsSimulating(false);
    setLastMatchResult(result);
    setState(prev => {
      const newState = {
        ...prev,
        wins: result === 'win' ? prev.wins + 1 : prev.wins,
        draws: result === 'draw' ? prev.draws + 1 : prev.draws,
        losses: result === 'loss' ? prev.losses + 1 : prev.losses,
      };
      saveGameLocally(newState);
      return newState;
    });
  };

  const mood = calculateMood(state);
  const odds = getMatchOdds(state.aggression);

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
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden">
      {/* Header / Tension Triangle */}
      <div className="p-4 space-y-4 premium-glass border-b border-white/5 bg-black/20">
        <div className="flex justify-between items-center">
          <div className="font-headline text-lg tracking-tight uppercase">Dashboard</div>
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-[10px] opacity-50 uppercase font-headline">Record</div>
              <div className="text-sm font-headline">{state.wins}-{state.draws}-{state.losses}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatBar label="Board" value={state.boardSupport} colorClass="bg-blue-500" />
          <StatBar label="Fans" value={state.fanSupport} colorClass="bg-orange-500" />
          <StatBar label="Morale" value={state.dressingRoom} colorClass="bg-green-500" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {isSimulating ? (
          <MatchRadar onComplete={onMatchComplete} />
        ) : (
          <>
            <div className="flex flex-col items-center gap-4">
              <ManagerMoodView mood={mood} />
              <div className="text-center">
                <h2 className="font-headline text-xl text-white uppercase">{state.userTeam}</h2>
                <div className="text-[10px] font-headline text-accent uppercase tracking-widest">
                  Position {state.currentLeaguePosition} • {state.sagaObjective}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <span className="text-[10px] font-headline uppercase opacity-50">Transmitting Intel...</span>
              </div>
            ) : currentScenario ? (
              <SlantedContainer className="w-full relative scanline">
                {currentScenario.isBreaking && (
                  <div className="absolute top-0 right-0 bg-destructive text-white text-[8px] font-headline px-2 py-0.5 z-20">BREAKING NEWS</div>
                )}
                <div className="space-y-4">
                  <p className="text-lg leading-tight font-medium">{currentScenario.scenario}</p>
                  
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-1000" 
                      style={{ width: `${(timer / 15) * 100}%` }}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <SlantedButton 
                      onClick={() => handleDecision('left')}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-left justify-start"
                    >
                      {currentScenario.leftOption}
                    </SlantedButton>
                    <SlantedButton 
                      onClick={() => handleDecision('right')}
                      className="bg-primary/20 hover:bg-primary/30 border border-primary/50 text-xs text-left justify-start"
                    >
                      {currentScenario.rightOption}
                    </SlantedButton>
                  </div>
                </div>
              </SlantedContainer>
            ) : null}
          </>
        )}
      </div>

      {/* Footer / Aggression & Odds */}
      <div className="p-6 premium-glass mt-auto bg-black/40">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] font-headline uppercase opacity-50">Match Odds</div>
              <div className="font-headline text-lg tracking-tighter">
                <span className="text-blue-400">{odds.win}</span>
                <span className="mx-2 text-white/20">|</span>
                <span className="text-white/40">{odds.draw}</span>
                <span className="mx-2 text-white/20">|</span>
                <span className="text-orange-400">{odds.loss}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-headline uppercase opacity-50">Tactical Aggression</div>
              <div className="text-xl font-headline text-primary">{Math.round(state.aggression * 100)}%</div>
            </div>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-primary" style={{ width: `${state.aggression * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};