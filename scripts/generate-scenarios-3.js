const fs = require('fs');

const existing = JSON.parse(fs.readFileSync('src/lib/scenarios.json', 'utf8'));
const existingTexts = new Set(existing.scenarios.map(s => s.scenario.toLowerCase()));
const startIdx = existing.scenarios.length;

const s = (scenario, leftOption, rightOption, impactLeft, impactRight, imageCategory, isBreaking, triggerCondition, gameCategory) => ({
  scenario, leftOption, rightOption, impactLeft, impactRight, imageCategory, isBreaking, triggerCondition, gameCategory
});
const imp = (board, fans, squad, aggression) => ({ board, fans, squad, aggression });

const batch3 = [
  // ─── MORE PLAYER EGO ─────────────────────────────────────────────────────────
  s("Your left back has started nutmegging teammates in training just for applause.","Channel the flair — it builds confidence.","Shut it down before it creates resentment.",imp(-2,5,3,-0.02),imp(3,-3,-3,0.02),"player_ego",false,"any_time","training"),
  s("A player you dropped scores a hat-trick for the reserve team. He gives a sarcastic interview.","Call him up immediately for first team.","Let him sweat it out — attitude matters.",imp(0,5,-5,-0.02),imp(5,0,5,0.03),"player_ego",true,"any_time","press"),
  s("Your striker demands his shirt number is retired when he leaves. He's still at the club.","Dismiss it as a future decision.","Shut it down — no one is bigger than the club.",imp(0,3,-5,0.0),imp(5,-3,3,0.03),"player_ego",false,"any_time","locker"),
  s("A fringe player turns up to training in a sports car worth more than your annual wage.","Ignore it — personal wealth is irrelevant.","Use it as a motivational tool for hungry players.",imp(0,3,-5,-0.02),imp(3,-2,3,0.02),"player_ego",false,"any_time","training"),
  s("Your winger flicks the ball up and volleys it on target in a league match. It misses. He grins.","Love the ambition — great for the crowd.","Tell him to focus on the basics.",imp(-2,8,-3,-0.02),imp(3,-3,3,0.02),"player_ego",false,"match_day","stadium"),
  s("A player releases a fashion collaboration mid-season that demands constant promotional events.","Allow limited appearances during off-days.","Demand all external work stops until the season ends.",imp(3,5,-3,-0.02),imp(-3,-3,3,0.03),"player_ego",false,"any_time","locker"),
  s("Your veteran striker cries during the national anthem and the cameras catch it.","Embrace the emotion — it fires the squad.","Speak to him about managing emotions pre-match.",imp(-2,10,5,0.0),imp(3,-3,-3,-0.02),"player_ego",false,"match_day","stadium"),
  s("A player posts a cryptic '🚪' emoji after being dropped. Fans go wild with speculation.","Ignore it completely.","Call him and ask him to delete it immediately.",imp(-3,5,-5,0.0),imp(3,-3,3,0.02),"social_media",true,"any_time","locker"),
  s("Your captain demands he reads the starting XI aloud to the team in the dressing room.","Allow it — he's earned the respect.","That's the manager's job — decline politely.",imp(-2,5,8,-0.03),imp(3,-2,-3,0.02),"player_ego",false,"match_day","locker"),
  s("A player scores then immediately calls his agent from the pitch on a hidden phone.","Fine him for the breach of protocol.","Laugh — he's a character and he scored.",imp(3,-3,-5,0.05),imp(-5,8,3,-0.03),"player_ego",true,"match_day","stadium"),

  // ─── TACTICAL IDENTITY ────────────────────────────────────────────────────────
  s("Analysts say your team has the worst chance conversion rate in the league despite dominating.","Bring in a specialist finishing coach.","Trust the process — the goals will come.",imp(3,0,3,-0.03),imp(-3,3,-3,0.03),"tactics",false,"performance_low","training"),
  s("Your team plays brilliant football but sits 12th. The board wants pragmatism over beauty.","Compromise your style for results.","Defend your identity — the league table will come.",imp(8,-5,-5,-0.03),imp(-8,5,5,0.05),"board_pressure",true,"performance_low","press"),
  s("Opposition scouts are filming your training session from outside the perimeter fence.","Call security and have them removed.","Ignore it — all teams do this.",imp(3,0,0,0.02),imp(-3,0,0,-0.02),"tactics",false,"any_time","training"),
  s("Your game plan relies on a player who has slept 4 hours due to a newborn at home.","Play him anyway — professionalism matters.","Give him a rest today regardless of the plan.",imp(-2,0,-3,0.03),imp(3,3,5,-0.03),"training_ground",false,"match_day","locker"),
  s("You want to play an extremely high defensive line but your slowest defender is your best.","Trust the plan — speed of thought over legs.","Drop the high line — protect your weakness.",imp(-2,3,-3,0.05),imp(3,-2,3,-0.03),"formation",false,"any_time","training"),
  s("A key player asks to understand the tactical reason behind every single decision you make.","Welcome the intellectual curiosity.","Remind him his job is to execute, not to question.",imp(-3,3,8,-0.03),imp(3,-2,-3,0.03),"tactics",false,"any_time","locker"),
  s("Your team has gone 8 games without a clean sheet. The defence blames the midfield.","Bring the team together for a defensive workshop.","Call out the defensive unit directly.",imp(3,0,-5,-0.03),imp(-3,0,5,0.03),"formation",false,"performance_low","training"),
  s("Your 4-2-3-1 is statistically your worst formation by xG allowed. Analytics recommend 4-3-3.","Make the switch based on data.","Trust your coaching instinct over the data.",imp(3,3,0,-0.03),imp(-3,-2,3,0.03),"formation",false,"any_time","training"),

  // ─── STADIUM / MATCH ATMOSPHERE ───────────────────────────────────────────────
  s("The stadium PA system blares the wrong walkout music — it's the opposition's anthem.","Laugh it off and build on the chaos.","Complain to stadium management immediately.",imp(-2,5,3,-0.02),imp(2,-3,-3,0.02),"fans",false,"match_day","stadium"),
  s("The home end is only 40% full for a crucial match due to a public transport strike.","Acknowledge the fans who made it.","Demand the club provide transport alternatives.",imp(-2,8,0,0.0),imp(3,-3,0,-0.02),"fans",false,"match_day","stadium"),
  s("A former player returns as opposition and is applauded by your own fans throughout.","Acknowledge their respect.","Remind your players the loyalty is to the badge.",imp(-3,5,-3,-0.02),imp(3,-3,3,0.02),"fans",false,"match_day","stadium"),
  s("The tannoy announces the wrong score from another game mid-match, causing confusion.","Refocus your team immediately.","Formally complain to the stadium operator.",imp(0,0,-3,0.0),imp(2,0,0,0.0),"tactics",false,"match_day","stadium"),
  s("Your stadium's changing rooms have no hot water before a freezing winter match.","Demand the opposition's facilities be shared.","Adapt — warriors don't need warm showers.",imp(2,0,-3,0.0),imp(-3,0,5,0.05),"training_ground",false,"match_day","stadium"),
  s("The stadium clock is wrong by 8 minutes. Players lose track of time in the second half.","Alert the fourth official and request correction.","Ignore it — players should have inner focus.",imp(2,0,0,0.0),imp(-2,0,-3,0.02),"tactics",false,"match_day","stadium"),
  s("Rival fans set off a flare that lands on the pitch during your attack.","Stop play and ensure player safety.","Play on — stopping breaks your momentum.",imp(3,-3,0,-0.02),imp(-3,5,-3,0.03),"tactics",true,"match_day","stadium"),
  s("The opposition manager shouts offensive comments at your players from the dug-out.","Report it to the fourth official immediately.","Tell your players to channel the anger into performance.",imp(3,-3,-3,-0.02),imp(-3,5,5,0.08),"fans",true,"match_day","stadium"),

  // ─── MATCH DAY DECISIONS ─────────────────────────────────────────────────────
  s("It's the 93rd minute, 0-0, and you have one sub left. Do you risk it for the win?","Bring on an extra striker — go for glory.","Hold shape — the draw keeps the run going.",imp(-3,8,-3,0.08),imp(5,-5,3,-0.05),"substitution",false,"match_day","stadium"),
  s("You're winning but your striker is deliberately slowing the game with ball-juggling.","Tell him to keep it but play quicker.","Sub him — it's disrespectful to the opponent.",imp(-3,5,-3,-0.03),imp(3,-3,3,0.03),"substitution",false,"time_wasting","stadium"),
  s("Your team is clearly superior but keeps giving the ball away with over-elaborate play.","Tell them to simplify immediately.","Trust the quality — they'll find their rhythm.",imp(2,-3,0,-0.03),imp(-3,5,-3,0.03),"tactics",false,"match_day","stadium"),
  s("You win a corner in the 89th minute while losing. Go short or send it into the box?","Go short — create space methodically.","Send it in and gamble on a header.",imp(-2,3,0,-0.02),imp(-2,5,-2,0.05),"tactics",false,"match_day","stadium"),
  s("Your goalkeeper wants to come up for every set piece in the last 10 minutes — you're losing.","Allow it — desperate times need desperate measures.","Keep him in goal — don't abandon the structure.",imp(-3,8,-3,0.08),imp(3,-5,3,-0.05),"tactics",true,"match_day","stadium"),
  s("Both of your centre-backs are carrying minor knocks. Do you sub one off at halftime?","Sub one off — protect for the run-in.","Play on — they can manage the second half.",imp(3,0,3,-0.03),imp(-3,5,-5,0.05),"substitution",false,"halftime","stadium"),
  s("An opposition player feigns injury to waste time and your player calls it out loudly.","Back your player vocally.","Tell your player to stay out of it.",imp(-3,5,-2,0.05),imp(3,-3,2,-0.03),"tactics",false,"time_wasting","stadium"),
  s("You win a penalty in extra time of a cup match. Your regular taker is exhausted.","Trust the tired regular taker.","Choose a fresh sub who's shown confidence.",imp(-2,3,-2,0.0),imp(3,-2,3,-0.02),"tactics",true,"cup_match","stadium"),

  // ─── TECHNOLOGY IN FOOTBALL ──────────────────────────────────────────────────
  s("Your club adopts an AI-powered team selection tool. It picks a lineup you disagree with.","Override the AI and pick your team.","Follow the recommendation and observe the outcome.",imp(-3,0,-3,0.0),imp(3,0,3,-0.02),"board_pressure",false,"any_time","training"),
  s("Players are using VR headsets to study opposition movements. Half are sick from motion.","Pull the programme — player comfort first.","Push through — elite performance requires discomfort.",imp(2,0,-3,-0.02),imp(-3,0,5,0.03),"training_ground",false,"any_time","training"),
  s("A drone filming your training is grounded by a player who throws a ball at it.","Discipline the player for destroying property.","Laugh it off — the player was protecting the session.",imp(3,0,-5,0.03),imp(-5,5,5,-0.02),"training_ground",false,"any_time","training"),
  s("Data shows a starting player's performance drops 30% in the second half every game.","Manage his fitness with 60-minute limits.","Trust his experience to manage his own levels.",imp(3,0,3,-0.03),imp(-3,0,-3,0.03),"training_ground",false,"any_time","training"),
  s("A sensor company wants to attach performance chips to your squad's training bibs.","Agree — elite clubs use this everywhere.","Refuse — players find it invasive.",imp(3,0,-3,0.0),imp(-3,0,5,-0.02),"training_ground",false,"any_time","training"),
  s("Live match analytics suggest a substitution your gut disagrees with. It's halftime.","Follow the data — it's probably right.","Trust your coaching instinct.",imp(3,3,-2,-0.02),imp(-3,-2,3,0.03),"tactics",false,"halftime","stadium"),

  // ─── REFEREE DECISIONS EXTENDED ──────────────────────────────────────────────
  s("Your team is denied three penalties in a match. The referee later retires.","Use it as fuel in the next game.","Issue a formal request for explanation from the FA.",imp(-3,5,-2,0.05),imp(3,-2,3,-0.02),"press",false,"any_time","press"),
  s("A referee who previously sent off your manager is appointed for your next match.","Prepare your team to stay disciplined.","Request a formal review of the appointment.",imp(3,0,0,-0.03),imp(-5,0,-3,0.05),"tactics",false,"match_day","press"),
  s("Your team scores from an indirect free kick that went direct. The referee counts it.","Say nothing — you'll take the goal.","Come clean to the referee immediately.",imp(-3,5,-2,0.03),imp(5,-5,3,-0.03),"tactics",true,"match_day","stadium"),
  s("The referee's assistant incorrectly flags your player offside from the kick-off.","Make a formal protest at half time.","Accept it and move on — it's one call.",imp(-2,3,-2,0.03),imp(2,-2,2,-0.02),"tactics",false,"match_day","stadium"),
  s("A referee issues you a touchline ban mid-season for accumulated dissent.","Accept it and coordinate from the stands.","Appeal the ban immediately.",imp(3,-3,-3,-0.03),imp(-3,3,0,0.03),"press",true,"any_time","press"),

  // ─── YOUTH ACADEMY EXTENDED ──────────────────────────────────────────────────
  s("An 18-year-old trains better than your £20m signing but lacks experience.","Start the youngster — form beats price tags.","Use him as an impact sub while protecting him.",imp(-3,10,8,-0.03),imp(3,-3,-3,0.02),"training_ground",false,"any_time","training"),
  s("Your academy director resigns publicly citing lack of first-team pathways.","Issue a rebuttal with evidence of youth graduates.","Meet him and understand the root cause.",imp(-5,-5,-3,0.03),imp(3,3,5,-0.02),"board_pressure",true,"any_time","press"),
  s("Three academy players reject contract offers and leave for rivals.","Review the academy's offering with the board.","Accept it — top talent will always have options.",imp(-5,0,-3,0.0),imp(3,0,0,0.0),"board_pressure",true,"any_time","press"),
  s("A 16-year-old prodigy is offered terms but insists on a release clause at a fraction of his value.","Reject the clause — it's too risky.","Sign him — the talent outweighs the risk.",imp(-3,0,3,0.0),imp(3,5,0,-0.02),"board_pressure",false,"transfer_window","press"),
  s("Your youth team wins a prestigious tournament. The first team players seem threatened.","Celebrate the youth team loudly and publicly.","Keep the celebration internal — manage senior egos.",imp(-2,10,3,-0.02),imp(3,-3,-5,0.03),"training_ground",false,"any_time","locker"),

  // ─── SEASON DEFINING MOMENTS ──────────────────────────────────────────────────
  s("You need a win from the last game to avoid relegation. Your best player is suspended.","Rebuild the team around what you have.","Play an emergency youth player in his role.",imp(0,5,5,0.03),imp(-2,8,3,-0.02),"formation",true,"match_important","stadium"),
  s("You're one point off the top with two games left. Players want to know the bonus structure.","Reveal it — motivation through transparency.","Focus on the football — money follows results.",imp(3,5,5,-0.02),imp(-3,-2,3,0.02),"board_pressure",false,"performance_high","locker"),
  s("A draw in the final game secures a historic Champions League spot. Fans want a title challenge.","Celebrate what's been achieved.","Publicly commit to going for the title next season.",imp(5,12,5,-0.02),imp(-3,15,0,0.0),"fans",true,"match_important","press"),
  s("You've mathematically avoided relegation with four games left. Do you rotate?","Rotate heavily — give fringe players a run.","Keep the best team playing — momentum matters.",imp(-3,5,8,-0.05),imp(3,-3,-3,0.05),"formation",false,"any_time","stadium"),
  s("A goal celebration sees five players slide on their knees in the mud on a freezing pitch.","Love the passion and unity.","Quickly check them for injuries before it happens again.",imp(-3,12,8,-0.03),imp(3,-3,-3,0.02),"player_ego",false,"match_day","stadium"),
  s("You're about to clinch the title but need your rivals to drop points. Players are watching their phones.","Encourage the watch party — it's fine.","Ban phones — focus on your own performance.",imp(-3,5,-5,-0.02),imp(3,-3,5,0.02),"tactics",true,"performance_high","locker"),

  // ─── COACHING STAFF DYNAMICS ─────────────────────────────────────────────────
  s("Your assistant is overheard telling players you're 'difficult to work with'.","Confront him directly and offer a resolution.","Report it to the board and begin severance talks.",imp(-5,0,-5,0.03),imp(-8,0,-8,0.08),"training_ground",true,"any_time","training"),
  s("Your goalkeeping coach has developed a close friendship with the first-choice keeper. Others feel left out.","Address the perceived favouritism.","Let it go — a strong relationship is beneficial.",imp(2,0,-5,-0.02),imp(-2,0,3,0.02),"training_ground",false,"any_time","training"),
  s("A member of your coaching staff wants to trial unconventional meditation before matches.","Allow it as optional for interested players.","Keep pre-match routines standard.",imp(-2,3,5,-0.03),imp(2,-2,-3,0.02),"training_ground",false,"any_time","training"),
  s("Your set piece coach developed your most successful routine. A rival club is trying to poach him.","Fight to keep him with a contract upgrade.","Let him go — the methods are already embedded.",imp(3,0,3,-0.02),imp(-5,0,-3,0.02),"board_pressure",false,"any_time","press"),
  s("A new analyst you hired is generating brilliant data but clashes with the senior coaching staff.","Back the analyst and demand integration.","Let the senior staff manage him out.",imp(3,0,-3,-0.02),imp(-3,0,3,0.02),"training_ground",true,"any_time","training"),
  s("Your fitness coach leaves at the end of the season. The team's fitness is currently excellent.","Promote internally.","Go external — fresh ideas needed.",imp(-2,0,3,-0.02),imp(2,0,-3,0.02),"board_pressure",false,"any_time","training"),

  // ─── WEATHER & ENVIRONMENT ───────────────────────────────────────────────────
  s("A heat wave forces training to be moved to 6am. Senior players refuse the new schedule.","Enforce it — conditions leave no choice.","Find a compromise time that works for all.",imp(3,0,-5,0.03),imp(-3,0,5,-0.02),"training_ground",false,"any_time","training"),
  s("A violent thunderstorm stops play with your team winning 3-0. The match may be abandoned.","Lobby hard for the result to stand.","Accept the decision — football follows safety rules.",imp(-3,5,-2,0.03),imp(3,-3,2,-0.02),"tactics",true,"match_day","stadium"),
  s("Heavy rain makes the ball stick in puddles. Your passing game is useless.","Switch to direct long balls immediately.","Trust the technique — quality players adapt.",imp(0,0,-3,0.05),imp(3,3,3,-0.03),"tactics",false,"match_day","stadium"),
  s("Extreme cold causes the electronic substitution board to malfunction.","Use hand signals and verbal communication.","Delay the sub until the board is fixed.",imp(-2,0,0,0.0),imp(0,0,-2,0.02),"tactics",false,"match_day","stadium"),
  s("Gale force winds completely negate your aerial game plan for a cup match.","Rethink the approach at halftime.","Persist — your players are technically better.",imp(-2,3,-2,0.0),imp(3,-2,3,-0.02),"tactics",false,"cup_match","stadium"),

  // ─── MEDIA EXTENDED ──────────────────────────────────────────────────────────
  s("A documentary crew follows you for a week but captures a heated training session.","Block the footage from airing.","Approve it — authenticity builds connection.",imp(3,-3,-5,0.03),imp(-5,8,3,-0.03),"press",false,"any_time","press"),
  s("A national newspaper runs a poll and 68% of readers want you sacked.","Address it head on in your next conference.","Ignore polls — only results matter.",imp(-5,-8,-3,0.03),imp(3,3,0,-0.02),"press",true,"performance_low","press"),
  s("You are the subject of a satirical sketch on prime time TV.","Engage with it on social media humorously.","Issue a formal complaint to the broadcaster.",imp(-3,10,3,-0.02),imp(5,-5,-2,0.03),"press",false,"any_time","press"),
  s("A radio presenter suggests your contract should have a minimum points clause.","Dismiss the idea publicly.","Privately consider whether it aligns with your goals.",imp(-3,-3,-2,0.03),imp(3,0,0,-0.02),"press",false,"any_time","press"),
  s("Two journalists arrive at your press conference clearly hungover.","Let it go — they still have a job to do.","Ask the club's media team to address standards.",imp(0,3,0,-0.02),imp(2,-2,0,0.02),"press",false,"any_time","press"),

  // ─── CONTRACT / FINANCE ───────────────────────────────────────────────────────
  s("A player's contract has a clause that doubles his wages if he starts 20 games. He's on 19.","Start him in the next match — he deserves it.","Bench him — protect the wage bill.",imp(3,3,5,-0.02),imp(-3,-3,-5,0.03),"board_pressure",true,"any_time","locker"),
  s("The club can't afford a striker and the board suggests converting a midfielder.","Agree and trial the experiment.","Reject — buy a striker or go with youth.",imp(-3,3,-3,0.0),imp(3,-3,3,0.02),"board_pressure",false,"transfer_window","training"),
  s("A player wants loyalty bonus written into his contract. The board refuses.","Fight for the player's request.","Accept the board's position.",imp(-5,3,3,0.02),imp(5,-3,-3,-0.02),"board_pressure",false,"any_time","press"),
  s("Your wage budget is cut but a free agent superstar approaches you directly.","Stretch the budget and make it work.","Stick to the budget — discipline builds culture.",imp(-3,10,3,0.03),imp(5,-5,-3,-0.02),"board_pressure",true,"transfer_window","press"),
  s("A player's goal bonus has gone unpaid for three months due to an admin error.","Ensure it's paid today with an apology.","Leave it to the finance department to resolve.",imp(-5,3,5,-0.02),imp(3,-2,0,0.02),"board_pressure",false,"any_time","locker"),

  // ─── UNIQUE / CHARACTER MOMENTS ──────────────────────────────────────────────
  s("A player proposes to his partner on the pitch at full time after a win. Cameras everywhere.","Celebrate with the couple.","Ask him to keep personal celebrations for after.","",imp(-2,12,5,-0.02),imp(3,-3,-3,0.02),"player_ego",false,"match_day","stadium"),
  s("You find an anonymous note in your dug-out mid-match. It reads: 'Switch to 4-3-3 now'.","Ignore it and carry on.","Look into who left it after the match.",imp(0,3,0,-0.02),imp(2,-2,0,0.0),"tactics",false,"match_day","stadium"),
  s("A player earns more in one week than your entire youth coaching staff earn in a year.","Raise it with the board as a values issue.","Accept it — that's the modern game.",imp(-3,0,0,0.0),imp(3,0,-3,0.0),"board_pressure",false,"any_time","locker"),
  s("Your opposite number refuses to shake your hand at kickoff, citing 'poor sportsmanship'.","Laugh it off publicly post-match.","Confront him on the touchline professionally.",imp(0,5,-2,0.02),imp(-3,3,3,-0.02),"press",false,"match_day","stadium"),
  s("A streaker sprints through your technical area during a five-minute VAR check.","Use the moment to lighten the atmosphere.","Request tighter security from the stadium team.",imp(-2,10,5,-0.02),imp(2,-3,-3,0.02),"fans",false,"match_day","stadium"),
  s("Your tactical briefing slides accidentally go to the wrong club via email.","Contact the recipients immediately and request deletion.","Change the game plan completely as a precaution.",imp(-3,-3,-5,0.03),imp(3,0,-3,0.05),"tactics",true,"match_day","press"),
  s("You score a wonder goal in a charity match and the crowd goes wild. Players are in awe.","Keep it humble — it's just for charity.","Milk every second — morale boost for the squad.",imp(-2,8,8,-0.03),imp(3,3,-3,0.02),"press",false,"any_time","press"),
  s("A rival manager buys your autobiography and reads it before you meet them.","Take it as a compliment.","Make sure the next edition has wrong tactics in it.",imp(0,5,0,-0.02),imp(-3,8,3,0.0),"press",false,"any_time","press"),
  s("A club legend tweets criticism at your starting XI twenty minutes before kickoff.","Respond calmly and with respect.","Show your team the tweet as extra motivation.",imp(-2,0,3,0.03),imp(3,5,8,-0.03),"social_media",true,"match_day","locker"),
  s("Your players are late to a charity gala due to traffic and arrive mid-speech.","Apologize humbly on arrival.","Blame the travel team and make it official.",imp(-3,3,0,-0.02),imp(3,-3,-3,0.02),"fans",false,"any_time","press"),
];

const cleaned = batch3.filter(sc =>
  sc.scenario && !existingTexts.has(sc.scenario.toLowerCase())
);

const indexed = cleaned.map((sc, i) => ({
  ...sc,
  scenarioId: `local_${startIdx + i}`
}));

const updated = { scenarios: [...existing.scenarios, ...indexed] };
fs.writeFileSync('src/lib/scenarios.json', JSON.stringify(updated, null, 2));
console.log(`Added: ${indexed.length} new scenarios`);
console.log(`Total: ${updated.scenarios.length} scenarios`);
