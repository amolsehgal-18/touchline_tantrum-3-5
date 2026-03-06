/**
 * Local Scenario Engine — replaces AI generation.
 * 725 hand-crafted scenarios. Tracks global history in localStorage
 * so users never see the same scenario twice across ~100+ sessions.
 */

import scenarioData from './scenarios.json';
import type { AiScenarioPresentationOutput, AiScenarioPresentationInput } from '@/ai/flows/ai-scenario-presentation-flow';

type LocalScenario = AiScenarioPresentationOutput & { gameCategory: string };
const ALL_SCENARIOS = scenarioData.scenarios as LocalScenario[];

const HISTORY_KEY = 'tt_global_scenario_history';
const MAX_HISTORY = 600; // covers ~100 games of ~6 scenarios each

function loadHistory(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveHistory(history: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    // Keep only the last MAX_HISTORY ids to avoid unbounded growth
    const arr = Array.from(history).slice(-MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
  } catch {}
}

function markSeen(scenarioId: string) {
  const history = loadHistory();
  history.add(scenarioId);
  saveHistory(history);
}

export function getLocalScenario(input: AiScenarioPresentationInput): AiScenarioPresentationOutput {
  const globalHistory = loadHistory();
  // Also exclude IDs seen in current session (passed in from game state)
  const excluded = new Set([...globalHistory, ...input.excludedScenarioIds]);

  // Filter out already-seen scenarios
  let pool = ALL_SCENARIOS.filter(s => !excluded.has(s.scenarioId));

  // If pool exhausted, reset global history and use full set
  if (pool.length === 0) {
    saveHistory(new Set());
    pool = ALL_SCENARIOS;
  }

  // Contextual weighting: prefer scenarios relevant to current game state
  const weighted = pool.map(s => {
    let weight = 1;
    const { boardSupport, fanSupport, dressingRoom } = input;

    if (boardSupport < 0.35 && s.gameCategory === 'press') weight += 3;
    if (fanSupport < 0.35 && s.gameCategory === 'locker') weight += 2;
    if (dressingRoom < 0.35 && s.gameCategory === 'training') weight += 3;
    if (s.isBreaking) weight += 1;

    return { scenario: s, weight };
  });

  // Weighted random pick
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let rand = Math.random() * totalWeight;
  let picked = weighted[0].scenario;
  for (const { scenario, weight } of weighted) {
    rand -= weight;
    if (rand <= 0) { picked = scenario; break; }
  }

  markSeen(picked.scenarioId);
  return picked;
}
