'use server';
/**
 * @fileOverview A Genkit flow for generating unique, context-aware scenarios.
 * RESOLVED: Fixed repetition by optimizing model configuration and entropy injection.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImpactSchema = z.object({
  board: z.number().int().describe('Impact on board support (-20 to 15)'),
  fans: z.number().int().describe('Impact on fan support (-20 to 15)'),
  squad: z.number().int().describe('Impact on dressing room morale (-20 to 15)'),
  aggression: z.number().describe('Impact on tactical aggression (-0.1 to 0.1)'),
});

const AiScenarioPresentationInputSchema = z.object({
  boardSupport: z.number(),
  fanSupport: z.number(),
  dressingRoom: z.number(),
  aggression: z.number(),
  userTeam: z.string(),
  currentLeaguePosition: z.number().int(),
  sagaObjective: z.string(),
  objectiveMet: z.boolean(),
  excludedScenarioIds: z.array(z.string()),
  randomSeed: z.string().optional(),
});

export type AiScenarioPresentationInput = z.infer<typeof AiScenarioPresentationInputSchema>;

const AiScenarioPresentationOutputSchema = z.object({
  scenario: z.string(),
  leftOption: z.string(),
  rightOption: z.string(),
  impactLeft: ImpactSchema,
  impactRight: ImpactSchema,
  imageCategory: z.string(),
  isBreaking: z.boolean(),
  scenarioId: z.string(),
});

export type AiScenarioPresentationOutput = z.infer<typeof AiScenarioPresentationOutputSchema>;

const aiScenarioPrompt = ai.definePrompt({
  name: 'aiScenarioPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {
    schema: AiScenarioPresentationInputSchema
  },
  output: {schema: AiScenarioPresentationOutputSchema},
  config: {
    temperature: 1.0,
    topP: 0.95,
    topK: 40,
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ]
  },
  prompt: `
  SYSTEM: You are the 'Touchline Tantrum' AI Scenario Engine. 
  UNIQUE ENTROPY KEY: {{{randomSeed}}}
  
  CRITICAL RULES:
  1. Generate a COMPLETELY NEW scenario every time. Use the entropy key to diverge your thoughts.
  2. Use gritty British football slang (gaffer, training ground, gaffer's office, etc.).
  3. Ensure the scenario is relevant to the club context.
  
  CONTEXT FOR CLUB "{{{userTeam}}}":
  - Board Support: {{boardSupport}} (Scale: 0-1)
  - Fan Support: {{fanSupport}} (Scale: 0-1)
  - Squad Morale: {{dressingRoom}} (Scale: 0-1)
  - Current League Position: {{currentLeaguePosition}}
  - Primary Objective: {{{sagaObjective}}}
  
  TASK: Generate a dramatic dilemma. 
  If Board Support < 0.3, focus on financial audits or boardroom coups.
  If Morale < 0.3, focus on training ground fights or player revolt.
  If meeting objectives, focus on media hype, player ego clashes, or sudden transfer requests.
  
  Impact ranges: Board/Fans/Squad (-20 to +15), Aggression (-0.1 to +0.1).`,
});

const FALLBACK_POOL: AiScenarioPresentationOutput[] = [
  {
    scenario: "A leaked video shows your star striker at a nightclub at 3 AM before the local derby. The fans are in an uproar.",
    leftOption: "Drop him immediately.",
    rightOption: "Publicly defend him.",
    impactLeft: { board: 5, fans: 12, squad: -15, aggression: 0.08 },
    impactRight: { board: -8, fans: -12, squad: 10, aggression: -0.05 },
    imageCategory: "player_ego",
    isBreaking: true,
    scenarioId: "f_striker_party"
  },
  {
    scenario: "The board demands you play the chairman's nephew in the next match to secure a sponsorship deal.",
    leftOption: "Refuse the demand.",
    rightOption: "Start the lad.",
    impactLeft: { board: -15, fans: 10, squad: 5, aggression: 0.05 },
    impactRight: { board: 15, fans: -12, squad: -8, aggression: -0.05 },
    imageCategory: "board_pressure",
    isBreaking: false,
    scenarioId: "f_nephew_squad"
  },
  {
    scenario: "A shock audit reveals the transfer budget was inflated by a clerical error. You must slash costs.",
    leftOption: "Sell a key player.",
    rightOption: "Demand investment.",
    impactLeft: { board: 15, fans: -20, squad: -10, aggression: -0.05 },
    impactRight: { board: -15, fans: 10, squad: 5, aggression: 0.05 },
    imageCategory: "finance",
    isBreaking: true,
    scenarioId: "f_audit_crisis"
  },
  {
    scenario: "Your assistant manager is rumored to be interviewing for a head coach role at a rival club mid-season.",
    leftOption: "Wish him well.",
    rightOption: "Block the move.",
    impactLeft: { board: 0, fans: -5, squad: -10, aggression: -0.02 },
    impactRight: { board: -5, fans: 5, squad: 5, aggression: 0.05 },
    imageCategory: "board_pressure",
    isBreaking: false,
    scenarioId: "f_assistant_exit"
  },
  {
    scenario: "A training ground brawl between your captain and a youth prospect has made the back pages.",
    leftOption: "Fine both heavily.",
    rightOption: "Defend the captain.",
    impactLeft: { board: 10, fans: 5, squad: -15, aggression: 0.1 },
    impactRight: { board: -5, fans: -5, squad: 12, aggression: 0.05 },
    imageCategory: "training_ground",
    isBreaking: true,
    scenarioId: "f_training_brawl"
  },
  {
    scenario: "The mascot was caught making an offensive gesture at rival fans during the last match.",
    leftOption: "Sack the mascot.",
    rightOption: "Issue an apology.",
    impactLeft: { board: 5, fans: -10, squad: 0, aggression: 0 },
    impactRight: { board: -5, fans: 10, squad: 0, aggression: 0 },
    imageCategory: "fans",
    isBreaking: false,
    scenarioId: "f_mascot_gate"
  },
  {
    scenario: "A legendary former manager publicly criticizes your 'lack of tactical identity' on a sports podcast.",
    leftOption: "Fire back at him.",
    rightOption: "Acknowledge his wisdom.",
    impactLeft: { board: -5, fans: 15, squad: 5, aggression: 0.15 },
    impactRight: { board: 5, fans: -15, squad: -5, aggression: -0.1 },
    imageCategory: "press",
    isBreaking: false,
    scenarioId: "f_legend_critique"
  },
  {
    scenario: "Fans are planning a minute's silence... for the death of your tactical ambition.",
    leftOption: "Attack the fans.",
    rightOption: "Promise better football.",
    impactLeft: { board: -10, fans: -20, squad: 10, aggression: 0.2 },
    impactRight: { board: 5, fans: 15, squad: -5, aggression: -0.1 },
    imageCategory: "fans",
    isBreaking: true,
    scenarioId: "f_tactical_protest"
  },
  {
    scenario: "Your star keeper has been caught smoking in the showers after a heavy defeat.",
    leftOption: "Drop him.",
    rightOption: "Fine him privately.",
    impactLeft: { board: 10, fans: 5, squad: -12, aggression: 0.05 },
    impactRight: { board: -5, fans: -5, squad: 8, aggression: -0.02 },
    imageCategory: "locker",
    isBreaking: false,
    scenarioId: "f_keeper_smoke"
  },
  {
    scenario: "A local billionaire wants to buy the club, but only if you are replaced by a 'big name' manager.",
    leftOption: "Rally the players.",
    rightOption: "Seek board reassurances.",
    impactLeft: { board: -15, fans: 10, squad: 15, aggression: 0.1 },
    impactRight: { board: 10, fans: -5, squad: -10, aggression: -0.05 },
    imageCategory: "finance",
    isBreaking: true,
    scenarioId: "f_takeover_threat"
  },
  {
    scenario: "The training ground pitch is waterlogged, and the board refuses to pay for repairs.",
    leftOption: "Pay for it yourself.",
    rightOption: "Train in the mud.",
    impactLeft: { board: -10, fans: 15, squad: 10, aggression: -0.05 },
    impactRight: { board: 5, fans: -5, squad: -15, aggression: 0.15 },
    imageCategory: "training_ground",
    isBreaking: false,
    scenarioId: "f_mud_training"
  }
];

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  try {
    const { output } = await aiScenarioPrompt(input);
    if (!output) throw new Error('AI Output null');
    return output;
  } catch (error) {
    // Enhanced local variety engine: pick a random fallback that isn't in the recent history
    const filteredPool = FALLBACK_POOL.filter(f => !input.excludedScenarioIds.includes(f.scenarioId));
    const pool = filteredPool.length > 0 ? filteredPool : FALLBACK_POOL;
    const randomIdx = Math.floor(Math.random() * pool.length);
    const fallback = pool[randomIdx];
    return {
      ...fallback,
      scenarioId: `${fallback.scenarioId}_${Date.now()}`
    };
  }
}
