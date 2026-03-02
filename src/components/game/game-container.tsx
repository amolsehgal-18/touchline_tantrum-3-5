"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameState, INITIAL_STATE, calculateMood, saveGameLocally, getMatchOdds, getLeagueTable, CAREER_MODES, CareerMode, calculateMatchResult } from '@/lib/game-logic';
import { SlantedButton, SlantedContainer } from './slanted-elements';
import { ManagerMoodView } from './manager-mood';
import { MatchRadar } from './match-radar';
import { TensionArcs } from './tension-arcs';
import { SwipeCard } from './swipe-card';
import { SeasonSummary } from './season-summary';
import { getAiScenarioPresentation } from '@/ai/flows/ai-scenario-presentation-flow';
import type { AiScenarioPresentationOutput } from '@/ai/flows/ai-scenario-presentation-flow';
import { RefreshCw, AlertTriangle, Trophy, Target, Shield, Calendar, ChevronLeft, User, Users, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export const GameContainer = ({ initialState }: { initialState?: GameState }) => {
  const [state, setState] = useState<GameState | null>(initialState || null);
  const [setupMode, setSetupMode] = useState<CareerMode | null>(null);
  const [managerName, setManagerName] = useState("Gaffer");
  const [clubName, setClubName] = useState("United FC");
  const [currentScenario, setCurrentScenario] = useState<AiScenarioPresentationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [matchIntro, setMatchIntro] = useState(false);
  const [pendingResult, setPendingResult] = useState<'win' | 'draw' | 'loss' | null>(null);
  const [opponentName, setOpponentName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const isFetchingRef = useRef(false);

  const activeConfig = state ? CAREER_MODES[state.mode].durations[state.durationIndex] : null;

  const handleDecision = useCallback((side: 'left' | 'right') => {
    if (!currentScenario || !state) return;

    const impact = side === 'left' ? currentScenario.impactLeft : currentScenario.impactRight;
    const newCardsSeen = state.cardsSeen + 1;
    
    const newState: GameState = {
      ...state,
      boardSupport: Math.min(1, Math.max(0, state.boardSupport + (impact.board / 100))),
      fanSupport: Math.min(1, Math.max(0, state.fanSupport + (impact.fans / 100))),
      dressingRoom: Math.min(1, Math.max(0, state.dressingRoom + (impact.squad / 100))),
      aggression: Math.min(1, Math.max(0.05, state.aggression + (impact.aggression || 0))),
      cardsSeen: newCardsSeen,
      history: [...state.history, currentScenario.scenario],
    };

    if (newState.boardSupport <= 0.05 || newState.fanSupport <= 0.05) {
      newState.isSacked = true;
    }

    setState(newState);
    saveGameLocally(newState);
    setCurrentScenario(null);
    setTimeLeft(15);

    if (newCardsSeen > 0 && newCardsSeen % 3 === 0) {
      const table = getLeagueTable(newState);
      const possibleOpponents = table.filter(t => !t.isUser);
      const opp = possibleOpponents[Math.floor(Math.random() * possibleOpponents.length)].team;
      setOpponentName(opp);
      setPendingResult(calculateMatchResult(newState));
      
      setMatchIntro(true);
      setTimeout(() => {
        setMatchIntro(false);
        setIsSimulating(true);
      }, 2000);
    }
  }, [currentScenario, state]);

  useEffect(() => {
    if (!currentScenario || isSimulating || matchIntro || loading || error || state?.isSacked || state?.isSeasonEnd) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleDecision('left');
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScenario, isSimulating, matchIntro, loading, error, state?.isSacked, state?.isSeasonEnd, handleDecision]);

  const fetchScenario = useCallback(async () => {
    if (!state || state.isSacked || state.isSeasonEnd || isFetchingRef.current || isSimulating || matchIntro) return;
    
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
        sagaObjective: CAREER_MODES[state.mode].name,
        objectiveMet: state.currentLeaguePosition <= activeConfig!.target,
        excludedScenarioTexts: state.history,
      });
      setCurrentScenario(result);
    } catch (err) {
      setError("Intel transmission interrupted.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [state, activeConfig, isSimulating, matchIntro]);

  useEffect(() => {
    if (state && !currentScenario && !isSimulating && !matchIntro && !state.isSacked && !state.isSeasonEnd && !loading && !error) {
      fetchScenario();
    }
  }, [state, currentScenario, isSimulating, matchIntro, loading, error, fetchScenario]);

  const onMatchComplete = () => {
    if (!state || !activeConfig || !pendingResult) return;

    setIsSimulating(false);
    const result = pendingResult;
    setPendingResult(null);
    
    const newMatchesPlayed = state.matchesPlayed + 1;
    const ptsEarned = result === 'win' ? 3 : result === 'draw' ? 1 : 0;
    
    const newState: GameState = {
      ...state,
      matchesPlayed: newMatchesPlayed,
      wins: result === 'win' ? state.wins + 1 : state.wins,
      draws: result === 'draw' ? state.draws + 1 : state.draws,
      losses: result === 'loss' ? state.losses + 1 : state.losses,
      points: state.points + ptsEarned,
      isSeasonEnd: newMatchesPlayed >= activeConfig.matches
    };

    const table = getLeagueTable(newState);
    newState.currentLeaguePosition = table.find(t => t.isUser)?.pos || state.currentLeaguePosition;

    if (newState.isSeasonEnd && newState.currentLeaguePosition > activeConfig.target) {
      newState.isSacked = true;
    }

    setState(newState);
    saveGameLocally(newState);
  };

  const startNewCareer = (mode: CareerMode, durationIndex: number) => {
    const newState = INITIAL_STATE(mode, durationIndex, managerName, clubName);
    setState(newState);
    saveGameLocally(newState);
  };

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

  const newsItems = useMemo(() => [
    "BREAKING: Fans plan protest outside stadium following tactical leaks.",
    `EXCLUSIVE: ${state?.userTeam} Board reportedly considering alternative options.`,
    "RUMOR: Star striker linked with shock move to rivals.",
    "NEWS: Under-23 coach praised for defensive improvements.",
    `STANDINGS: ${state?.userTeam} currently sitting in ${state?.currentLeaguePosition}th position.`
  ], [state]);

  if (!state) {
    if (setupMode) {
      const mode = CAREER_MODES[setupMode];
      return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-background p-6 overflow-y-auto">
          <button 
            onClick={() => setSetupMode(null)}
            className="flex items-center gap-2 text-white/50 mb-8 hover:text-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Modes
          </button>
          
          <div className="space-y-6 mb-8">
            <h2 className="text-3xl font-headline font-bold text-accent uppercase">{mode.name}</h2>
            
            <SlantedContainer className="space-y-4 border-white/5">
              <div className="space-y-1">
                <label className="text-[10px] font-headline uppercase opacity-40">Manager Identity</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <Input 
                    value={managerName} 
                    onChange={(e) => setManagerName(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 font-headline uppercase text-sm"
                    placeholder="Enter Name..."
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-headline uppercase opacity-40">Club Reputation</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <Input 
                    value={clubName} 
                    onChange={(e) => setClubName(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 font-headline uppercase text-sm"
                    placeholder="Enter Club..."
                  />
                </div>
              </div>
            </SlantedContainer>
          </div>

          <div className="grid gap-4">
            <label className="text-[10px] font-headline uppercase opacity-40 px-2">Select Campaign Length</label>
            {mode.durations.map((d, i) => (
              <button 
                key={i}
                onClick={() => startNewCareer(setupMode, i)}
                className="text-left p-6 premium-glass slanted-container border-white/10 hover:border-primary/50 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-headline font-bold uppercase">{d.label}</h3>
                    <div className="flex gap-4 text-[10px] font-headline opacity-40 uppercase mt-2">
                      <span>{d.matches} Matches</span>
                      <span>Target: Top {d.target}</span>
                    </div>
                  </div>
                  <Calendar className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background p-6 overflow-y-auto">
        <h2 className="text-3xl font-headline font-bold mb-8 text-accent uppercase">Select Career Path</h2>
        <div className="grid gap-4">
          {(Object.keys(CAREER_MODES) as CareerMode[]).map((modeKey) => {
            const m = CAREER_MODES[modeKey];
            const Icon = modeKey === 'title' ? Trophy : modeKey === 'top4' ? Target : modeKey === 'relegation' ? Shield : Calendar;
            return (
              <button 
                key={modeKey}
                onClick={() => setSetupMode(modeKey)}
                className="text-left p-6 premium-glass slanted-container border-white/10 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-headline font-bold uppercase">{m.name}</h3>
                    <p className="text-xs text-white/50">{m.description}</p>
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
  const currentGW = activeConfig ? activeConfig.startGW + state.matchesPlayed : 0;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-background shadow-2xl border-x border-white/5">
      {/* Top Header: Game Mode & GW */}
      <div className="bg-black/80 py-2 border-b border-white/5 text-center z-50">
        <span className="text-white text-[10px] font-headline font-black uppercase tracking-[0.4em]">
          {CAREER_MODES[state.mode].name} | GW {currentGW}
        </span>
      </div>

      <div className="bg-black/40 border-b border-white/5 p-3 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-headline uppercase tracking-widest text-accent flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Live Standings
          </span>
          <span className="text-[10px] font-headline uppercase opacity-50">Matchday {currentGW}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {windowedLeagueTable.map((team) => (
            <div 
              key={team.team} 
              className={cn(
                "flex justify-between items-center px-2 py-1.5 rounded text-[9px] transition-colors",
                team.isUser ? "bg-primary/20 border-l-2 border-primary" : "bg-white/5"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-headline opacity-50 w-3">{team.pos}</span>
                <span className={cn("font-bold truncate max-w-[120px]", team.isUser ? "text-primary" : "text-white")}>{team.team}</span>
              </div>
              <div className="flex items-center gap-5 pr-1 font-headline">
                <span className="opacity-40 w-3 text-center">{team.gp}</span>
                <span className="font-bold w-4 text-right">{team.pts}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 bg-transparent z-30 min-h-[140px] border-b border-white/5">
        <div className="flex justify-center items-center">
          <TensionArcs board={state.boardSupport} fans={state.fanSupport} />
        </div>
        <div className="flex justify-center items-center">
          <ManagerMoodView mood={mood} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-2 gap-2 relative overflow-hidden">
        {matchIntro && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl animate-in fade-in duration-500">
             <div className="space-y-2 text-center">
                <Zap className="w-12 h-12 text-accent mx-auto animate-bounce" />
                <h2 className="text-4xl font-headline font-black uppercase italic text-white tracking-tighter">
                  MATCHDAY
                </h2>
                <div className="text-[10px] font-headline uppercase tracking-[0.5em] text-accent/80">Preparing Tactics</div>
             </div>
             <div className="mt-8 flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-headline uppercase opacity-40">Opponent</div>
                  <div className="text-lg font-headline font-black uppercase text-white">{opponentName}</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-left">
                  <div className="text-[10px] font-headline uppercase opacity-40">Location</div>
                  <div className="text-lg font-headline font-black uppercase text-accent">Away</div>
                </div>
             </div>
          </div>
        )}

        {isSimulating ? (
          <MatchRadar 
            userTeam={state.userTeam}
            opponentTeam={opponentName}
            result={pendingResult} 
            onComplete={onMatchComplete} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            {loading ? (
              <div className="text-center space-y-4">
                <RefreshCw className="w-10 h-10 animate-spin text-primary mx-auto" />
                <p className="text-[10px] font-headline uppercase tracking-[0.3em] opacity-40">Processing Intelligence...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
                <p className="text-xs uppercase font-headline opacity-50">{error}</p>
                <SlantedButton onClick={fetchScenario}>Retry Feed</SlantedButton>
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

      {/* Bottom Section: Timer & Odds & News Ticker */}
      <div className="bg-black/80 border-t border-white/10 z-30">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center px-1">
            <div className="space-y-1">
              <div className="text-[10px] font-headline uppercase opacity-50 font-black">Tactical Confidence</div>
              <div className="font-headline text-sm flex items-center gap-2">
                <span className="text-blue-400">W {Math.round(parseFloat(odds.win) * 100)}%</span>
                <span className="text-white/40">D {Math.round(parseFloat(odds.draw) * 100)}%</span>
                <span className="text-orange-400">L {Math.round(parseFloat(odds.loss) * 100)}%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-headline uppercase opacity-50 font-black">Decision Time</div>
              <div className={cn(
                "text-lg font-headline font-black",
                timeLeft <= 5 ? "text-destructive animate-pulse" : "text-white"
              )}>
                {timeLeft}s
              </div>
            </div>
          </div>

          {/* 15-Second Progress Timer Bar */}
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-linear",
                timeLeft <= 5 ? "bg-destructive" : "bg-primary"
              )} 
              style={{ width: `${(timeLeft / 15) * 100}%` }} 
            />
          </div>
        </div>

        {/* Breaking News Ticker */}
        <div className="bg-destructive/10 border-t border-white/5 h-8 flex items-center overflow-hidden relative">
          <div className="bg-destructive text-white text-[8px] font-headline font-black px-3 py-1 z-20 absolute left-0 uppercase tracking-tighter">
            Breaking
          </div>
          <div className="animate-ticker flex items-center gap-12 pl-[100px]">
            {newsItems.map((item, idx) => (
              <span key={idx} className="text-[9px] font-headline uppercase tracking-widest text-white/70 whitespace-nowrap">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};