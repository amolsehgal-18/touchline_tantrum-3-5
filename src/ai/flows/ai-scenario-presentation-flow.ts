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
    ],
  },
  prompt: `You are a football manager simulator AI engine for the club "{{{userTeam}}}".
  
  CURRENT CONTEXT:
  - League Position: {{{currentLeaguePosition}}}
  - Board Support: {{boardSupport}} (decimal 0-1)
  - Fan Support: {{fanSupport}} (decimal 0-1)
  - Dressing Room Morale: {{dressingRoom}} (decimal 0-1)
  - Tactical Aggression: {{aggression}} (decimal 0-1)
  - Seasonal Objective: {{{sagaObjective}}}
  - Entropy Seed: {{{randomSeed}}}
  
  TASK:
  Generate a completely original, dramatic, and punchy boardroom or dressing room scenario. 
  
  GENERATION RULES:
  1. If Board Support < 0.3, focus on 'Board Crisis', 'Financial Audit', or 'Ultimatum'.
  2. If Dressing Room < 0.3, focus on 'Player Revolt', 'Training Ground Fight', or 'Leaked DM'.
  3. If Fan Support < 0.3, focus on 'Stadium Protests' or 'Banner Planes'.
  4. If meeting Objective, focus on 'Manager Ego', 'Media Links to Bigger Clubs', or 'Transfer Demands'.
  5. DO NOT repeat themes involving "Long-term commitment" or "Tactical rigidity".
  6. ALWAYS generate completely new text for the scenario and options. NEVER return a generic fallback.
  
  MATH CONSTRAINTS:
  - Board/Fans/Squad Impacts: Range from -20 to +15.
  - Aggression Impact: Range from -0.1 to +0.1.
  
  Make it satirical, high-stakes, and use British football terminology (gaffer, training ground, etc.).
  The scenarioId should be a unique random string.`,
});

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  try {
    const { output } = await aiScenarioPrompt(input);

    if (!output) throw new Error('AI Output null');
    
    return output;
  } catch (error) {
    // New detectable fallback to signal AI service failure vs uncreative AI
    return {
      scenario: "Your chief scout has identified a promising talent in the lower leagues, but the board is hesitant to release funds.",
      leftOption: "Demand the investment.",
      rightOption: "Accept the budget constraints.",
      impactLeft: { board: -10, fans: 5, squad: 2, aggression: 0.05 },
      impactRight: { board: 5, fans: -5, squad: -2, aggression: -0.05 },
      imageCategory: "scouting",
      isBreaking: false,
      scenarioId: "fallback_" + Math.random().toString(36).substring(7)
    };
  }
}