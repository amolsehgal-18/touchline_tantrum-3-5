"use client"

import React, { useEffect, useState } from 'react';
import { GameState, CAREER_MODES } from '@/lib/game-logic';
import { SlantedContainer, SlantedButton } from './slanted-elements';
import { Trophy, XCircle, Share2, Users, Briefcase, Heart } from 'lucide-react';
import { getSeasonFeedback, type FeedbackOutput } from '@/ai/flows/season-feedback-flow';

export const SeasonSummary = ({ state, onRestart }: { state: GameState, onRestart: () => void }) => {
  const [feedback, setFeedback] = useState<FeedbackOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const config = CAREER_MODES[state.mode];
  const isSuccess = state.currentLeaguePosition <= config.target && !state.isSacked;

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const result = await getSeasonFeedback({
          pos: state.currentLeaguePosition,
          target: config.target,
          board: state.boardSupport,
          fans: state.fanSupport,
          squad: state.dressingRoom,
          mode: config.name
        });
        setFeedback(result);
      } catch (e) {
        setFeedback({
          board: isSuccess ? "Mission accomplished." : "Targets were missed.",
          fans: isSuccess ? "The fans are happy." : "The fans want more.",
          squad: state.dressingRoom > 0.5 ? "The squad is united." : "The squad is fractured."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [state, config, isSuccess]);

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-6 overflow-y-auto">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          {isSuccess ? (
            <Trophy className="w-16 h-16 text-accent mx-auto animate-bounce" />
          ) : (
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
          )}
          <h1 className="text-4xl font-headline font-bold uppercase tracking-tighter">
            {isSuccess ? "OBJECTIVE MET" : "CONTRACT TERMINATED"}
          </h1>
          <p className="text-white/40 font-headline uppercase text-[10px] tracking-widest">Season Final Report</p>
        </div>

        <SlantedContainer className="space-y-6 border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[8px] font-headline uppercase opacity-50">Final Position</div>
              <div className="text-2xl font-headline font-bold text-accent">{state.currentLeaguePosition}th</div>
            </div>
            <div>
              <div className="text-[8px] font-headline uppercase opacity-50">Total Points</div>
              <div className="text-2xl font-headline font-bold">{state.points}</div>
            </div>
            <div>
              <div className="text-[8px] font-headline uppercase opacity-50">Record</div>
              <div className="text-xs font-headline opacity-80">{state.wins}W - {state.draws}D - {state.losses}L</div>
            </div>
            <div>
              <div className="text-[8px] font-headline uppercase opacity-50">Mode</div>
              <div className="text-xs font-headline opacity-80">{config.name}</div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Briefcase className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <div className="text-[8px] font-headline uppercase opacity-40">Board Room</div>
                  <p className="text-[10px] italic">{loading ? "Analyzing..." : feedback?.board}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Users className="w-4 h-4 text-orange-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <div className="text-[8px] font-headline uppercase opacity-40">The Stands</div>
                  <p className="text-[10px] italic">{loading ? "Analyzing..." : feedback?.fans}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Heart className="w-4 h-4 text-green-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <div className="text-[8px] font-headline uppercase opacity-40">Dressing Room</div>
                  <p className="text-[10px] italic">{loading ? "Analyzing..." : feedback?.squad}</p>
                </div>
              </div>
            </div>
          </div>
        </SlantedContainer>

        <div className="flex flex-col gap-3">
          <SlantedButton className="w-full bg-accent text-accent-foreground flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" /> Share Career Stats
          </SlantedButton>
          <SlantedButton onClick={onRestart} className="w-full bg-white text-black">
            START NEW CHAPTER
          </SlantedButton>
        </div>
      </div>
    </div>
  );
};
