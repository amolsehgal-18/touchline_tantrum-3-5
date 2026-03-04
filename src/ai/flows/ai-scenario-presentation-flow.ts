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
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `
  SYSTEM: You are the 'Touchline Tantrum' Scenario Engine. Your goal is to create unique, high-stakes football management dilemmas. 
  Use British football slang (gaffer, training ground, gaffer's office, etc.). 
  BE CREATIVE. Avoid repetitive tropes like "long-term commitment" or "tactical rigidity".
  
  CONTEXT FOR CLUB "{{{userTeam}}}":
  - League Position: {{{currentLeaguePosition}}}
  - Board Support: {{boardSupport}} (Scale 0-1)
  - Fan Support: {{fanSupport}} (Scale 0-1)
  - Dressing Room Morale: {{dressingRoom}} (Scale 0-1)
  - Tactical Aggression: {{aggression}} (Scale 0-1)
  - Seasonal Objective: {{{sagaObjective}}}
  - ENTROPY SEED: {{{randomSeed}}}
  
  TASK:
  Generate a completely original, dramatic, and punchy boardroom or dressing room scenario. 
  
  GENERATION RULES:
  1. If Board Support < 0.3, focus on 'Board Crisis', 'Financial Audit', or 'Ultimatum'.
  2. If Dressing Room < 0.3, focus on 'Player Revolt', 'Training Ground Fight', or 'Leaked DM'.
  3. If Fan Support < 0.3, focus on 'Stadium Protests', 'Angry Banners', or 'TalkSport Meltdowns'.
  4. If meeting Objective, focus on 'Manager Ego', 'Bigger Clubs Interest', or 'Contract Demands'.
  5. DO NOT mention "Long-term commitment" or "Tactical rigidity" - these are banned topics.
  6. ALWAYS generate completely new text for the scenario and options. 
  
  MATH CONSTRAINTS:
  - Board/Fans/Squad Impacts: Range from -20 to +15.
  - Aggression Impact: Range from -0.1 to +0.1.
  
  The scenarioId should be a unique random string based on the entropy seed.`,
});

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  try {
    const { output } = await aiScenarioPrompt(input);

    if (!output) throw new Error('AI Output null');
    
    return output;
  } catch (error) {
    // Detectable fallback to signal AI service failure
    return {
      scenario: "Your chief scout has identified a promising talent in the lower leagues, but the board is hesitant to release funds due to a recent audit.",
      leftOption: "Demand the investment now.",
      rightOption: "Accept the budget constraints.",
      impactLeft: { board: -12, fans: 8, squad: 4, aggression: 0.05 },
      impactRight: { board: 6, fans: -10, squad: -4, aggression: -0.05 },
      imageCategory: "scouting",
      isBreaking: false,
      scenarioId: "fallback_" + Date.now()
    };
  }
}