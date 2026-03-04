
'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic, context-aware scenarios.
 * Uses unique ID tracking and strict exclusion to ensure variety.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SCENARIO_CARDS } from '@/lib/game-scenarios';

const ImpactSchema = z.object({
  board: z.number().int(),
  fans: z.number().int(),
  squad: z.number().int(),
  aggression: z.number(),
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
  
  Rewrite this scenario for the manager of {{{userTeam}}} (Current League Position: {{{currentLeaguePosition}}}).
  Make it punchy, dramatic, and context-aware. Use football terminology.
  
  Base Scenario: {{{baseScenario}}}
  Option A (Left): {{{leftOption}}}
  Option B (Right): {{{rightOption}}}
  
  YOU MUST RETURN THESE IMPACTS EXACTLY:
  Left Impact: Board {{{impactLeft.board}}}, Fans {{{impactLeft.fans}}}, Squad {{{impactLeft.squad}}}, Aggression {{{impactLeft.aggression}}}
  Right Impact: Board {{{impactRight.board}}}, Fans {{{impactRight.fans}}}, Squad {{{impactRight.squad}}}, Aggression {{{impactRight.aggression}}}
  
  Image Category: {{{imageCategory}}}
  Is Breaking: {{{isBreaking}}}`,
});

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  const excludedIds = input.excludedScenarioIds || [];
  
  let eligible = SCENARIO_CARDS.filter(c => !excludedIds.includes(c.id));
  
  if (eligible.length === 0) {
     eligible = SCENARIO_CARDS;
  }
  
  const card = eligible[Math.floor(Math.random() * eligible.length)];

  const impactLeft = {
    board: -card.boardImpact,
    fans: -card.fanImpact,
    squad: -card.dressingRoomImpact,
    aggression: -card.aggressionImpact,
  };

  const impactRight = {
    board: card.boardImpact,
    fans: card.fanImpact,
    squad: card.dressingRoomImpact,
    aggression: card.aggressionImpact,
  };

  try {
    const { output } = await aiScenarioPresentationPrompt({
      baseScenario: card.scenarioText,
      leftOption: card.leftOptionText,
      rightOption: card.rightOptionText,
      impactLeft,
      impactRight,
      imageCategory: card.imageCategory,
      isBreaking: card.isBreaking,
      userTeam: input.userTeam,
      currentLeaguePosition: input.currentLeaguePosition,
    });

    if (!output) throw new Error('AI Output null');
    
    return {
      ...output,
      scenarioId: card.id
    };
  } catch (error) {
    console.error('AI Flow Error:', error);
    // Hard fallback to ensure game continues
    return {
      scenario: card.scenarioText,
      leftOption: card.leftOptionText,
      rightOption: card.rightOptionText,
      impactLeft,
      impactRight,
      imageCategory: card.imageCategory,
      isBreaking: card.isBreaking,
      scenarioId: card.id
    };
  }
}
