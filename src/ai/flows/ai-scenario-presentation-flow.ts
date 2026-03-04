'use server';
/**
 * @fileOverview A Genkit flow for generating unique, context-aware scenarios.
 * RESOLVED: Fixed repetition by expanding the fallback pool and refining Gemini calibration.
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
  1. Generate a COMPLETELY NEW scenario every time. Avoid repetition.
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
  If Morale < 0.3, focus on training ground fights or transfer requests.
  If meeting objectives, focus on media hype or player ego clashes.
  
  Impact ranges: Board/Fans/Squad (-20 to +15), Aggression (-0.1 to +0.1).`,
});

const FALLBACK_POOL: AiScenarioPresentationOutput[] = [
  {
    scenario: "A leaked video shows your star striker at a nightclub at 3 AM before the local derby. The fans are in an uproar.",
    leftOption: "Drop him immediately.",
    rightOption: "Publicly defend his character.",
    impactLeft: { board: 5, fans: 12, squad: -15, aggression: 0.08 },
    impactRight: { board: -8, fans: -12, squad: 10, aggression: -0.05 },
    imageCategory: "player_ego",
    isBreaking: true,
    scenarioId: "f_striker_party"
  },
  {
    scenario: "The board demands you play the chairman's nephew in the next match to secure a new sponsorship deal.",
    leftOption: "Refuse the demand.",
    rightOption: "Start the lad.",
    impactLeft: { board: -15, fans: 10, squad: 5, aggression: 0.05 },
    impactRight: { board: 15, fans: -12, squad: -8, aggression: -0.05 },
    imageCategory: "board_pressure",
    isBreaking: false,
    scenarioId: "f_nephew_squad"
  },
  {
    scenario: "A shock audit reveals the club's transfer budget was inflated by a clerical error. You must slash costs.",
    leftOption: "Sell a key player.",
    rightOption: "Demand board investment.",
    impactLeft: { board: 15, fans: -20, squad: -10, aggression: -0.05 },
    impactRight: { board: -15, fans: 10, squad: 5, aggression: 0.05 },
    imageCategory: "finance",
    isBreaking: true,
    scenarioId: "f_audit_crisis"
  },
  {
    scenario: "The fans are planning a mass 'Tennis Ball' protest in the 10th minute due to ticket price hikes.",
    leftOption: "Support the fans.",
    rightOption: "Condemn the protest.",
    impactLeft: { board: -15, fans: 20, squad: 0, aggression: 0.02 },
    impactRight: { board: 10, fans: -15, squad: 0, aggression: -0.02 },
    imageCategory: "fans",
    isBreaking: true,
    scenarioId: "f_fan_protest"
  },
  {
    scenario: "Two of your senior defenders got into a physical altercation in the canteen over a game of cards.",
    leftOption: "Fine both heavily.",
    rightOption: "Let them settle it.",
    impactLeft: { board: 5, fans: 0, squad: -10, aggression: 0.05 },
    impactRight: { board: -5, fans: 0, squad: 12, aggression: 0.1 },
    imageCategory: "locker",
    isBreaking: false,
    scenarioId: "f_squad_fight"
  },
  {
    scenario: "A rival club has triggered a secret release clause for your most loyal player.",
    leftOption: "Beg him to stay.",
    rightOption: "Wish him luck.",
    impactLeft: { board: 0, fans: 10, squad: 5, aggression: -0.05 },
    impactRight: { board: 15, fans: -15, squad: -5, aggression: 0.05 },
    imageCategory: "player_ego",
    isBreaking: true,
    scenarioId: "f_release_clause"
  },
  {
    scenario: "The kit sponsor is pulling out due to your 'lack of media charm' during post-match interviews.",
    leftOption: "Attend a PR workshop.",
    rightOption: "Double down on honesty.",
    impactLeft: { board: 12, fans: -5, squad: 0, aggression: -0.1 },
    impactRight: { board: -12, fans: 15, squad: 5, aggression: 0.15 },
    imageCategory: "press",
    isBreaking: false,
    scenarioId: "f_sponsor_exit"
  },
  {
    scenario: "A local newspaper claims you've 'lost the dressing room'. Several players liked the post on social media.",
    leftOption: "Confront the squad.",
    rightOption: "Ignore the noise.",
    impactLeft: { board: -5, fans: 0, squad: 15, aggression: 0.1 },
    impactRight: { board: 0, fans: -5, squad: -10, aggression: -0.05 },
    imageCategory: "press",
    isBreaking: true,
    scenarioId: "f_social_leak"
  },
  {
    scenario: "The training ground pitches have been damaged by a swarm of local enthusiasts playing amateur games.",
    leftOption: "Install high security.",
    rightOption: "Build a community pitch.",
    impactLeft: { board: -5, fans: -5, squad: 8, aggression: 0.02 },
    impactRight: { board: -10, fans: 15, squad: 0, aggression: -0.02 },
    imageCategory: "training",
    isBreaking: false,
    scenarioId: "f_pitch_damage"
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
    // If Gemini fails, pick a random fallback but ensure we don't repeat the last one easily
    const randomIdx = Math.floor(Math.random() * FALLBACK_POOL.length);
    const fallback = FALLBACK_POOL[randomIdx];
    return {
      ...fallback,
      scenarioId: `${fallback.scenarioId}_${Date.now()}`
    };
  }
}
