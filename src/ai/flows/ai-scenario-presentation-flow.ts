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
    ]
  },
  prompt: `
  SYSTEM: You are the 'Touchline Tantrum' Scenario Engine. 
  RANDOM SEED: {{{randomSeed}}}
  
  CRITICAL RULE: Generate a COMPLETELY NEW scenario every time. Do not repeat previous themes or use generic fallbacks.
  
  CONTEXT FOR CLUB "{{{userTeam}}}":
  - Board Support: {{boardSupport}} (Current state: 0-1)
  - Fan Support: {{fanSupport}} (Current state: 0-1)
  - Morale: {{dressingRoom}} (Current state: 0-1)
  - Objective: {{{sagaObjective}}}
  - League Position: {{currentLeaguePosition}}
  
  TASK: Generate a dramatic boardroom, training ground, or media dilemma. 
  Use British football slang (gaffer, training ground, gaffer's office, etc.).
  
  Impact ranges: Board/Fans/Squad (-20 to +15), Aggression (-0.1 to +0.1).
  Make sure the choices are difficult and impactful. 
  NEVER mention previous ID or fallback references.`,
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
    console.error("AI Flow failed, using fallback cycle:", error);
    const randomIdx = Math.floor(Math.random() * FALLBACK_SCENARIOS.length);
    const fallback = FALLBACK_SCENARIOS[randomIdx];
    return {
      ...fallback,
      scenarioId: `${fallback.scenarioId}_${Date.now()}`
    };
  }
}
