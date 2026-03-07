"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameState, INITIAL_STATE, calculateMood, saveGameLocally, getLeagueTable, CAREER_MODES, CareerMode, calculateMatchResult } from '@/lib/game-logic';
import { SlantedButton } from './slanted-elements';
import { ManagerMoodView } from './manager-mood';
import { MatchRadar } from './match-radar';
import { TensionArcs } from './tension-arcs';
import { SwipeCard } from './swipe-card';
import { SeasonSummary } from './season-summary';
import type { AiScenarioPresentationOutput } from '@/ai/flows/ai-scenario-presentation-flow';
import { getLocalScenario } from '@/lib/scenario-engine';
import { AlertTriangle, Zap, ArrowRight, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export const GameContainer = ({ initialState }: { initialState?: GameState }) => {
  const [state, setState] = useState<GameState | null>(initialState || null);
  const [currentScenario, setCurrentScenario] = useState<AiScenarioPresentationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [matchIntro, setMatchIntro] = useState(false);
  const [pendingResult, setPendingResult] = useState<'win' | 'draw' | 'loss' | null>(null);
  const [opponentName, setOpponentName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const [setupStep, setSetupStep] = useState(0);
  const [setupMode, setSetupMode] = useState<CareerMode>('season');
  const [setupDuration, setSetupDuration] = useState(0);
  const [setupName, setSetupName] = useState("Gaffer");
  const [setupTeam, setSetupTeam] = useState("United FC");

  const isFetchingRef = useRef(false);

  // ── Live news ticker ─────────────────────────────────────────
  const DEFAULT_NEWS = [
    "Guardiola dismisses talk of Man City crisis after Champions League exit",
    "Slot hails Liverpool pressing intensity ahead of title run-in",
    "Arteta calls for calm as Arsenal face pivotal week in Premier League",
    "Tuchel plots England formation overhaul for Nations League campaign",
    "Simeone extends Atlético contract amid reported board tensions",
    "Conte admits Napoli squad depth will be tested in final stretch",
    "Mourinho breaks silence on Roma dismissal: 'I'll be back'",
    "Flick credits Barcelona youth academy after comeback win",
    "Amorim sets strict training protocols after Man United's poor run",
  ];
  const [newsItems, setNewsItems] = useState<string[]>(DEFAULT_NEWS);
  const [newsSource, setNewsSource] = useState<'live' | 'fallback' | null>(null);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(({ items, source }: { items: string[]; source: 'live' | 'fallback' }) => {
        if (items?.length >= 3) { setNewsItems(items); setNewsSource(source); }
      })
      .catch(() => {});
  }, []);

  const activeConfig = state ? CAREER_MODES[state.mode].durations[state.durationIndex] : null;

  const handleDecision = useCallback((side: 'left' | 'right') => {
    if (!currentScenario || !state) return;

    const impact = side === 'left' ? currentScenario.impactLeft : currentScenario.impactRight;
    const newCardsSeen = state.cardsSeen + 1;

    const newState: GameState = {
      ...state,
      boardSupport: Math.min(1, Math.max(0, state.boardSupport + (impact.board / 100))),
      fanSupport:   Math.min(1, Math.max(0, state.fanSupport   + (impact.fans  / 100))),
      dressingRoom: Math.min(1, Math.max(0, state.dressingRoom + (impact.squad / 100))),
      cardsSeen: newCardsSeen,
      history: [...state.history, currentScenario.scenarioId],
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
        if (prev <= 1) { handleDecision('left'); return 15; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentScenario, isSimulating, matchIntro, loading, error, state?.isSacked, state?.isSeasonEnd, handleDecision]);

  const fetchScenario = useCallback(() => {
    if (!state || state.isSacked || state.isSeasonEnd || isFetchingRef.current || isSimulating || matchIntro) return;
    isFetchingRef.current = true;
    setError(null);
    try {
      const result = getLocalScenario({
        boardSupport: state.boardSupport,
        fanSupport:   state.fanSupport,
        dressingRoom: state.dressingRoom,
        userTeam:     state.userTeam,
        currentLeaguePosition: state.currentLeaguePosition,
        sagaObjective: CAREER_MODES[state.mode].name,
        objectiveMet:  state.currentLeaguePosition <= activeConfig!.target,
        excludedScenarioIds: state.history.slice(-50),
      });
      setCurrentScenario(result);
    } catch {
      setError("Scenario load failed. Tap to retry.");
    } finally {
      isFetchingRef.current = false;
    }
  }, [state, activeConfig, isSimulating, matchIntro]);

  useEffect(() => {
    if (state && !currentScenario && !isSimulating && !matchIntro && !state.isSacked && !state.isSeasonEnd && !error) {
      fetchScenario();
    }
  }, [state, currentScenario, isSimulating, matchIntro, error, fetchScenario]);

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
      wins:   result === 'win'  ? state.wins  + 1 : state.wins,
      draws:  result === 'draw' ? state.draws + 1 : state.draws,
      losses: result === 'loss' ? state.losses + 1 : state.losses,
      points: state.points + ptsEarned,
      isSeasonEnd: newMatchesPlayed >= activeConfig.matches,
    };

    const table = getLeagueTable(newState);
    newState.currentLeaguePosition = table.find(t => t.isUser)?.pos || state.currentLeaguePosition;
    if (newState.isSeasonEnd && newState.currentLeaguePosition > activeConfig.target) {
      newState.isSacked = true;
    }

    setState(newState);
    saveGameLocally(newState);
  };

  const windowedLeagueTable = useMemo(() => {
    if (!state) return [];
    const fullTable = getLeagueTable(state);
    const userIndex = fullTable.findIndex(t => t.isUser);
    let start = Math.max(0, userIndex - 1);
    let end   = start + 3;
    if (end > fullTable.length) { end = fullTable.length; start = Math.max(0, end - 3); }
    return fullTable.slice(start, end);
  }, [state]);


  // ── Setup screen ────────────────────────────────────────────
  if (!state) {
    return (
      <div className="flex flex-col h-dvh max-md:max-w-md md:max-w-md mx-auto bg-background p-6 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(251,177,60,0.08) 0%, transparent 70%)' }} />

        {setupStep === 0 && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center z-50">
            <div className="space-y-1">
              <h1 className="text-3xl font-headline font-black uppercase italic" style={{ color: '#FBB13C' }}>Gaffer Protocol</h1>
              <p className="text-[9px] font-headline uppercase tracking-[0.4em] opacity-40 font-black">Initialization Stage 01</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-headline uppercase font-black opacity-50 tracking-widest px-1">Manager Name</label>
                <Input value={setupName} onChange={(e) => setSetupName(e.target.value)} className="bg-white/5 h-11 border-white/10 font-bold text-sm" />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-headline uppercase font-black opacity-50 tracking-widest px-1">Club Identity</label>
                <Input value={setupTeam} onChange={(e) => setSetupTeam(e.target.value)} className="bg-white/5 h-11 border-white/10 font-bold text-sm" />
              </div>
              <SlantedButton onClick={() => setSetupStep(1)} className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest mt-2">
                Next: Choose Challenge
              </SlantedButton>
            </div>
          </div>
        )}

        {setupStep === 1 && (
          <div className="w-full space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 z-50">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-headline font-black uppercase italic" style={{ color: '#73D2DE' }}>The Mission</h2>
              <p className="text-[9px] font-headline uppercase tracking-[0.3em] opacity-40 font-black">Stage 02: Objectives</p>
            </div>
            <div className="grid gap-2">
              {(Object.keys(CAREER_MODES) as CareerMode[]).map((mode) => (
                <button key={mode} onClick={() => { setSetupMode(mode); setSetupStep(2); }}
                  className="flex flex-col p-3 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
                  <span className="font-headline font-black uppercase text-xs group-hover:text-accent">{CAREER_MODES[mode].name}</span>
                  <span className="text-[9px] opacity-60 mt-0.5 leading-tight">{CAREER_MODES[mode].description}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setSetupStep(0)} className="text-[9px] font-headline uppercase opacity-40 mx-auto block hover:opacity-100 font-black tracking-widest">Back to Identity</button>
          </div>
        )}

        {setupStep === 2 && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-50">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-headline font-black uppercase italic" style={{ color: '#FBB13C' }}>Final Prep</h2>
              <p className="text-[9px] font-headline uppercase tracking-[0.3em] opacity-40 font-black">Stage 03: Season Length</p>
            </div>
            <div className="grid gap-2">
              {CAREER_MODES[setupMode].durations.map((d, idx) => (
                <button key={idx} onClick={() => setSetupDuration(idx)}
                  className={cn("flex justify-between items-center p-4 rounded border transition-all", setupDuration === idx ? "text-black border-transparent" : "bg-white/5 border-white/10 opacity-60")}
                  style={setupDuration === idx ? { background: '#FBB13C' } : {}}>
                  <span className="font-headline font-black uppercase text-[11px]">{d.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <SlantedButton onClick={() => { try { const s = INITIAL_STATE(setupMode, setupDuration, setupName, setupTeam); setState(s); saveGameLocally(s); } catch(e) { console.error('Sign Contract failed:', e); } }}
                className="w-full py-5 text-base font-black tracking-widest uppercase bg-white text-black">
                Sign Contract
              </SlantedButton>
              <button onClick={() => setSetupStep(1)} className="text-[9px] font-headline uppercase opacity-40 mx-auto block font-black tracking-widest">Re-select Objective</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (state.isSeasonEnd || state.isSacked) {
    return <SeasonSummary state={state} onRestart={() => setState(null)} />;
  }

  const mood      = calculateMood(state);
  const currentGW = activeConfig ? activeConfig.startGW + state.matchesPlayed : 0;

  return (
    <div className="flex flex-col h-dvh max-md:max-w-md md:max-w-md mx-auto relative overflow-hidden bg-background shadow-2xl border-x border-white/5">

      {/* ── Header band ── */}
      <div
        className="mx-3 mt-1 mb-1 flex items-center justify-between z-[100]"
        style={{
          paddingTop: 'max(6px, env(safe-area-inset-top))',
          background: 'linear-gradient(135deg, rgba(251,177,60,0.13) 0%, rgba(251,177,60,0.04) 60%, transparent 100%)',
          border: '1px solid rgba(251,177,60,0.22)',
          borderLeft: '3px solid #FBB13C',
          borderRadius: '4px 10px 10px 4px',
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)',
        }}
      >
        <div className="py-1.5 pl-3 pr-2 min-w-0">
          <div className="text-[8px] font-headline font-black uppercase tracking-[3px] mb-0.5" style={{ color: '#FBB13C' }}>
            {CAREER_MODES[state.mode].name}
          </div>
          <div className="text-[17px] font-headline font-black uppercase leading-none text-white truncate">
            {state.userTeam}
          </div>
        </div>
        <div className="py-1.5 pl-3 pr-5 text-center flex-shrink-0">
          <div className="font-code text-[7px] uppercase tracking-[2px] opacity-50">GW</div>
          <div className="text-[24px] font-headline font-black leading-none" style={{ color: '#FBB13C', letterSpacing: '-1px' }}>
            {currentGW}
          </div>
        </div>
      </div>

      {/* ── Live standings ── */}
      <div className="mx-3 mb-1 rounded-lg overflow-hidden z-[90]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex justify-between items-center px-3 py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-1.5 text-[9px] font-headline font-black uppercase tracking-[2.5px]" style={{ color: '#FBB13C' }}>
            <div className="w-1 h-1 rounded-full blink-dot" style={{ background: '#FBB13C' }} />
            Live Standings
          </div>
        </div>
        <div className="grid px-3 text-[7px] font-code uppercase tracking-[2px] border-b text-white" style={{ gridTemplateColumns: '22px 1fr 28px 34px', borderColor: 'rgba(255,255,255,0.07)' }}>
          <span>#</span><span>Club</span><span className="text-center">G</span><span className="text-right">Pts</span>
        </div>
        {windowedLeagueTable.map((team) => (
          <div key={team.team} className="grid items-center px-3 py-[4px] relative" style={{
            gridTemplateColumns: '22px 1fr 28px 34px',
            borderTop: team.isUser ? '1px solid rgba(115,210,222,0.15)' : '1px solid rgba(255,255,255,0.04)',
            background: team.isUser ? 'linear-gradient(90deg,rgba(115,210,222,0.10) 0%,rgba(115,210,222,0.03) 80%,transparent 100%)' : 'transparent',
          }}>
            {team.isUser && <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r" style={{ background: '#73D2DE' }} />}
            <div className="text-[11px] font-headline font-black text-center" style={{ color: team.isUser ? '#73D2DE' : '#5A6878' }}>{team.pos}</div>
            <div className="text-[12px] font-headline font-black uppercase truncate" style={{ color: team.isUser ? '#73D2DE' : '#EDF2FF' }}>{team.team}</div>
            <div className="font-code text-[10px] text-center opacity-50">{team.gp}</div>
            <div className="text-[14px] font-headline font-black text-right" style={{ color: team.isUser ? '#73D2DE' : '#EDF2FF' }}>{team.pts}</div>
          </div>
        ))}
      </div>

      {/* ── Tension triangle + Manager portrait ── */}
      <div className="flex items-center px-3 pb-0 gap-3 z-10">
        <TensionArcs board={state.boardSupport} fans={state.fanSupport} dressing={state.dressingRoom} />
        <div className="ml-auto flex-shrink-0">
          <ManagerMoodView mood={mood} />
        </div>
      </div>

      {/* Thin amber divider */}
      <div className="mx-3 my-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(251,177,60,0.12),transparent)' }} />

      {/* ── Scenario area ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-1 relative overflow-hidden z-[80]">
        {matchIntro && (
          <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="space-y-2 text-center">
              <Zap className="w-10 h-10 mx-auto animate-bounce" style={{ color: '#FBB13C' }} />
              <h2 className="text-4xl font-headline font-black uppercase italic text-white tracking-tighter">MATCHDAY</h2>
              <div className="text-[10px] font-headline font-black uppercase tracking-[0.4em]" style={{ color: '#FBB13C' }}>Deploying Tactics</div>
            </div>
          </div>
        )}
        {isSimulating ? (
          <MatchRadar userTeam={state.userTeam} opponentTeam={opponentName} result={pendingResult} onComplete={onMatchComplete} />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            {error ? (
              <div className="text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
                <p className="text-xs uppercase font-headline opacity-60 font-black">{error}</p>
                <SlantedButton onClick={fetchScenario} className="text-[10px] py-2">Retry</SlantedButton>
              </div>
            ) : currentScenario ? (
              <SwipeCard scenario={currentScenario} onDecision={handleDecision} timeLeft={timeLeft} />
            ) : null}
          </div>
        )}
      </div>

      {/* ── Breaking news ticker — amber bg, black text, sits right below the card ── */}
      <div
        className="overflow-hidden flex-shrink-0 relative z-[100]"
        style={{
          background: '#FBB13C',
          paddingTop: '9px',
          paddingBottom: 'max(9px, env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* BREAKING badge */}
        <div
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-1 px-3 font-headline font-black text-[11px] uppercase text-black whitespace-nowrap"
          style={{ background: 'rgba(0,0,0,0.22)', borderRight: '1px solid rgba(0,0,0,0.12)', letterSpacing: '2.5px' }}
        >
          {newsSource === 'live' && <Wifi className="w-2.5 h-2.5" />}
          Breaking
        </div>
        {/* Scrolling headlines */}
        <div className="animate-ticker pl-[88px] flex items-center">
          {[...newsItems, ...newsItems].map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="font-headline font-black text-black" style={{ fontSize: '14px', letterSpacing: '0.3px' }}>{item}</span>
              <span className="inline-block w-1 h-1 rounded-full mx-3 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
};
