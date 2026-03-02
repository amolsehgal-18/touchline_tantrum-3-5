'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic, context-aware scenarios for the Touchline Tantrum game.
 * Includes a robust fallback mechanism to ensure the game remains playable even if the AI service is unavailable.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SCENARIO_CARDS } from '@/lib/game-scenarios';

// Define the input schema for the AI scenario generation flow.
const AiScenarioPresentationInputSchema = z.object({
  boardSupport: z.number().min(0.01).max(1.0),
  fanSupport: z.number().min(0.01).max(1.0),
  dressingRoom: z.number().min(0.01).max(1.0),
  aggression: z.number().min(0.01).max(1.0),
  userTeam: z.string(),
  currentLeaguePosition: z.number().int().min(1).max(20),
  sagaObjective: z.string(),
  objectiveMet: z.boolean(),
  excludedScenarioTexts: z.array(z.string()),
});

export type AiScenarioPresentationInput = z.infer<typeof AiScenarioPresentationInputSchema>;

const ImpactSchema = z.object({
  board: z.number().int(),
  fans: z.number().int(),
  squad: z.number().int(),
  aggression: z.number(),
});

const AiScenarioPresentationOutputSchema = z.object({
  scenario: z.string(),
  leftOption: z.string(),
  rightOption: z.string(),
  impactLeft: ImpactSchema,
  impactRight: ImpactSchema,
  imageCategory: z.string(),
  isBreaking: z.boolean(),
});

export type AiScenarioPresentationOutput = z.infer<typeof AiScenarioPresentationOutputSchema>;

const aiScenarioPresentationPrompt = ai.definePrompt({
  name: 'aiScenarioPresentationPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {
    schema: z.object({
      baseScenario: z.string(),
      leftOption: z.string(),
      rightOption: z.string(),
      impactLeft: ImpactSchema,
      impactRight: ImpactSchema,
      imageCategory: z.string(),
      isBreaking: z.boolean(),
      userTeam: z.string(),
      currentLeaguePosition: z.number().int(),
    })
  },
  output: {schema: AiScenarioPresentationOutputSchema},
  prompt: `You are a football manager simulator AI.
  
  Rewrite this scenario for the manager of {{{userTeam}}} (Pos: {{{currentLeaguePosition}}}).
  Make it punchy and dramatic.
  
  Base Scenario: {{{baseScenario}}}
  Option A (Left): {{{leftOption}}}
  Option B (Right): {{{rightOption}}}
  
  You MUST return the pre-calculated impacts exactly:
  Left Impact: Board {{{impactLeft.board}}}, Fans {{{impactLeft.fans}}}, Squad {{{impactLeft.squad}}}
  Right Impact: Board {{{impactRight.board}}}, Fans {{{impactRight.fans}}}, Squad {{{impactRight.squad}}}
  
  Image Category: {{{imageCategory}}}
  Is Breaking: {{{isBreaking}}}`,
});

const aiScenarioPresentationFlow = ai.defineFlow(
  {
    name: 'aiScenarioPresentationFlow',
    inputSchema: AiScenarioPresentationInputSchema,
    outputSchema: AiScenarioPresentationOutputSchema,
  },
  async (input) => {
    let eligibleScenarios = SCENARIO_CARDS.filter(
      (card) => !input.excludedScenarioTexts.includes(card.scenarioText)
    );

    if (eligibleScenarios.length === 0) eligibleScenarios = SCENARIO_CARDS;

    const selectedScenario = eligibleScenarios[Math.floor(Math.random() * eligibleScenarios.length)];

    const impactLeft = {
      board: selectedScenario.boardImpact,
      fans: selectedScenario.fanImpact,
      squad: selectedScenario.dressingRoomImpact,
      aggression: Math.random() * 0.2 - 0.1,
    };

    const impactRight = {
      board: -selectedScenario.boardImpact,
      fans: -selectedScenario.fanImpact,
      squad: -selectedScenario.dressingRoomImpact,
      aggression: Math.random() * 0.2 - 0.1,
    };

    const { output } = await aiScenarioPresentationPrompt({
      baseScenario: selectedScenario.scenarioText,
      leftOption: selectedScenario.leftOptionText,
      rightOption: selectedScenario.rightOptionText,
      impactLeft: impactLeft,
      impactRight: impactRight,
      imageCategory: selectedScenario.imageCategory,
      isBreaking: selectedScenario.isBreaking,
      userTeam: input.userTeam,
      currentLeaguePosition: input.currentLeaguePosition,
    });

    if (!output) throw new Error('AI failed');
    return output;
  }
);

/**
 * Robust wrapper for the scenario presentation flow.
 * If the AI service fails, it automatically falls back to a local scenario.
 */
export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  try {
    return await aiScenarioPresentationFlow(input);
  } catch (error) {
    console.error("Genkit Flow failed, using local fallback:", error);
    
    // Fallback logic using local SCENARIO_CARDS
    let eligible = SCENARIO_CARDS.filter(c => !input.excludedScenarioTexts.includes(c.scenarioText));
    if (eligible.length === 0) eligible = SCENARIO_CARDS;
    const card = eligible[Math.floor(Math.random() * eligible.length)];
    
    return {
      scenario: card.scenarioText,
      leftOption: card.leftOptionText,
      rightOption: card.rightOptionText,
      impactLeft: {
        board: card.boardImpact,
        fans: card.fanImpact,
        squad: card.dressingRoomImpact,
        aggression: 0.05
      },
      impactRight: {
        board: -card.boardImpact,
        fans: -card.fanImpact,
        squad: -card.dressingRoomImpact,
        aggression: -0.05
      },
      imageCategory: card.imageCategory,
      isBreaking: card.isBreaking
    };
  }
}