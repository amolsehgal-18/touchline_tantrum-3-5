'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic, context-aware scenarios.
 * Uses a hybrid approach: local database for balance, AI for drama.
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
  originalScenarioText: z.string(),
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
  Option A (Left Swipe - REJECT): {{{leftOption}}}
  Option B (Right Swipe - APPROVE): {{{rightOption}}}
  
  YOU MUST RETURN THESE IMPACTS EXACTLY:
  Left Impact: Board {{{impactLeft.board}}}, Fans {{{impactLeft.fans}}}, Squad {{{impactLeft.squad}}}, Aggression {{{impactLeft.aggression}}}
  Right Impact: Board {{{impactRight.board}}}, Fans {{{impactRight.fans}}}, Squad {{{impactRight.squad}}}, Aggression {{{impactRight.aggression}}}
  
  Image Category: {{{imageCategory}}}
  Is Breaking: {{{isBreaking}}}
  
  CRITICAL: Set "originalScenarioText" to exactly: {{{baseScenario}}}`,
});

export async function getAiScenarioPresentation(
  input: AiScenarioPresentationInput
): Promise<AiScenarioPresentationOutput> {
  try {
    const excluded = input.excludedScenarioTexts || [];
    // Filter out scenarios already seen in history to prevent repetition
    let eligible = SCENARIO_CARDS.filter(c => !excluded.includes(c.scenarioText));
    
    // If we've run out of cards, recycle but pick randomly
    if (eligible.length === 0) {
       eligible = SCENARIO_CARDS;
    }
    
    // Pick a card from the filtered list
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
    
    // Explicitly return the base text for history tracking
    return {
      ...output,
      originalScenarioText: card.scenarioText
    };
  } catch (error) {
    const excluded = input.excludedScenarioTexts || [];
    const eligible = SCENARIO_CARDS.filter(c => !excluded.includes(c.scenarioText));
    const card = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : SCENARIO_CARDS[Math.floor(Math.random() * SCENARIO_CARDS.length)];
    
    return {
      scenario: card.scenarioText,
      leftOption: card.leftOptionText,
      rightOption: card.rightOptionText,
      impactLeft: { board: -card.boardImpact, fans: -card.fanImpact, squad: -card.dressingRoomImpact, aggression: -card.aggressionImpact },
      impactRight: { board: card.boardImpact, fans: card.fanImpact, squad: card.dressingRoomImpact, aggression: card.aggressionImpact },
      imageCategory: card.imageCategory,
      isBreaking: card.isBreaking,
      originalScenarioText: card.scenarioText
    };
  }
}
