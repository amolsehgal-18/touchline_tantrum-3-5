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
  model: 'gemini-1.5-flash',
  input: {
    schema: AiScenarioPresentationInputSchema
  },
  output: {schema: AiScenarioPresentationOutputSchema},
  config: {
    temperature: 1.0,
    topP: 0.95,
    topK: 40,
  },
  prompt: `
  ENTROPY SEED: {{{randomSeed}}}
  SYSTEM: You are the 'Touchline Tantrum' Scenario Engine. Your goal is to create unique, high-stakes football management dilemmas. 
  Use British football slang (gaffer, training ground, gaffer's office, etc.). 
  
  CRITICAL RULE: DO NOT repeat topics like "Long-term commitment" or "Tactical rigidity". Generate a COMPLETELY NEW scenario every time. Use the entropy seed to ensure total randomness.
  
  CONTEXT FOR CLUB "{{{userTeam}}}":
  - League Position: {{{currentLeaguePosition}}}
  - Board Support: {{boardSupport}} (Scale 0-1)
  - Fan Support: {{fanSupport}} (Scale 0-1)
  - Dressing Room Morale: {{dressingRoom}} (Scale 0-1)
  - Tactical Aggression: {{aggression}} (Scale 0-1)
  - Seasonal Objective: {{{sagaObjective}}}
  
  SCENARIO RULES:
  1. If Board Support < 0.3, focus on financial audits, takeovers, or executive ultimatums.
  2. If Dressing Room < 0.3, focus on player revolts, leaks, or training ground fights.
  3. If Fan Support < 0.3, focus on protests, banners, or social media toxicity.
  4. If meeting Objective, focus on manager ego, big club interest, or contract demands.
  
  OUTPUT: Generate a dramatic, punchy scenario and two options with mathematical impacts.
  Impact ranges: Board/Fans/Squad (-20 to +15), Aggression (-0.1 to +0.1).
  scenarioId must be a completely unique identifier based on the content.`,
});

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  try {
    const { output } = await aiScenarioPrompt(input);
    if (!output) throw new Error('AI Output null');
    return output;
  } catch (error) {
    const timestamp = Date.now();
    return {
      scenario: `Your chief scout has identified a promising talent in the lower leagues, but the board is hesitant to release funds due to a recent audit. [REF:${timestamp}]`,
      leftOption: "Demand the investment.",
      rightOption: "Accept the budget.",
      impactLeft: { board: -12, fans: 8, squad: 4, aggression: 0.05 },
      impactRight: { board: 6, fans: -10, squad: -4, aggression: -0.05 },
      imageCategory: "scouting",
      isBreaking: true,
      scenarioId: `fallback_scout_${timestamp}`
    };
  }
}
