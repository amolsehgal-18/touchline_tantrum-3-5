export interface ScenarioCardData {
  scenarioText: string;
  leftOptionText: string;
  rightOptionText: string;
  boardImpact: number;
  fanImpact: number;
  dressingRoomImpact: number;
  aggressionImpact: number; // New impact field
  imageCategory: string;
  triggerCondition: string;
  gameCategory: string;
  isBreaking: boolean;
}

export const SCENARIO_CARDS: ScenarioCardData[] = [
  {
    scenarioText: "Your star striker refuses to celebrate after scoring, hinting at unrest.",
    leftOptionText: "Drop him for the next match.",
    rightOptionText: "Praise him publicly in the post-match presser.",
    boardImpact: -8,
    fanImpact: 2,
    dressingRoomImpact: 5,
    aggressionImpact: 0.15,
    imageCategory: "player_ego",
    triggerCondition: "performance_high",
    gameCategory: "locker",
    isBreaking: false
  },
  {
    scenarioText: "The team's veteran leader criticizes your tactics to the media.",
    leftOptionText: "Strip him of the captaincy.",
    rightOptionText: "Call a team meeting to address concerns.",
    boardImpact: -5,
    fanImpact: -3,
    dressingRoomImpact: 5,
    aggressionImpact: 0.1,
    imageCategory: "player_ego",
    triggerCondition: "performance_low",
    gameCategory: "locker",
    isBreaking: false
  },
  {
    scenarioText: "A young prospect arrives late to training for the third time this month.",
    leftOptionText: "Fine him two weeks' wages.",
    rightOptionText: "Make him run extra laps after training.",
    boardImpact: 0,
    fanImpact: -2,
    dressingRoomImpact: 5,
    aggressionImpact: 0.05,
    imageCategory: "training_ground",
    triggerCondition: "any_time",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "The board demands you play their expensive new signing.",
    leftOptionText: "Start him despite poor form.",
    rightOptionText: "Stick with your in-form player.",
    boardImpact: 10,
    fanImpact: -8,
    dressingRoomImpact: 2,
    aggressionImpact: -0.05,
    imageCategory: "board_pressure",
    triggerCondition: "new_signing",
    gameCategory: "press",
    isBreaking: false
  },
  {
    scenarioText: "Two key players clash over a penalty decision during a match.",
    leftOptionText: "Let the captain decide who takes it.",
    rightOptionText: "Hold a team vote on penalty duties.",
    boardImpact: -3,
    fanImpact: 0,
    dressingRoomImpact: -8,
    aggressionImpact: 0.12,
    imageCategory: "player_ego",
    triggerCondition: "match_day",
    gameCategory: "stadium",
    isBreaking: false
  },
  {
    scenarioText: "Your goalkeeper concedes a soft goal and blames the defenders.",
    leftOptionText: "Defend your defenders in the press.",
    rightOptionText: "Make the goalkeeper apologize privately.",
    boardImpact: -2,
    fanImpact: 5,
    dressingRoomImpact: 0,
    aggressionImpact: 0.08,
    imageCategory: "training_ground",
    triggerCondition: "performance_low",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "The team's fitness coach recommends dropping an aging star.",
    leftOptionText: "Follow the medical advice.",
    rightOptionText: "Keep playing your experienced leader.",
    boardImpact: -5,
    fanImpact: 8,
    dressingRoomImpact: 2,
    aggressionImpact: -0.1,
    imageCategory: "training_ground",
    triggerCondition: "player_injury",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "A player is caught partying two nights before a crucial derby.",
    leftOptionText: "Suspend him for three matches.",
    rightOptionText: "Give him a stern warning but start him.",
    boardImpact: -10,
    fanImpact: 5,
    dressingRoomImpact: 8,
    aggressionImpact: 0.2,
    imageCategory: "player_ego",
    triggerCondition: "match_important",
    gameCategory: "locker",
    isBreaking: false
  },
  {
    scenarioText: "The board sets unrealistic league position targets mid-season.",
    leftOptionText: "Publicly commit to the ambitious goal.",
    rightOptionText: "Push back citing squad limitations.",
    boardImpact: -15,
    fanImpact: 10,
    dressingRoomImpact: 2,
    aggressionImpact: 0.05,
    imageCategory: "board_pressure",
    triggerCondition: "performance_low",
    gameCategory: "press",
    isBreaking: false
  },
  {
    scenarioText: "Your assistant manager leaks team selection to the press.",
    leftOptionText: "Demand his resignation.",
    rightOptionText: "Handle it internally with a warning.",
    boardImpact: -8,
    fanImpact: 0,
    dressingRoomImpact: -2,
    aggressionImpact: 0.15,
    imageCategory: "board_pressure",
    triggerCondition: "any_time",
    gameCategory: "press",
    isBreaking: false
  },
  {
    scenarioText: "Players complain the training schedule is too intense.",
    leftOptionText: "Reduce the intensity and focus on recovery.",
    rightOptionText: "Increase intensity to build resilience.",
    boardImpact: 5,
    fanImpact: -5,
    dressingRoomImpact: 5,
    aggressionImpact: 0.25,
    imageCategory: "training_ground",
    triggerCondition: "performance_low",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "A financial audit reveals the club has been hiding massive debts.",
    leftOptionText: "Demand board resignations.",
    rightOptionText: "Support the board's difficult decisions.",
    boardImpact: -20,
    fanImpact: 5,
    dressingRoomImpact: -2,
    aggressionImpact: 0.1,
    imageCategory: "finance",
    triggerCondition: "financial_crisis",
    gameCategory: "press",
    isBreaking: true
  }
];