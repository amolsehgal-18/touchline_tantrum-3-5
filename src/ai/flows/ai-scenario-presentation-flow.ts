'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic, context-aware scenarios.
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
  excludedScenarioTexts: z.array(z.string()),
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
  
  Rewrite this scenario for the manager of {{{userTeam}}} (League Position: {{{currentLeaguePosition}}}).
  Make it punchy, dramatic, and context-aware.
  
  Base Scenario: {{{baseScenario}}}
  Option A (Left Swipe): {{{leftOption}}}
  Option B (Right Swipe): {{{rightOption}}}
  
  YOU MUST RETURN THESE IMPACTS EXACTLY:
  Left Impact: Board {{{impactLeft.board}}}, Fans {{{impactLeft.fans}}}, Squad {{{impactLeft.squad}}}, Aggression {{{impactLeft.aggression}}}
  Right Impact: Board {{{impactRight.board}}}, Fans {{{impactRight.fans}}}, Squad {{{impactRight.squad}}}, Aggression {{{impactRight.aggression}}}
  
  Image Category: {{{imageCategory}}}
  Is Breaking: {{{isBreaking}}}`,
});

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  try {
    let eligible = SCENARIO_CARDS.filter(c => !input.excludedScenarioTexts.includes(c.scenarioText));
    if (eligible.length === 0) eligible = SCENARIO_CARDS;
    
    const card = eligible[Math.floor(Math.random() * eligible.length)];

    const impactLeft = {
      board: card.boardImpact,
      fans: card.fanImpact,
      squad: card.dressingRoomImpact,
      aggression: card.aggressionImpact,
    };

    const impactRight = {
      board: -card.boardImpact,
      fans: -card.fanImpact,
      squad: -card.dressingRoomImpact,
      aggression: -card.aggressionImpact,
    };

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
    return output;
  } catch (error) {
    console.error('AI Flow Error, falling back to local database:', error);
    
    const eligible = SCENARIO_CARDS.filter(c => !input.excludedScenarioTexts.includes(c.scenarioText));
    const card = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : SCENARIO_CARDS[0];
    
    return {
      scenario: card.scenarioText,
      leftOption: card.leftOptionText,
      rightOption: card.rightOptionText,
      impactLeft: { board: card.boardImpact, fans: card.fanImpact, squad: card.dressingRoomImpact, aggression: card.aggressionImpact },
      impactRight: { board: -card.boardImpact, fans: -card.fanImpact, squad: -card.dressingRoomImpact, aggression: -card.aggressionImpact },
      imageCategory: card.imageCategory,
      isBreaking: card.isBreaking
    };
  }
}