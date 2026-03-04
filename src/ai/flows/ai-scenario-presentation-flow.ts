'use server';
/**
 * @fileOverview A Genkit flow for generating truly unique, context-aware scenarios.
 * It leverages AI to create new dilemmas based on current stats, ensuring infinite variety.
 * 
 * - getAiScenarioPresentation - The main entry point for the UI.
 * - AiScenarioPresentationInput - Schema for the game state context.
 * - AiScenarioPresentationOutput - Schema for the generated dilemma.
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
    ]
  },
  prompt: `
  SYSTEM: You are the 'Touchline Tantrum' Scenario Engine. 
  ENTROPY SEED: {{{randomSeed}}}
  
  CRITICAL RULE: Generate a COMPLETELY NEW scenario every time. Do not repeat previous themes.
  
  CONTEXT FOR CLUB "{{{userTeam}}}":
  - Board Support: {{boardSupport}} (0-1)
  - Fan Support: {{fanSupport}} (0-1)
  - Morale: {{dressingRoom}} (0-1)
  - Objective: {{{sagaObjective}}}
  
  SCENARIO THEMES:
  1. Tactical leaks / Assistant Manager betrayal.
  2. Training ground fights / Player ego clashes.
  3. Transfer rumors / Secret buyout clauses.
  4. Fan protests / Social media toxicity.
  5. Financial audits / Shadowy consortia.
  
  Use British football slang (gaffer, training ground, gaffer's office, etc.).
  
  OUTPUT: Generate a dramatic, punchy scenario and two options.
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
    scenario: "A video of your star striker partying till 4 AM has leaked on social media. The fans are calling for blood.",
    leftOption: "Fine him and drop him.",
    rightOption: "Protect your player.",
    impactLeft: { board: 5, fans: 12, squad: -15, aggression: 0.08 },
    impactRight: { board: -5, fans: -15, squad: 10, aggression: -0.05 },
    imageCategory: "player_ego",
    isBreaking: true,
    scenarioId: "fallback_2"
  },
  {
    scenario: "Your assistant manager is rumored to be interviewing for a head coach role at a rival club.",
    leftOption: "Sack him immediately.",
    rightOption: "Offer him a pay rise.",
    impactLeft: { board: -5, fans: 5, squad: -10, aggression: 0.1 },
    impactRight: { board: -10, fans: -5, squad: 5, aggression: -0.05 },
    imageCategory: "board_pressure",
    isBreaking: false,
    scenarioId: "fallback_3"
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
    // If AI fails, pick a random fallback so it doesn't look like the same card
    const randomIdx = Math.floor(Math.random() * FALLBACK_SCENARIOS.length);
    const fallback = FALLBACK_SCENARIOS[randomIdx];
    return {
      ...fallback,
      scenarioId: `${fallback.scenarioId}_${Date.now()}`
    };
  }
}
