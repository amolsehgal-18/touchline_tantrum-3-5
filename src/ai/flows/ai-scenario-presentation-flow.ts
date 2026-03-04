
'use server';
/**
 * @fileOverview A Genkit flow for generating truly unique, context-aware scenarios.
 * Instead of picking from a list, it leverages AI to create new dilemmas based on current stats.
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
  prompt: `You are a football manager simulator AI engine for the club "{{{userTeam}}}".
  
  CURRENT CONTEXT:
  - League Position: {{{currentLeaguePosition}}}
  - Board Support: {{boardSupport}} (as decimal)
  - Fan Support: {{fanSupport}} (as decimal)
  - Dressing Room Morale: {{dressingRoom}} (as decimal)
  - Tactical Aggression: {{aggression}} (as decimal)
  - Seasonal Objective: {{{sagaObjective}}}
  
  TASK:
  Generate a unique, dramatic, and punchy boardroom or dressing room scenario. 
  
  GENERATION RULES:
  1. If Board Support < 0.3, focus on 'Board Crisis', 'Financial Audit', or 'Ultimatum'.
  2. If Dressing Room < 0.3, focus on 'Player Revolt', 'Training Ground Fight', or 'Leaked DM'.
  3. If Fan Support < 0.3, focus on 'Stadium Protests' or 'Banner Planes'.
  4. If meeting Objective, focus on 'Manager Ego', 'Media Links to Bigger Clubs', or 'Transfer Demands'.
  
  MATH CONSTRAINTS:
  - Board/Fans/Squad Impacts: Range from -20 to +15.
  - Aggression Impact: Range from -0.1 to +0.1.
  
  Make it satirical, high-stakes, and use British football terminology (gaffer, gaffer's office, training ground, etc.).
  The scenarioId should be a unique string starting with 'ai_'.`,
});

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  try {
    const { output } = await aiScenarioPrompt(input);

    if (!output) throw new Error('AI Output null');
    
    return output;
  } catch (error) {
    console.error('AI Flow Error:', error);
    // Hard fallback to ensure game continues
    return {
      scenario: "The local press is asking about your long-term commitment to the club.",
      leftOption: "Commit your future.",
      rightOption: "Stay vague.",
      impactLeft: { board: 5, fans: 5, squad: 2, aggression: 0 },
      impactRight: { board: -5, fans: -5, squad: -2, aggression: 0.05 },
      imageCategory: "press",
      isBreaking: false,
      scenarioId: "fallback_001"
    };
  }
}
