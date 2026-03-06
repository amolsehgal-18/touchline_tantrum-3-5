const fs = require('fs');

const existing = JSON.parse(fs.readFileSync('src/lib/scenarios.json', 'utf8'));
const existingTexts = new Set(existing.scenarios.map(s => s.scenario.toLowerCase()));
const startIdx = existing.scenarios.length;

// helper
const s = (scenario, leftOption, rightOption, impactLeft, impactRight, imageCategory, isBreaking, triggerCondition, gameCategory) => ({
  scenario, leftOption, rightOption, impactLeft, impactRight, imageCategory, isBreaking, triggerCondition, gameCategory
});
const imp = (board, fans, squad, aggression) => ({ board, fans, squad, aggression });

const newScenarios = [

  // ─── PLAYER EGO ──────────────────────────────────────────────────────────────
  s("Your striker has gone 8 games without a goal and blames the service from midfield.","Back the striker publicly.","Demand more from your midfield in training.",imp(-3,5,-8,0.03),imp(3,-5,8,-0.03),"player_ego",false,"performance_low","locker"),
  s("A senior player arrives to training wearing a rival club's training kit as a 'joke'.","Laugh it off and move on.","Send him home to change and fine him.",imp(2,5,-5,0.02),imp(-5,-3,5,0.05),"player_ego",false,"any_time","locker"),
  s("Your captain demands he be allowed to take all set pieces despite poor delivery stats.","Let him have his way.","Assign set pieces based on training data.",imp(-3,0,8,-0.02),imp(3,0,-5,0.02),"player_ego",false,"match_day","stadium"),
  s("A player refuses to shake hands with an opponent after a contentious tackle.","Defend his passion.","Publicly apologize on the club's behalf.",imp(-8,8,-5,0.08),imp(8,-5,5,-0.05),"player_ego",true,"match_day","stadium"),
  s("Your record signing has played 90 minutes in every game and demands a rest.","Rotate him for the next match.","Tell him he's too important to rest.",imp(5,-3,8,-0.05),imp(-8,3,-5,0.05),"player_ego",false,"any_time","locker"),
  s("Two players competing for the same position refuse to room together on away trips.","Assign them separate rooms.","Force them to room together to resolve it.",imp(-2,0,-5,0.0),imp(2,0,5,0.02),"player_ego",false,"away_game","locker"),
  s("A winger demands to play centrally or he'll request a transfer.","Try him in the new role.","Refuse and remind him of his contract.",imp(-5,2,5,-0.03),imp(10,-8,-5,0.05),"player_ego",true,"any_time","locker"),
  s("Your veteran keeper is furious about not being considered for the captaincy.","Give him the armband.","Explain your selection criteria calmly.",imp(5,-2,8,-0.03),imp(-3,2,-5,0.03),"player_ego",false,"any_time","locker"),
  s("A player goes to the media claiming your training sessions are 'unprofessional'.","Call it lies and defend your staff.","Invite journalists to observe a session.",imp(-8,-5,0,0.05),imp(5,8,5,-0.03),"player_ego",true,"any_time","press"),
  s("Your striker celebrates a goal by pointing at the bench and mouthing 'that's for you'.","Praise his hunger and desire.","Have a private conversation about professionalism.",imp(0,10,5,0.05),imp(0,5,-2,-0.02),"player_ego",false,"match_day","stadium"),
  s("A player demands the right to approve his own transfer rumours in the press.","Grant him editorial input.","Shut down the request immediately.",imp(-5,0,-3,0.0),imp(5,0,3,0.0),"player_ego",false,"transfer_window","press"),
  s("Your backup striker gives an interview saying he deserves to start every game.","Drop him from the squad.","Use it as motivation in the next selection talk.",imp(-3,5,-5,0.03),imp(5,-3,5,-0.02),"player_ego",true,"any_time","press"),
  s("A player's wife publicly criticizes the club on a podcast.","Ignore it as a private matter.","Ask the player to address it with her.",imp(0,-5,-5,0.0),imp(-3,3,3,0.02),"player_ego",true,"any_time","press"),
  s("Your youth sensation demands adult wages after one breakthrough season.","Meet his demands to keep him.","Stick to the youth wage structure.",imp(5,8,-5,-0.03),imp(-8,0,8,0.02),"player_ego",false,"any_time","locker"),
  s("A player posts a countdown timer on Instagram without explaining what it's counting to.","Ask him to take it down.","Embrace the mystery and let the hype build.",imp(0,10,-3,-0.02),imp(0,15,3,0.0),"social_media",false,"any_time","locker"),
  s("Your top scorer requests a custom squad number mid-season for 'personal reasons'.","Allow the change as a goodwill gesture.","Decline — squad numbers are set at season start.",imp(3,5,5,-0.02),imp(-5,-2,-3,0.02),"player_ego",false,"any_time","locker"),
  s("A player who was dropped leaks that the team is 'divided' to a tabloid.","Hold an emergency squad meeting.","Confront the player one-on-one and transfer list him.",imp(-5,-8,-10,0.05),imp(-10,-5,5,0.08),"player_ego",true,"any_time","press"),
  s("Your fullback has been caught arguing with fans outside the stadium after a loss.","Fine him and apologize to fans.","Defend him — fans had no right to approach him.",imp(5,-8,0,0.03),imp(-10,5,-3,0.05),"player_ego",true,"any_time","locker"),
  s("A player's agent demands he plays every cup game to boost his sell-on value.","Manage his minutes professionally.","Refuse agent involvement in team selection.",imp(-8,0,3,0.0),imp(8,0,-5,0.03),"player_ego",false,"cup_match","press"),
  s("Two players got into a heated argument over a card game on the team bus.","Separate them immediately.","Let the squad resolve it among themselves.",imp(3,0,-8,0.03),imp(-3,0,5,-0.02),"player_ego",false,"any_time","locker"),

  // ─── BOARD PRESSURE ───────────────────────────────────────────────────────────
  s("The chairman announces a stadium name change sponsorship deal without consulting you.","Publicly support the deal.","Express disapproval in the next board meeting.",imp(8,-12,0,-0.03),imp(-8,5,0,0.02),"board_pressure",true,"any_time","press"),
  s("The board wants to release three senior players to reduce the wage bill mid-season.","Accept the cuts to keep the board happy.","Fight to keep your key players.",imp(10,-5,-15,0.0),imp(-12,5,10,0.03),"board_pressure",true,"any_time","press"),
  s("Your chairman is openly attending rival managers' press conferences as 'research'.","Laugh it off publicly.","Request a formal meeting to discuss your position.",imp(0,-3,-5,0.0),imp(-5,0,5,0.0),"board_pressure",false,"any_time","press"),
  s("The board demands you sell your best midfielder to a direct promotion rival.","Refuse — the timing is wrong.","Accept the fee and find a replacement.",imp(-15,0,-8,0.05),imp(15,-8,0,-0.02),"board_pressure",true,"transfer_window","press"),
  s("Ownership wants to build luxury boxes over the away fans section.","Support the revenue generation.","Oppose it to protect supporter culture.",imp(10,-15,0,-0.03),imp(-8,12,3,0.02),"board_pressure",false,"any_time","press"),
  s("The board announces a surprise pre-season tour to Asia with only 3 days notice.","Adapt your plans and go.","Push back and request proper preparation time.",imp(8,-3,-5,-0.03),imp(-10,3,5,0.03),"board_pressure",false,"any_time","press"),
  s("Your chairman makes a handshake deal with a player's agent without telling you.","Accept the decision.","Remind the board that recruitment is your domain.",imp(5,0,-3,0.0),imp(-8,0,5,0.03),"board_pressure",true,"transfer_window","press"),
  s("The board votes to introduce VAR-style reviews for substitution decisions.","Welcome the additional accountability.","Reject it as undermining managerial authority.",imp(5,-2,-5,-0.03),imp(-8,2,5,0.05),"board_pressure",false,"any_time","press"),
  s("A board member is spotted having dinner with a top agent linked to your replacement.","Confront the board directly.","Say nothing and let your results speak.",imp(-10,0,0,0.05),imp(3,0,0,-0.03),"board_pressure",true,"any_time","press"),
  s("The club agrees a naming rights deal — the training ground will be called 'CryptoBase'.","Embrace the funding.","Express concern about brand alignment.",imp(10,-5,-3,-0.02),imp(-5,3,0,0.02),"board_pressure",false,"any_time","press"),
  s("The chairman publicly disagrees with your formation choice after a defeat.","Apologies and adjust.","Stand firm and defend your tactical approach.",imp(8,-3,-5,-0.03),imp(-10,3,5,0.05),"board_pressure",true,"performance_low","press"),
  s("The board wants to install cameras in the dressing room for a documentary series.","Agree — great for the club's profile.","Reject it — the dressing room must remain private.",imp(8,-3,-8,-0.03),imp(-8,5,10,0.03),"board_pressure",false,"any_time","locker"),
  s("Ownership expects you to hold a weekly video call with investors.","Agree to the meetings.","Delegate it to the club's PR director.",imp(8,-2,-3,-0.02),imp(-5,0,0,0.02),"board_pressure",false,"any_time","press"),
  s("The board wants to use your image in gambling advertisements.","Agree for the sponsorship income.","Refuse on personal principle.",imp(12,-5,0,-0.03),imp(-8,5,3,0.03),"board_pressure",false,"any_time","press"),
  s("The club's new investor demands you play a 3-5-2 to suit the players he wants to buy.","Consider the tactical switch.","Ignore the request — tactics are your domain.",imp(8,-3,-5,-0.03),imp(-10,3,5,0.05),"board_pressure",true,"any_time","press"),

  // ─── TRANSFER WINDOW ──────────────────────────────────────────────────────────
  s("A rival club submits a last-minute bid for your academy gem on deadline day.","Accept — the fee is too good.","Reject all bids regardless of fee.",imp(12,-10,-8,0.0),imp(-10,8,10,0.03),"board_pressure",true,"transfer_window","press"),
  s("Your new signing refuses to wear the squad number assigned to him.","Let him pick his preferred number.","Tell him to accept or return to his former club.",imp(-3,3,2,0.0),imp(5,-3,-3,0.03),"player_ego",false,"transfer_window","locker"),
  s("A player you sold last season wants to return at double his old wages.","Bring him back at the inflated fee.","Look elsewhere — the wages don't fit your structure.",imp(-5,8,5,-0.03),imp(3,-5,-3,0.02),"board_pressure",false,"transfer_window","press"),
  s("Your transfer target fails a medical with a previously undisclosed injury.","Pull out of the deal entirely.","Complete the deal at a reduced fee.",imp(-5,0,-2,0.0),imp(3,0,2,0.02),"board_pressure",false,"transfer_window","press"),
  s("An agent approaches you directly with a player your scouts haven't vetted.","Trust the agent's recommendation.","Follow your scouting process before deciding.",imp(-3,0,-2,0.02),imp(3,0,2,-0.02),"board_pressure",false,"transfer_window","press"),
  s("A free agent superstar contacts you directly wanting to sign, but his wages are extreme.","Sign him for the PR and quality boost.","Politely decline — wages would destabilize the squad.",imp(-5,15,5,0.05),imp(5,-8,5,-0.02),"board_pressure",true,"transfer_window","press"),
  s("Two of your players are caught negotiating a joint move to another club together.","Transfer list both immediately.","Sit them down individually and resolve it.",imp(-8,-5,-10,0.05),imp(-3,0,5,0.03),"player_ego",true,"transfer_window","locker"),
  s("A player on loan from a rival club is outperforming your own squad members. The recall clause is triggered.","Accept the recall and find cover.","Try to negotiate an extension to the loan.",imp(-2,0,-3,0.0),imp(3,0,3,0.02),"board_pressure",false,"transfer_window","press"),
  s("The club receives a bid from a relegated club for your key player — he wants to go.","Let him leave — he's made his bed.","Reject and convince him to stay.",imp(5,-5,-12,0.03),imp(-8,5,8,0.02),"player_ego",true,"transfer_window","locker"),
  s("Your transfer budget is cut by 40% two days before the window closes.","Make do with free agents and loans.","Demand an emergency board meeting.",imp(-10,0,-3,0.0),imp(-5,0,3,0.03),"board_pressure",true,"transfer_window","press"),

  // ─── TRAINING GROUND ──────────────────────────────────────────────────────────
  s("A group of players hires a private chef to override the club's nutrition plan.","Let them — results are what matter.","Reinforce the club's nutrition policy firmly.",imp(-2,0,5,-0.02),imp(5,0,-3,0.03),"training_ground",false,"any_time","training"),
  s("Your first-choice striker pulls a hamstring in training the day before a cup final.","Recall a loan player as emergency cover.","Promote the youth striker and back him.",imp(0,0,-5,0.0),imp(-3,10,5,0.05),"training_ground",true,"cup_match","training"),
  s("Players are secretly timing the manager's tactical talks and betting on length.","Shorten your talks to keep focus.","Confront the culture of disrespect.",imp(-2,5,-5,0.0),imp(3,-5,5,0.03),"training_ground",false,"any_time","training"),
  s("Your sports scientist recommends players train at 5am to optimize recovery windows.","Trial the early sessions for a month.","Reject it — morale is more important than marginal gains.",imp(3,0,-8,0.03),imp(-3,0,8,-0.03),"training_ground",false,"any_time","training"),
  s("A player is caught using a banned supplement not on the registered list.","Report it immediately to the authorities.","Handle it quietly — investigate internally first.",imp(8,-5,-5,0.0),imp(-10,3,5,0.0),"training_ground",true,"any_time","training"),
  s("The club's training pitch is flooded and unplayable for a week.","Use the local university pitch.","Cancel training and give players gym time.",imp(0,0,3,-0.03),imp(0,0,-3,-0.05),"training_ground",false,"any_time","training"),
  s("A player's personal trainer contradicts your fitness coach's methods daily.","Ban personal trainers from the facility.","Find a compromise with both coaches.",imp(3,0,-3,0.0),imp(-2,0,3,-0.02),"training_ground",false,"any_time","training"),
  s("Two coaches disagree publicly during a drill session in front of the whole squad.","Take control and stop the session.","Let them resolve it — healthy debate is fine.",imp(3,0,-8,0.03),imp(-5,0,3,-0.02),"training_ground",true,"any_time","training"),
  s("Players are consistently arriving two minutes late to meetings. No one has said anything.","Set a new strict punctuality policy.","Address it humourously to reset the culture.",imp(3,0,2,0.0),imp(0,5,5,-0.02),"training_ground",false,"any_time","training"),
  s("Your assistant suggests reducing ball-work and focusing purely on fitness for two weeks.","Follow the recommendation.","Reject it — players need match sharpness.",imp(3,0,-5,0.03),imp(-3,0,5,-0.03),"training_ground",false,"performance_low","training"),
  s("A player uses a training session to audition for an AI sports data company filming nearby.","Allow it as harmless fun.","Stop the filming and focus on training.",imp(0,5,-3,-0.02),imp(3,-3,3,0.02),"social_media",false,"any_time","training"),
  s("Three players request mental health days on the same week before a big match.","Grant the days without question.","Speak to each player individually first.",imp(3,5,8,-0.05),imp(2,3,5,-0.03),"training_ground",false,"match_important","training"),
  s("Your goalkeeper coach and fitness coach are feuding and refusing to work together.","Mediate a formal resolution.","Replace one of them immediately.",imp(3,0,5,-0.03),imp(-8,0,-5,0.05),"training_ground",true,"any_time","training"),
  s("Players who aren't selected keep leaving training early. No one has enforced it.","Introduce mandatory presence for all players.","Allow it — unused players need rest too.",imp(3,0,5,0.02),imp(-3,0,-3,-0.02),"training_ground",false,"any_time","training"),
  s("Your striker keeps faking contact in training drills to practice diving.","Ban the behaviour immediately.","Use it as a simulation tool for match situations.",imp(5,0,-8,0.03),imp(-3,0,3,-0.02),"training_ground",false,"any_time","training"),

  // ─── MATCH DAY / TACTICS / FORMATION ─────────────────────────────────────────
  s("You're 3-0 up at halftime. Players look relaxed and start showboating.","Warn them and keep the shape.","Encourage them — enjoy the moment.",imp(3,-3,5,0.03),imp(-5,8,-8,-0.05),"formation",false,"match_winning","stadium"),
  s("The opposition keeps fouling your playmaker and the referee won't act.","Instruct him to go wider and avoid contact.","Tell him to stand his ground.",imp(0,0,3,-0.05),imp(-3,5,-3,0.08),"tactics",false,"referee_bias","stadium"),
  s("You're 1-0 down with 20 minutes left against a team parked with 10 defenders.","Bring on an extra striker.","Be patient — the goal will come.",imp(-3,5,-2,0.08),imp(3,-3,2,-0.03),"formation",false,"match_losing","stadium"),
  s("Your left winger is terrorizing the opposition. The right winger looks jealous and stops tracking back.","Substitute the right winger for a disciplined player.","Have a word with him at the next break in play.",imp(2,3,-5,0.03),imp(-2,0,3,-0.02),"substitution",false,"match_day","stadium"),
  s("The opposition goalkeeper is wasting time from the first minute.","Instruct players to pressure him constantly.","Stay composed and trust the referee.",imp(-2,5,2,0.05),imp(3,-3,3,-0.03),"tactics",false,"time_wasting","stadium"),
  s("Your striker scores then immediately limps. Do you substitute him on a hat-trick?","Replace him immediately — player welfare first.","Give him five minutes to see how it goes.",imp(5,-5,8,-0.05),imp(-3,8,-5,0.05),"substitution",true,"player_injury","stadium"),
  s("An opposition player is clearly feigning injury every time you attack.","Tell your players to keep the ball moving and ignore it.","Lodge a formal protest with the referee.",imp(2,3,2,0.03),imp(-3,0,-2,0.0),"tactics",false,"referee_bias","stadium"),
  s("You're winning 1-0 in a must-win game. Your captain demands you push forward for a second.","Trust your captain's instinct.","Hold the shape and protect the lead.",imp(-2,5,-3,0.05),imp(3,-3,3,-0.03),"formation",false,"match_important","stadium"),
  s("Your midfielder has just received his 5th yellow card and will be suspended for the next game.","Substitute him now to preserve energy.","Keep him on — you need him today.",imp(3,0,3,-0.03),imp(-3,5,-3,0.05),"substitution",false,"match_day","stadium"),
  s("The pitch markings are faded and causing confusion among your defenders.","Halt play and request the groundskeeper repaints lines.","Adapt and communicate more vocally.",imp(0,0,-3,0.0),imp(2,0,3,0.02),"tactics",false,"pitch_quality","stadium"),
  s("A laser is being pointed at your goalkeeper from the stands.","Request the match be temporarily suspended.","Tell your keeper to switch sides with the backup.",imp(5,-5,3,0.0),imp(-3,0,-3,0.0),"tactics",true,"any_time","stadium"),
  s("Your striker is disputing every offside call and disrupting your team's rhythm.","Calm him down at the next break.","Let him channel the frustration into intensity.",imp(2,3,-3,-0.02),imp(-3,5,-5,0.05),"tactics",false,"referee_bias","stadium"),
  s("You've used all 3 subs and a key player goes down with cramp in the 75th minute.","Move to 10 men and reorganize.","Push him to play through for the last 15 minutes.",imp(0,0,-5,-0.05),imp(-3,5,-8,0.08),"tactics",true,"player_injury","stadium"),
  s("Your team scores an outrageous long-range goal but VAR checks it for a foul in the build-up.","Remain calm on the touchline.","Furiously protest the length of the check.",imp(3,3,3,-0.03),imp(-8,10,-3,0.1),"tactics",false,"match_day","stadium"),
  s("You're playing against a high press team. Your keeper is struggling with the ball at his feet.","Tell him to go long and bypass the press.","Keep playing out — trust the process.",imp(0,0,-3,0.03),imp(3,3,3,-0.02),"formation",false,"match_day","stadium"),
  s("Halftime. You're drawing 0-0. The crowd is booing and your players look nervous.","Change formation and be more adventurous.","Back the team — tell them they're doing fine.",imp(-2,5,-2,0.05),imp(3,-5,5,-0.03),"tactics",false,"halftime","stadium"),
  s("Your striker scores but removes his shirt before reaching the stands. Second yellow card.","Accept it — passion comes with the territory.","Publicly criticize the moment of madness.",imp(-5,12,-5,0.05),imp(3,-5,0,-0.03),"player_ego",true,"match_day","stadium"),
  s("The floodlights go out with 10 minutes to play and you're losing 1-0.","Argue to abandon the match.","Accept the delay and prepare for the restart.",imp(-3,0,-2,0.03),imp(2,0,2,-0.02),"tactics",true,"any_time","stadium"),
  s("Your defensive midfielder is performing brilliantly but was booked for diving. He's furious.","Tell him to focus and forget it.","Back him completely and blame the referee.",imp(3,3,-3,-0.03),imp(-5,5,3,0.05),"tactics",false,"referee_bias","stadium"),
  s("Your team wins a controversial penalty in the 90th minute. Fans of both sides are in uproar.","Back the decision and keep composure.","Admit it may have been soft but back your player.",imp(3,5,-2,-0.03),imp(0,3,2,-0.02),"tactics",true,"match_important","stadium"),
  s("You're away from home and the travel schedule left players exhausted. The team looks flat at kickoff.","Make an early tactical change to spark energy.","Stick with the plan and trust fitness levels.",imp(-3,3,-3,0.05),imp(2,-3,3,-0.02),"formation",false,"away_game","stadium"),
  s("An early red card leaves you with 10 men. The crowd is panicking.","Park the bus and play for a draw.","Keep playing your game — don't let fear dictate.",imp(3,-5,3,-0.05),imp(-5,5,-3,0.08),"formation",true,"match_important","stadium"),
  s("Your striker refuses to press from the front when defending. The team is losing shape.","Replace him at halftime.","Accept his limitations and adjust the system.",imp(2,0,-5,0.03),imp(-2,0,5,-0.03),"substitution",false,"halftime","stadium"),
  s("The opposition manager is screaming instructions directly at your players.","File a formal complaint with the fourth official.","Ignore it and let your players stay focused.",imp(-3,0,3,-0.02),imp(3,0,-2,0.02),"tactics",false,"match_day","stadium"),
  s("Your team has just scored an 89th minute equalizer. Players sprint to celebrate in the away end.","Let them have the moment.","Refocus them — there's still a minute left.",imp(-3,15,-2,0.05),imp(5,-5,5,-0.03),"tactics",false,"match_day","stadium"),

  // ─── SOCIAL MEDIA / VIRAL ─────────────────────────────────────────────────────
  s("A deep fake video of you making controversial tactical promises goes viral.","Issue a legal takedown immediately.","Make a humorous video clarifying the truth.",imp(-8,5,-3,0.0),imp(3,12,0,-0.02),"social_media",true,"any_time","press"),
  s("Your star player goes live on Instagram during a team meeting without realizing.","Stop the meeting immediately.","Keep going — it's authentic content.",imp(3,-5,-8,0.03),imp(-5,10,3,-0.05),"social_media",true,"any_time","locker"),
  s("A fan creates a song about your touchline antics that hits 10 million views.","Engage with it — react on social media.","Avoid acknowledging it — stay professional.",imp(-3,15,0,-0.03),imp(3,-5,0,0.02),"social_media",false,"any_time","press"),
  s("Your assistant's pre-match whiteboard photo leaks your tactical plans before kickoff.","Scramble to change the game plan.","Accept it and trust your players to adapt.",imp(-5,-3,-5,0.05),imp(3,0,3,-0.02),"social_media",true,"match_day","press"),
  s("A player films teammates getting a tactical rollicking and posts it as a 'motivational' clip.","Praise him for sharing the culture.","Fine him — dressing room is private.",imp(-5,10,-5,-0.03),imp(8,-5,5,0.03),"social_media",true,"any_time","locker"),
  s("Your club's TikTok account posts a player's bloopers reel without his consent.","Defend the club's social team.","Remove the video and apologize to the player.",imp(0,10,-5,0.0),imp(3,0,5,-0.02),"social_media",false,"any_time","press"),
  s("A player's controversial Twitter/X thread about team spirit goes viral overnight.","Hold a media blackout for 48 hours.","Address it head-on in your next press conference.",imp(3,-5,-8,0.03),imp(-5,5,5,-0.03),"social_media",true,"any_time","press"),
  s("A photo of your training tactics board goes viral and is ridiculed by pundits.","Laugh it off — it was taken out of context.","Address the misunderstanding in a press briefing.",imp(0,-8,-3,0.03),imp(3,3,0,-0.02),"social_media",false,"any_time","press"),
  s("A local blogger publishes a piece calling your transfers 'the worst in club history'.","Respond with your transfer success stats.","Rise above it — don't give it oxygen.",imp(-3,-5,-3,0.0),imp(3,3,0,-0.02),"social_media",false,"any_time","press"),
  s("Your club's official account accidentally posts a private team GC message publicly.","Delete it and say nothing.","Own the mistake and make light of it.",imp(-5,-3,-5,0.0),imp(0,5,3,-0.02),"social_media",true,"any_time","press"),

  // ─── FAN RELATIONS ────────────────────────────────────────────────────────────
  s("Fan groups are organizing a march demanding the board invest in transfers.","Publicly support the fans' ambitions.","Remain neutral to protect the board relationship.",imp(-8,12,2,0.03),imp(8,-10,0,-0.02),"fans",true,"any_time","press"),
  s("A player confronts a fan who has been heckling him for three home games in a row.","Defend your player's reaction.","Issue a formal apology to the fan.",imp(-5,8,3,0.05),imp(5,-5,-3,-0.03),"fans",true,"any_time","press"),
  s("Fans vote in an online poll that your tactics are 'embarrassing'. 80% agreement.","Acknowledge the frustration openly.","Dismiss it as uninformed opinion.",imp(-3,8,0,-0.03),imp(-8,-5,0,0.03),"fans",true,"performance_low","press"),
  s("The supporter trust requests a meeting with you to discuss youth policy.","Agree to the meeting openly.","Decline — external input doesn't belong in operations.",imp(-3,12,0,-0.02),imp(8,-8,0,0.03),"fans",false,"any_time","press"),
  s("Home fans start chanting a rival player's name during a bad performance.","Acknowledge it drives you to improve.","Call it disrespectful to your squad.",imp(-3,-10,-5,0.03),imp(5,-5,-3,-0.02),"fans",true,"performance_low","press"),
  s("A fans' banner is unfurled calling for the chairman's resignation — mid-match.","Continue focusing on the game.","Approach the fourth official to have it removed.",imp(-2,5,-2,0.0),imp(5,-5,0,0.03),"fans",true,"match_day","stadium"),
  s("Supporters write an open letter praising your appointment and asking for one more season.","Publicly express gratitude.","Let results speak — words are easy.",imp(-3,12,5,-0.03),imp(3,5,3,0.0),"fans",false,"any_time","press"),
  s("Away fans are consistently outsinging the home support. Players notice.","Challenge your players to feed off it.","Meet with the fan engagement team to fix it.",imp(-3,3,5,0.05),imp(3,5,0,-0.02),"fans",false,"match_day","stadium"),
  s("A season ticket holder writes a viral letter claiming you 'ruined their matchday experience'.","Invite them for a one-on-one conversation.","Address it with a general apology to all fans.",imp(-3,8,0,-0.02),imp(0,5,0,0.0),"fans",false,"any_time","press"),
  s("Fan groups are boycotting merchandise over a club rebrand they weren't consulted on.","Support the fans — push back on the rebrand.","Back the board's commercial decision.",imp(-8,15,0,0.02),imp(10,-12,0,-0.03),"fans",true,"any_time","press"),

  // ─── PRESS / MEDIA ────────────────────────────────────────────────────────────
  s("A pundit who was once your teammate publicly calls your tactical approach 'naive'.","Challenge him to come and see training.","Rise above it — his opinion doesn't matter.",imp(-3,-5,-2,0.03),imp(3,2,0,-0.02),"press",true,"any_time","press"),
  s("A journalist claims to have insider information about a dressing room rift.","Deny it and threaten legal action.","Invite the journalist to speak to players directly.",imp(-3,-5,-3,0.03),imp(3,5,3,-0.02),"press",true,"any_time","press"),
  s("You're asked about your future at the club in a post-match interview after a defeat.","Affirm your commitment publicly.","Refuse to answer — it's not the time.",imp(5,-3,3,-0.03),imp(-3,0,-3,0.03),"press",false,"performance_low","press"),
  s("A broadcaster asks to do a fly-on-the-wall access documentary.","Agree — transparency builds trust.","Decline — media access should stay controlled.",imp(-3,12,3,-0.03),imp(5,-5,-3,0.02),"press",false,"any_time","press"),
  s("Your press conference is interrupted by a protesting fan who gets past security.","Handle it calmly on camera.","Walk out and reschedule.",imp(-3,8,0,-0.02),imp(3,-3,-3,0.03),"press",true,"any_time","press"),
  s("A national newspaper gives your last ten signings a collective D- transfer rating.","Respond with detailed stats to counter the narrative.","Ignore it — papers need clicks.",imp(-2,-5,-3,0.0),imp(3,2,0,-0.02),"press",false,"transfer_window","press"),
  s("You're accused of time-wasting in a press conference by an opposition manager.","Apologize and commit to better conduct.","Fire back with your own accusations.",imp(5,-3,0,-0.03),imp(-8,5,-3,0.08),"press",true,"any_time","press"),
  s("A podcast with 500k listeners claims to have 'exclusive' audio of your halftime team talk.","Issue a formal denial.","Find the leak and deal with them quietly.",imp(-5,-3,-8,0.03),imp(3,0,3,0.0),"press",true,"any_time","press"),
  s("You slip up and use a banned word during a live press conference.","Apologize immediately and take accountability.","Claim it was taken out of context.",imp(5,0,0,-0.03),imp(-8,-8,-5,0.03),"press",true,"any_time","press"),
  s("A reporter ambushes you outside the stadium with questions about a player's personal life.","Decline to comment and keep walking.","Stop and set the record straight.",imp(3,0,0,-0.02),imp(-3,3,0,0.02),"press",false,"any_time","press"),

  // ─── INTERNATIONAL DUTY ───────────────────────────────────────────────────────
  s("Three of your key players return from international duty with minor muscle strains.","Rest them for the next game.","Trust the medical team and make a decision on the day.",imp(3,0,5,-0.05),imp(-3,3,-3,0.03),"training_ground",true,"any_time","training"),
  s("A national team manager asks you to release a player mid-season for a non-competitive friendly.","Release him — international harmony matters.","Decline — he's mid-injury recovery.",imp(-5,5,0,-0.02),imp(5,-3,3,0.02),"board_pressure",false,"any_time","press"),
  s("Your captain returns from international duty claiming the national manager 'destroyed his confidence'.","Give him a confidence-boosting run of games.","Tell him to leave international issues at the door.",imp(3,0,5,-0.03),imp(-2,0,-5,0.03),"player_ego",true,"any_time","locker"),
  s("A player scores a hat-trick for his national team but returns exhausted 48 hours before your match.","Start him anyway — he's in form.","Rest him and bring in a fresh option.",imp(-3,8,-5,0.05),imp(5,-5,5,-0.03),"training_ground",false,"match_day","training"),
  s("An international break falls just as your team hits a winning run of five games.","Use it to drill new patterns into the team.","Give players complete rest — protect the momentum.",imp(3,0,5,0.0),imp(-3,0,8,-0.03),"training_ground",false,"performance_high","training"),

  // ─── YOUTH & ACADEMY ──────────────────────────────────────────────────────────
  s("Your 17-year-old academy star is wanted by a top European club's academy.","Block the move — he belongs here.","Let him decide — his development matters most.",imp(5,-3,5,-0.02),imp(-5,5,-3,0.02),"board_pressure",true,"transfer_window","press"),
  s("An academy player breaks the dress code wearing flashy designer gear to training.","Make an example and enforce the code.","Have a quiet word — don't kill his personality.",imp(3,0,-3,0.03),imp(-2,3,3,-0.02),"training_ground",false,"any_time","training"),
  s("Your youth coach wants to promote six academy players to the first-team bench.","Back the decision — give youth a chance.","Insist on experience in the squad.",imp(-5,12,-3,-0.02),imp(5,-8,0,0.02),"board_pressure",false,"any_time","press"),
  s("A parent of an academy player confronts you at the training ground about their son's lack of game time.","Invite them for a proper sit-down meeting.","Refer them to the academy manager.",imp(-2,3,5,-0.02),imp(3,-3,-3,0.02),"training_ground",false,"any_time","training"),
  s("Two academy prospects ask to leave on loan to get first-team experience.","Sanction both loans.","Keep one and let one go.","",imp(0,5,3,-0.02),imp(0,3,0,0.0),"board_pressure",false,"transfer_window","press"),

  // ─── INJURY CRISIS ────────────────────────────────────────────────────────────
  s("Five first-team players are injured simultaneously. The media calls it a 'crisis'.","Promote youth players and reshape the team.","Spend emergency funds on short-term loan signings.",imp(-5,8,5,-0.02),imp(5,-3,-3,0.03),"training_ground",true,"player_injury","training"),
  s("A player is secretly playing through a serious knee injury to avoid letting the team down.","Stand him down immediately regardless of his protests.","Respect his choice but increase monitoring.",imp(5,0,8,-0.05),imp(-3,5,-5,0.05),"training_ground",true,"player_injury","training"),
  s("Your physio is concerned a player may be faking injury to avoid selection.","Call a specialist in for a second opinion.","Drop the player as a message to the squad.",imp(0,0,-3,0.0),imp(-8,-3,-8,0.05),"training_ground",false,"any_time","training"),
  s("A player tears his ACL in training and is out for 9 months. He publicly blames the training intensity.","Accept some responsibility and review intensity.","Defend your methods — injuries happen in football.",imp(3,-5,3,-0.03),imp(-5,3,-3,0.03),"training_ground",true,"player_injury","training"),
  s("Your backup goalkeeper injures himself warming up. You have no recognized third choice.","Start an outfield player in goal.","Rush a free agent emergency signing.",imp(-5,5,-3,0.05),imp(3,-3,0,0.0),"training_ground",true,"player_injury","stadium"),

  // ─── REFEREE / OFFICIATING ────────────────────────────────────────────────────
  s("The referee books you on the touchline for the third time this season.","Accept it and ask a coach to continue your instructions.","Publicly question the referee's consistency post-match.",imp(5,-3,-3,-0.05),imp(-8,5,-3,0.08),"tactics",true,"any_time","press"),
  s("You're told a VAR decision that went against you was an 'acknowledged error'.","Accept the apology and move on.","Demand the league review the officiating standard.",imp(3,-3,0,-0.02),imp(-5,5,-3,0.05),"press",true,"any_time","press"),
  s("The referee in your next match has given more red cards against your club than any other.","Warn your players not to give him any reason.","Request the appointment be reviewed.",imp(3,0,0,-0.03),imp(-5,0,-3,0.03),"tactics",false,"match_day","press"),
  s("A linesman waves offside when replays clearly show the goal was legal.","Protest immediately — goal needed to stand.","Accept the decision and refocus.",imp(-5,5,-3,0.08),imp(3,-3,3,-0.03),"tactics",true,"match_day","stadium"),
  s("Post-match data shows your team was incorrectly denied three clear penalties over two games.","Present the data publicly and demand answers.","Share the data privately with the board.",imp(-5,8,-3,0.05),imp(3,-3,0,-0.02),"press",true,"performance_low","press"),

  // ─── MANAGER PERSONAL ─────────────────────────────────────────────────────────
  s("You receive a job offer from a Champions League club midway through the season.","Reject it — your club comes first.","Meet with them privately before deciding.",imp(5,3,5,-0.03),imp(-12,-8,-10,0.05),"board_pressure",true,"any_time","press"),
  s("The media reports you've been spotted looking at houses in another city.","Deny it publicly and recommit to the club.","Stay silent and let results do the talking.",imp(5,-3,3,-0.03),imp(-8,-5,-5,0.03),"press",true,"any_time","press"),
  s("You're offered a lucrative TV punditry deal to be fulfilled during the international break.","Decline — full focus on the job.","Accept — it's a good platform for the club.",imp(5,0,3,-0.02),imp(-5,5,0,0.0),"press",false,"any_time","press"),
  s("Your family is photographed at a rival club's match and it sparks speculation.","Address it honestly — family watches football.","Avoid commenting — it's a private matter.",imp(0,3,0,-0.02),imp(-3,-3,-3,0.03),"press",false,"any_time","press"),
  s("You're voted 'Manager of the Month' but your team loses in the same week.","Celebrate the award and use it as motivation.","Downplay the award — only the result matters.",imp(3,5,0,-0.02),imp(5,-3,5,-0.03),"press",false,"performance_high","press"),
  s("A betting company offers you 10x your salary for one sponsored post.","Decline — conflict of interest.","Consult the board before deciding.",imp(5,0,0,-0.02),imp(-3,0,0,0.0),"press",false,"any_time","press"),
  s("A ghost-written autobiography attributed to you is published without your approval.","Threaten legal action immediately.","Laugh it off and write a real one yourself.",imp(-5,-3,-3,0.03),imp(0,8,3,-0.03),"press",true,"any_time","press"),
  s("You storm off the pitch at halftime and the cameras catch your body language.","Go back out and show composure.","Own the passion — the team needed to see it.",imp(3,0,5,-0.03),imp(-5,5,-3,0.05),"press",false,"halftime","stadium"),
  s("The opposition manager shakes your hand before the game but ignores you at full time.","Call him out professionally in the press.","Say nothing — results spoke for themselves.",imp(-3,3,0,0.02),imp(3,-2,0,-0.02),"press",false,"match_day","press"),
  s("A journalist reveals your pre-match meal routine and it becomes a national joke.","Laugh along with the coverage.","Change your routine and address the leak.",imp(0,8,3,-0.02),imp(3,-5,-3,0.02),"press",false,"any_time","press"),

  // ─── DRESSING ROOM CULTURE ────────────────────────────────────────────────────
  s("Players are split on whether to take a knee before matches. Argument breaks out.","Mandate a unified stance as a club.","Let players make individual choices.",imp(5,-3,-5,-0.03),imp(-3,3,5,0.02),"training_ground",true,"match_day","locker"),
  s("The dressing room playlist has become a war zone between different music factions.","Rotate the DJ rights weekly by agreement.","Ban personal music — introduce club-chosen sessions.",imp(-2,3,5,-0.02),imp(2,0,-3,0.02),"training_ground",false,"any_time","locker"),
  s("Several players are forming cliques based on nationality. Training atmosphere suffers.","Hold a mandatory team-building away day.","Address it directly with the captain.",imp(0,0,8,-0.05),imp(3,0,5,-0.03),"training_ground",true,"any_time","locker"),
  s("A senior player is caught intimidating younger squad members about social media posts.","Discipline him immediately.","Handle it through the captain confidentially.",imp(3,0,-8,0.05),imp(-3,0,5,0.02),"player_ego",true,"any_time","locker"),
  s("Players run a secret sweepstake on the next tactical formation you'll use.","Laugh it off — great banter.","End it immediately — undermines tactical preparation.",imp(-3,8,5,-0.03),imp(3,-5,-3,0.03),"training_ground",false,"any_time","locker"),
  s("Your captain privately tells you three players are considering refusing contract renewals together.","Address each player individually.","Call a full squad meeting to clear the air.",imp(3,0,-5,-0.03),imp(-5,0,5,0.02),"player_ego",true,"any_time","locker"),
  s("Players are openly laughing at tactical instructions from your assistant coach.","Replace the assistant.","Defend your staff and address the disrespect.",imp(-5,0,-8,0.05),imp(3,0,5,-0.03),"training_ground",true,"any_time","locker"),
  s("The squad organizes a karting day without inviting the coaching staff.","Join uninvited to show unity.","Let them enjoy their bond — space matters.",imp(-2,5,8,-0.03),imp(3,0,5,-0.02),"training_ground",false,"any_time","locker"),
  s("A player brings his dog to training and half the squad is obsessed with it.","Make it a regular mascot.","Remind everyone this is a professional environment.",imp(-2,8,5,-0.03),imp(3,-3,-3,0.02),"training_ground",false,"any_time","locker"),
  s("The squad demands a full day off after a poor run of results to 'reset mentally'.","Grant the day — mental health matters.","Insist on training — discipline is needed right now.",imp(-3,5,8,-0.05),imp(5,-3,-5,0.05),"training_ground",false,"performance_low","locker"),

  // ─── WEATHER / FIXTURE CHAOS ──────────────────────────────────────────────────
  s("A snow storm is forecast the day before a vital home match.","Request a postponement proactively.","Trust the groundskeeping team to prepare the pitch.",imp(0,0,3,-0.03),imp(3,5,-3,0.02),"tactics",false,"match_day","stadium"),
  s("Three matches get rescheduled in the same week due to a rivals' cup run.","Rotate aggressively and trust the depth.","Play your strongest lineup in every game.",imp(3,0,5,-0.05),imp(-5,5,-8,0.08),"formation",true,"any_time","training"),
  s("Extreme heat makes the pitch unplayable during a pre-season tour match.","Request a 48-hour postponement.","Play it — squad needs the minutes.",imp(0,0,3,-0.02),imp(-3,0,-5,0.05),"tactics",false,"any_time","stadium"),
  s("Fog rolls in mid-match making it impossible to see across the pitch.","Request the match be abandoned.","Continue — your team is comfortable in chaos.",imp(0,0,0,-0.02),imp(-3,5,3,0.05),"tactics",false,"match_day","stadium"),

  // ─── COMMERCIAL / SPONSOR ─────────────────────────────────────────────────────
  s("The main shirt sponsor adds an embarrassing logo mid-season without player consultation.","Back the sponsor — it's a board decision.","Request an emergency meeting with the commercial team.",imp(8,-5,-3,-0.02),imp(-5,3,3,0.02),"board_pressure",false,"any_time","press"),
  s("A kit supplier sends the wrong shorts to the stadium on matchday.","Play in training shorts as a makeshift solution.","Delay kickoff while sourcing the correct kit.",imp(-3,5,-2,0.03),imp(0,-3,0,0.0),"tactics",false,"match_day","stadium"),
  s("A local business approaches you to open a restaurant in your name.","Accept — great community engagement.","Decline — distractions must be minimized.",imp(-3,8,0,-0.02),imp(3,-3,0,0.02),"press",false,"any_time","press"),
  s("The kit manufacturer wants players to wear an experimental new boot in a live match.","Trial it — innovation drives performance.","Refuse — comfort and familiarity come first.",imp(3,3,-3,0.0),imp(-3,-3,3,0.0),"board_pressure",false,"match_day","stadium"),
];

// Filter out any accidental duplicates vs existing
const cleaned = newScenarios.filter(sc =>
  sc.scenario && !existingTexts.has(sc.scenario.toLowerCase())
);

// Assign IDs starting from current count
const indexed = cleaned.map((sc, i) => ({
  ...sc,
  scenarioId: `local_${startIdx + i}`
}));

const updated = {
  scenarios: [...existing.scenarios, ...indexed]
};

fs.writeFileSync('src/lib/scenarios.json', JSON.stringify(updated, null, 2));
console.log(`Added: ${indexed.length} new scenarios`);
console.log(`Total: ${updated.scenarios.length} scenarios`);
