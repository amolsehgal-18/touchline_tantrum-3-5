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
  aggression: z.number().min(-0.1).max(0.1).describe('Impact on aggression (-0.1 to +0.1).'),
});

// Define the output schema for the AI scenario generation.
const AiScenarioPresentationOutputSchema = z.object({
  scenario: z.string().describe('The description of the scenario.'),
  leftOption: z.string().describe('Text for the left decision option.'),
  rightOption: z.string().describe('Text for the right decision option.'),
  impactLeft: ImpactSchema.describe('Impacts on stats if left option is chosen.'),
  impactRight: ImpactSchema.describe('Impacts on stats if right option is chosen.'),
  imageCategory: z.string().describe('Category for scenario image (e.g., "finance", "player_ego").'),
  isBreaking: z.boolean().describe('True if this is a critical breaking news scenario.'),
});

export type AiScenarioPresentationOutput = z.infer<typeof AiScenarioPresentationOutputSchema>;

// Helper to get a random aggression impact within the specified range (-0.1 to 0.1)
const getRandomAggressionImpact = (): number => {
  return (Math.random() * 0.2 - 0.1);
};

const aiScenarioPresentationPrompt = ai.definePrompt({
  name: 'aiScenarioPresentationPrompt',
  input: {
    schema: z.object({
      scenario: z.string(),
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
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a football manager simulator AI. Your task is to present a critical scenario to the manager, along with two distinct options and their pre-calculated impacts. The manager will choose one of these options.

You are currently managing {{{userTeam}}}, sitting at position {{{currentLeaguePosition}}} in the league.

Here is the scenario data:
Scenario: {{{scenario}}}
Left Option: {{{leftOption}}}
Right Option: {{{rightOption}}}

Your goal is to present this information clearly and concisely as a JSON object matching the provided schema. Do not add any conversational text outside the JSON. Ensure the 'scenario', 'leftOption', and 'rightOption' fields are exactly as provided.

Output JSON:
{
  "scenario": "{{{scenario}}}",
  "leftOption": "{{{leftOption}}}",
  "rightOption": "{{{rightOption}}}",
  "impactLeft": {
    "board": {{{impactLeft.board}}},
    "fans": {{{impactLeft.fans}}},
    "squad": {{{impactLeft.squad}}},
    "aggression": {{{impactLeft.aggression}}}
  },
  "impactRight": {
    "board": {{{impactRight.board}}},
    "fans": {{{impactRight.fans}}},
    "squad": {{{impactRight.squad}}},
    "aggression": {{{impactRight.aggression}}}
  },
  "imageCategory": "{{{imageCategory}}}",
  "isBreaking": {{{isBreaking}}}
}`
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

    // Apply stat-awareness filtering based on current game state.
    const { boardSupport, dressingRoom } = input;
    let prioritizedScenarios: ScenarioCardData[] = [];

    // Prioritize crises if Board Trust is low
    if (boardSupport < 0.3) {
        prioritizedScenarios = eligibleScenarios.filter(card =>
            card.isBreaking || ['finance', 'board_pressure'].includes(card.imageCategory)
        );
    }

    // Prioritize morale issues if Dressing Room is low
    if (dressingRoom < 0.3 && prioritizedScenarios.length === 0) {
        prioritizedScenarios = eligibleScenarios.filter(card =>
            ['locker', 'training'].includes(card.gameCategory)
        );
    }

    let finalScenarios = prioritizedScenarios.length > 0 ? prioritizedScenarios : eligibleScenarios;

    if (finalScenarios.length === 0) {
      finalScenarios = SCENARIO_CARDS;
    }

    const selectedScenario = finalScenarios[Math.floor(Math.random() * finalScenarios.length)];

    const impactLeft = {
      board: selectedScenario.boardImpact,
      fans: selectedScenario.fanImpact,
      squad: selectedScenario.dressingRoomImpact,
      aggression: getRandomAggressionImpact(),
    };

    const impactRight = {
      board: -selectedScenario.boardImpact,
      fans: -selectedScenario.fanImpact,
      squad: -selectedScenario.dressingRoomImpact,
      aggression: getRandomAggressionImpact(),
    };

    const promptInput = {
      scenario: selectedScenario.scenarioText,
      leftOption: selectedScenario.leftOptionText,
      rightOption: selectedScenario.rightOptionText,
      impactLeft: impactLeft,
      impactRight: impactRight,
      imageCategory: selectedScenario.imageCategory,
      isBreaking: selectedScenario.isBreaking,
      userTeam: input.userTeam,
      currentLeaguePosition: input.currentLeaguePosition,
    };

    const { output } = await aiScenarioPresentationPrompt(promptInput);
    return output!;
  }
);

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  return aiScenarioPresentationFlow(input);
}
