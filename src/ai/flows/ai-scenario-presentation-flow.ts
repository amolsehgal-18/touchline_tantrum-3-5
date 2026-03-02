'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic, context-aware scenarios for the Touchline Tantrum game.
 *
 * - getAiScenarioPresentation - A function that handles the AI scenario generation process.
 * - AiScenarioPresentationInput - The input type for the getAiScenarioPresentation function.
 * - AiScenarioPresentationOutput - The return type for the getAiScenarioPresentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SCENARIO_CARDS, type ScenarioCardData } from '@/lib/game-scenarios';

// Define the input schema for the AI scenario generation flow.
const AiScenarioPresentationInputSchema = z.object({
  boardSupport: z.number().min(0.01).max(1.0).describe('Current board support (0.01-1.0)'),
  fanSupport: z.number().min(0.01).max(1.0).describe('Current fan support (0.01-1.0)'),
  dressingRoom: z.number().min(0.01).max(1.0).describe('Current dressing room morale (0.01-1.0)'),
  aggression: z.number().min(0.01).max(1.0).describe('Current team aggression (0.01-1.0)'),
  userTeam: z.string().describe('The name of the user\'s team.'),
  currentLeaguePosition: z.number().int().min(1).max(20).describe('Current league position.'),
  sagaObjective: z.string().describe('Current season objective (e.g., "Top 4", "Avoid Relegation").'),
  objectiveMet: z.boolean().describe('Whether the current objective is being met.'),
  excludedScenarioTexts: z.array(z.string()).describe('List of scenario texts to exclude to prevent repetition.'),
});

export type AiScenarioPresentationInput = z.infer<typeof AiScenarioPresentationInputSchema>;

// Define the schema for the impact of a decision.
const ImpactSchema = z.object({
  board: z.number().int().describe('Impact on board support (-20 to +15).'),
  fans: z.number().int().describe('Impact on fan support (-20 to +15).'),
  squad: z.number().int().describe('Impact on dressing room morale (-20 to +15).'),
  aggression: z.number().describe('Impact on aggression (-0.1 to +0.1).'),
});

// Define the output schema for the AI scenario generation.
const AiScenarioPresentationOutputSchema = z.object({
  scenario: z.string().describe('The description of the scenario, customized for the user\'s team.'),
  leftOption: z.string().describe('Text for the left decision option.'),
  rightOption: z.string().describe('Text for the right decision option.'),
  impactLeft: ImpactSchema.describe('Impacts on stats if left option is chosen.'),
  impactRight: ImpactSchema.describe('Impacts on stats if right option is chosen.'),
  imageCategory: z.string().describe('Category for scenario image (e.g., "finance", "player_ego").'),
  isBreaking: z.boolean().describe('True if this is a critical breaking news scenario.'),
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
      currentLeaguePosition: z.number().int().min(1).max(20),
    })
  },
  output: {schema: AiScenarioPresentationOutputSchema},
  prompt: `You are a football manager simulator AI for the game "Touchline Tantrum".
  
  Your task is to rewrite and present a scenario to the manager of {{{userTeam}}}, who are currently {{{currentLeaguePosition}}} in the league.
  
  Base Scenario: {{{baseScenario}}}
  Option A (Left): {{{leftOption}}}
  Option B (Right): {{{rightOption}}}
  
  Instructions:
  1. Rewrite the scenario to be punchy, dramatic, and specific to {{{userTeam}}}.
  2. Keep the core meaning of the scenario and the options.
  3. Return the pre-calculated impacts exactly as provided.
  4. Ensure the output matches the requested JSON schema.
  
  Pre-calculated Impacts (DO NOT CHANGE THESE):
  Left: Board: {{{impactLeft.board}}}, Fans: {{{impactLeft.fans}}}, Squad: {{{impactLeft.squad}}}, Aggression: {{{impactLeft.aggression}}}
  Right: Board: {{{impactRight.board}}}, Fans: {{{impactRight.fans}}}, Squad: {{{impactRight.squad}}}, Aggression: {{{impactRight.aggression}}}
  
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
    // Filter out scenarios that have been recently used.
    let eligibleScenarios = SCENARIO_CARDS.filter(
      (card) => !input.excludedScenarioTexts.includes(card.scenarioText)
    );

    // Fallback: If all scenarios used, reset or pick any
    if (eligibleScenarios.length === 0) {
      eligibleScenarios = SCENARIO_CARDS;
    }

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

    if (!output) {
      throw new Error('AI failed to generate a scenario presentation');
    }

    return output;
  }
);

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  return aiScenarioPresentationFlow(input);
}
