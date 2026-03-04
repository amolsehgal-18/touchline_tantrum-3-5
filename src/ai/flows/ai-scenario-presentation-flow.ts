'use server';
/**
 * @fileOverview A Genkit flow for generating truly unique, context-aware scenarios.
 * It leverages AI to create new dilemmas based on current stats, ensuring infinite variety.
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
  1. Generate a COMPLETELY NEW scenario every time. 
  2. NEVER use the themes "Long-term commitment", "Tactical rigidity", or "Assistant Manager interviewing".
  3. DO NOT repeat the entropy key or any "REF" codes in your output.
  4. Use gritty British football slang (gaffer, training ground, gaffer's office, etc.).
  
  CONTEXT FOR CLUB "{{{userTeam}}}":
  - Board Support: {{boardSupport}} (Scale: 0-1)
  - Fan Support: {{fanSupport}} (Scale: 0-1)
  - Squad Morale: {{dressingRoom}} (Scale: 0-1)
  - Current League Position: {{currentLeaguePosition}}
  - Primary Objective: {{{sagaObjective}}}
  
  TASK: Generate a dramatic dilemma based on the stats above. 
  If Board Support is low, generate a financial or boardroom crisis.
  If Morale is low, generate a dressing room revolt or training ground fight.
  If meeting objectives, generate a media distraction or player ego problem.
  
  Impact ranges: Board/Fans/Squad (-20 to +15), Aggression (-0.1 to +0.1).`,
});

const FALLBACK_SCENARIOS: AiScenarioPresentationOutput[] = [
  {
    scenario: "Your chief scout has identified a promising talent in the lower leagues, but the board is hesitant to release funds due to a recent audit.",
    leftOption: "Demand the investment.",
    rightOption: "Accept the budget.",
    impactLeft: { board: -12, fans: 8, squad: 4, aggression: 0.05 },
    impactRight: { board: 6, fans: -10, squad: -4, aggression: -0.05 },
    imageCategory: "scouting",
    isBreaking: true,
    scenarioId: "fallback_1"
  },
  {
    scenario: "A leaked video shows your star striker at a 4 AM rave. The fans are calling for him to be stripped of the vice-captaincy.",
    leftOption: "Fine him and drop him.",
    rightOption: "Protect your player.",
    impactLeft: { board: 5, fans: 12, squad: -15, aggression: 0.08 },
    impactRight: { board: -5, fans: -15, squad: 10, aggression: -0.05 },
    imageCategory: "player_ego",
    isBreaking: true,
    scenarioId: "fallback_2"
  },
  {
    scenario: "Your assistant manager is being linked with a head coach role at a direct rival. The squad looks distracted.",
    leftOption: "Sack him immediately.",
    rightOption: "Offer him a pay rise.",
    impactLeft: { board: -5, fans: 5, squad: -10, aggression: 0.1 },
    impactRight: { board: -10, fans: -5, squad: 5, aggression: -0.05 },
    imageCategory: "board_pressure",
    isBreaking: false,
    scenarioId: "fallback_3"
  },
  {
    scenario: "A 'Super League' rumor has surfaced involving your club's owners. Fans are planning a banner protest at the next match.",
    leftOption: "Back the fans.",
    rightOption: "Support the owners.",
    impactLeft: { board: -15, fans: 20, squad: 5, aggression: 0 },
    impactRight: { board: 15, fans: -25, squad: -5, aggression: 0 },
    imageCategory: "board_pressure",
    isBreaking: true,
    scenarioId: "fallback_4"
  },
  {
    scenario: "The groundsman reports that the pitch is in 'atrocious' condition, but fixing it would eat into the transfer budget.",
    leftOption: "Fix the pitch.",
    rightOption: "Save the money.",
    impactLeft: { board: -8, fans: 5, squad: 10, aggression: -0.05 },
    impactRight: { board: 10, fans: -5, squad: -12, aggression: 0.1 },
    imageCategory: "stadium",
    isBreaking: false,
    scenarioId: "fallback_5"
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
    console.error("AI Flow failed, using rotating fallback:", error);
    // Rotating fallback to avoid feeling repetitive even when offline/errored
    const randomIdx = Math.floor(Math.random() * FALLBACK_SCENARIOS.length);
    const fallback = FALLBACK_SCENARIOS[randomIdx];
    return {
      ...fallback,
      scenarioId: `${fallback.scenarioId}_${Date.now()}`
    };
  }
}
