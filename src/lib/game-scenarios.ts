export interface ScenarioCardData {
  scenarioText: string;
  leftOptionText: string;
  rightOptionText: string;
  boardImpact: number;
  fanImpact: number;
  dressingRoomImpact: number;
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
    imageCategory: "training_ground",
    triggerCondition: "performance_low",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "A player demands a new contract after six good games.",
    leftOptionText: "Open negotiations immediately.",
    rightOptionText: "Tell him to prove himself over a full season.",
    boardImpact: -5,
    fanImpact: 0,
    dressingRoomImpact: 10,
    imageCategory: "player_ego",
    triggerCondition: "performance_high",
    gameCategory: "locker",
    isBreaking: false
  },
  {
    scenarioText: "The team hotel for an away game has poor facilities.",
    leftOptionText: "Demand an immediate upgrade.",
    rightOptionText: "Tell players to focus on football.",
    boardImpact: -5,
    fanImpact: -3,
    dressingRoomImpact: -2,
    imageCategory: "training_ground",
    triggerCondition: "away_game",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "Your set-piece coach wants to change the corner routine.",
    leftOptionText: "Implement the new routine immediately.",
    rightOptionText: "Stick with what's been working.",
    boardImpact: 2,
    fanImpact: 0,
    dressingRoomImpact: -2,
    imageCategory: "training_ground",
    triggerCondition: "match_day",
    gameCategory: "stadium",
    isBreaking: false
  },
  {
    scenarioText: "A player refuses to be substituted despite being injured.",
    leftOptionText: "Force him off for his own safety.",
    rightOptionText: "Let him play through the pain.",
    boardImpact: -8,
    fanImpact: 10,
    dressingRoomImpact: -5,
    imageCategory: "player_ego",
    triggerCondition: "match_important",
    gameCategory: "stadium",
    isBreaking: false
  },
  {
    scenarioText: "The team's analytics department clashes with your scouts.",
    leftOptionText: "Side with the data analysts.",
    rightOptionText: "Trust your experienced scouts.",
    boardImpact: 3,
    fanImpact: -2,
    dressingRoomImpact: 0,
    imageCategory: "board_pressure",
    triggerCondition: "transfer_window",
    gameCategory: "press",
    isBreaking: false
  },
  {
    scenarioText: "Players are using social media during team meetings.",
    leftOptionText: "Ban phones from all team areas.",
    rightOptionText: "Implement a fine system for violations.",
    boardImpact: 2,
    fanImpact: 0,
    dressingRoomImpact: 2,
    imageCategory: "training_ground",
    triggerCondition: "any_time",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "A youth team player criticizes first-team training methods.",
    leftOptionText: "Bring him into first-team training.",
    rightOptionText: "Send him back to the youth setup.",
    boardImpact: -3,
    fanImpact: 5,
    dressingRoomImpact: -5,
    imageCategory: "training_ground",
    triggerCondition: "any_time",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "The medical staff clears a player you think needs more time.",
    leftOptionText: "Accept their professional judgment.",
    rightOptionText: "Override them and extend recovery.",
    boardImpact: -5,
    fanImpact: 0,
    dressingRoomImpact: -2,
    imageCategory: "training_ground",
    triggerCondition: "player_injury",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "Your captain organizes an unsanctioned team bonding trip.",
    leftOptionText: "Join them to supervise the evening.",
    rightOptionText: "Ban all unofficial team gatherings.",
    boardImpact: -10,
    fanImpact: 5,
    dressingRoomImpact: -8,
    imageCategory: "player_ego",
    triggerCondition: "any_time",
    gameCategory: "locker",
    isBreaking: false
  },
  {
    scenarioText: "A player's agent demands a starting guarantee.",
    leftOptionText: "Refuse to give any guarantees.",
    rightOptionText: "Promise rotation and fair chances.",
    boardImpact: -5,
    fanImpact: 0,
    dressingRoomImpact: -5,
    imageCategory: "player_ego",
    triggerCondition: "new_signing",
    gameCategory: "locker",
    isBreaking: false
  },
  {
    scenarioText: "The team's nutrition plan is being ignored by senior players.",
    leftOptionText: "Make meal attendance mandatory.",
    rightOptionText: "Appoint a player committee for nutrition.",
    boardImpact: 3,
    fanImpact: -2,
    dressingRoomImpact: -2,
    imageCategory: "training_ground",
    triggerCondition: "any_time",
    gameCategory: "training",
    isBreaking: false
  },
  {
    scenarioText: "A player is caught gambling on football (not his own games).",
    leftOptionText: "Suspend him and report to authorities.",
    rightOptionText: "Provide club counseling and support.",
    boardImpact: -10,
    fanImpact: 0,
    dressingRoomImpact: -5,
    imageCategory: "player_ego",
    triggerCondition: "any_time",
    gameCategory: "locker",
    isBreaking: false
  },
  {
    scenarioText: "The board wants to cash in on your academy star.",
    leftOptionText: "Sell to fund squad improvements.",
    rightOptionText: "Refuse and build the team around him.",
    boardImpact: 15,
    fanImpact: -12,
    dressingRoomImpact: 2,
    imageCategory: "board_pressure",
    triggerCondition: "transfer_window",
    gameCategory: "press",
    isBreaking: false
  },
  {
    scenarioText: "Training ground facilities need urgent modernization.",
    leftOptionText: "Demand immediate investment from the board.",
    rightOptionText: "Make do with current facilities.",
    boardImpact: -10,
    fanImpact: 5,
    dressingRoomImpact: 5,
    imageCategory: "board_pressure",
    triggerCondition: "any_time",
    gameCategory: "press",
    isBreaking: false
  },
  {
    scenarioText: "A player criticizes the club's transfer policy publicly.",
    leftOptionText: "Fine him for speaking out.",
    rightOptionText: "Acknowledge his concerns privately.",
    boardImpact: -8,
    fanImpact: 3,
    dressingRoomImpact: 8,
    imageCategory: "player_ego",
    triggerCondition: "transfer_window",
    gameCategory: "locker",
    isBreaking: false
  },
  {
    scenarioText: "The team psychologist recommends dropping a key player.",
    leftOptionText: "Follow the specialist's advice.",
    rightOptionText: "Trust your own player management.",
    boardImpact: -5,
    fanImpact: 0,
    dressingRoomImpact: 0,
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
    imageCategory: "finance",
    triggerCondition: "financial_crisis",
    gameCategory: "press",
    isBreaking: true
  },
  {
    scenarioText: "Injury Crisis: Multiple first-team players are down with a viral flu!",
    leftOptionText: "Play the youth team.",
    rightOptionText: "Risk the half-fit seniors.",
    boardImpact: 0,
    fanImpact: -5,
    dressingRoomImpact: -2,
    imageCategory: "injury",
    triggerCondition: "match_important",
    gameCategory: "training",
    isBreaking: true
  }
];
