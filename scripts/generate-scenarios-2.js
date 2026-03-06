const fs = require('fs');

const existing = JSON.parse(fs.readFileSync('src/lib/scenarios.json', 'utf8'));
const existingTexts = new Set(existing.scenarios.map(s => s.scenario.toLowerCase()));
const startIdx = existing.scenarios.length;

const s = (scenario, leftOption, rightOption, impactLeft, impactRight, imageCategory, isBreaking, triggerCondition, gameCategory) => ({
  scenario, leftOption, rightOption, impactLeft, impactRight, imageCategory, isBreaking, triggerCondition, gameCategory
});
const imp = (board, fans, squad, aggression) => ({ board, fans, squad, aggression });

const batch2 = [

  // ─── PLAYER EGO EXTENDED ─────────────────────────────────────────────────────
  s("Your star forward demands a clause that lets him leave if you get sacked.","Agree — shows loyalty to him.","Refuse — no player dictates contract terms.",imp(-5,3,5,0.0),imp(8,-5,-5,0.03),"player_ego",true,"any_time","locker"),
  s("A player earns more than your entire coaching staff combined. He knows it.","Address wage structure with the board.","Ignore it — it's a board decision.",imp(-5,0,3,0.0),imp(5,0,-3,0.0),"board_pressure",false,"any_time","locker"),
  s("Your goalkeeper blames a defender for every goal conceded — on the pitch, loudly.","Substitute the keeper for squad discipline.","Speak to both players separately post-match.",imp(2,0,-8,0.05),imp(-2,0,5,-0.03),"player_ego",true,"match_day","stadium"),
  s("A forward insists on taking all throw-ins near the opposition box. It's slowing attacks.","Let him — he's a key man.","Correct the habit firmly in training.",imp(-3,0,-5,-0.02),imp(3,0,5,0.02),"tactics",false,"any_time","training"),
  s("Your loan player's parent club instructs him not to risk himself in tackles.","Accept their terms to keep the loan.","Reject their interference and return him early.",imp(5,0,-5,-0.03),imp(-8,0,5,0.05),"board_pressure",true,"any_time","locker"),
  s("A player's tattoo of your club's badge causes controversy due to its design.","Laugh it off as extreme loyalty.","Ask him to get it modified.",imp(-3,10,3,-0.02),imp(2,-3,-3,0.02),"player_ego",false,"any_time","locker"),
  s("Your striker celebrates a goal by sitting down on the pitch and refusing to move.","Embrace the viral moment.","Drop him for the next game for showboating.",imp(-5,12,-8,-0.03),imp(5,-5,3,0.05),"player_ego",true,"match_day","stadium"),
  s("A midfielder publishes a self-help book during the season calling football 'just a job'.","Back his right to express himself.","Ensure it hasn't damaged dressing room culture.",imp(-3,5,-8,0.0),imp(3,-3,5,-0.02),"social_media",true,"any_time","press"),
  s("Your player refuses to sub off when shown the board, walks slowly and argues.","Public fine and immediate action.","Speak to him post-match and keep it in-house.",imp(5,-3,-5,0.08),imp(-3,3,5,-0.03),"player_ego",true,"match_day","stadium"),
  s("A player scores an own goal and then laughs at himself in the press conference.","Applaud his attitude.","Warn him that professionalism comes first.",imp(-2,8,3,-0.02),imp(3,-5,-3,0.02),"player_ego",false,"any_time","press"),
  s("Your playmaker demands the ball every time regardless of the pressing situation.","Accept it — he makes things happen.","Coach him into reading the press better.",imp(-3,3,-3,-0.02),imp(3,-2,5,0.0),"tactics",false,"any_time","training"),
  s("A player skips the post-match cooldown every week to get to his car first.","Enforce mandatory cooldowns for all.","Let it go — results are more important.",imp(3,0,2,0.02),imp(-2,0,-2,-0.02),"training_ground",false,"any_time","training"),
  s("Your team's top scorer hasn't spoken to the press all season. Media are furious.","Encourage him to do one interview.","Protect his preference — football is the priority.",imp(-3,-5,3,-0.02),imp(5,3,-2,0.02),"press",false,"any_time","press"),
  s("A player wears noise-cancelling headphones during your pre-match team talk.","Remove them and address the disrespect.","Let it pass — he's a known introvert.",imp(3,0,-5,0.03),imp(-3,0,3,-0.02),"player_ego",false,"match_day","locker"),
  s("Your defender marks the wrong player and concedes. He then blames the goalkeeper.","Make him apologize to the keeper publicly.","Address it privately in the debrief.",imp(2,0,-8,0.03),imp(-2,0,5,-0.02),"player_ego",false,"any_time","locker"),
  s("A player demands to be the only one to speak to referees during matches.","Grant it — reduces team bookings.","Reject — captains handle referee communication.",imp(3,0,3,-0.03),imp(-2,0,-2,0.02),"tactics",false,"match_day","stadium"),
  s("Your academy product tells the media he never wants to leave the club. Rivals offer £40m.","Reject the bid — honour his words.","Accept and reinvest in the squad.",imp(-5,12,5,-0.03),imp(15,-10,-3,0.0),"player_ego",true,"transfer_window","press"),
  s("A player demands a personal chef be hired at the club's expense after reading about elite clubs.","Fund it as an investment in performance.","Politely decline — the canteen is sufficient.",imp(3,2,5,-0.02),imp(-3,-2,-3,0.02),"player_ego",false,"any_time","locker"),
  s("Your forward has started refusing to track back. He says 'that's not my job'.","Drop him to make a point.","Redesign the system to protect him.",imp(3,-3,-8,0.05),imp(-2,3,3,-0.03),"tactics",true,"any_time","locker"),
  s("A player gets a portrait of himself tattooed on his own arm. Squad finds it hilarious.","Let the banter flow — good for morale.","Discourage excessive ego displays.",imp(-3,8,8,-0.03),imp(2,-3,-3,0.02),"player_ego",false,"any_time","locker"),

  // ─── BOARD PRESSURE EXTENDED ─────────────────────────────────────────────────
  s("The board tables a plan to move the club to a new city to grow the fanbase.","Oppose it — roots matter.","Remain neutral and let the board decide.",imp(-15,15,5,0.02),imp(5,-10,-3,0.0),"board_pressure",true,"any_time","press"),
  s("A billionaire threatens to withdraw investment unless you're replaced.","Back the board's right to make the call.","Publicly challenge the threat.",imp(-3,-3,-5,0.03),imp(-8,-5,-8,0.08),"board_pressure",true,"any_time","press"),
  s("The board hires a Director of Football who overrules one of your signings.","Accept the veto — work within the structure.","Escalate to the chairman immediately.",imp(5,0,-5,-0.03),imp(-8,0,3,0.05),"board_pressure",true,"transfer_window","press"),
  s("The board refuses to build a recovery pool despite mounting injuries.","Accept the budget decision.","Commission a private report on injury costs.",imp(-5,0,-3,0.03),imp(3,0,3,-0.02),"board_pressure",false,"player_injury","press"),
  s("A board member undermines you in a fan Q&A session live on YouTube.","Request a private meeting to resolve tension.","Respond publicly to correct the narrative.",imp(-5,-3,-5,0.03),imp(-10,-8,-5,0.08),"board_pressure",true,"any_time","press"),
  s("The board approves a kit design your players hate without your input.","Back the board's commercial decision.","Quietly relay player dissatisfaction to the chairman.",imp(8,-5,-5,-0.02),imp(-5,3,5,0.02),"board_pressure",false,"any_time","locker"),
  s("New ownership wants to rebrand the club with a completely different badge.","Support the change — new era.","Lead the opposition on behalf of fans.",imp(8,-15,-5,-0.03),imp(-10,15,3,0.05),"board_pressure",true,"any_time","press"),
  s("The board refuses compensation to a youth coach you want to promote.","Promote him anyway — justify later.","Accept and find an internal solution.",imp(-5,0,3,-0.02),imp(3,0,-3,0.02),"board_pressure",false,"any_time","training"),
  s("Your chairman wants to introduce a performance-related pay clause into your contract.","Accept — you believe in your ability.","Reject — pressure shouldn't change your approach.",imp(5,0,3,0.0),imp(-5,0,-3,0.0),"board_pressure",false,"any_time","press"),
  s("The club announces a kit price increase of 30% the week after a bad run.","Distance yourself from the decision.","Support it — clubs need revenue.",imp(-8,12,0,0.02),imp(8,-10,0,-0.02),"board_pressure",true,"any_time","press"),
  s("The board cuts the youth scouting budget by half after a poor financial quarter.","Accept the cuts quietly.","Fight for the budget — future of the club depends on it.",imp(5,0,-5,-0.02),imp(-8,5,5,0.03),"board_pressure",true,"any_time","press"),
  s("The chairman wants to fast-track a major signing without a medical.","Refuse — due diligence is non-negotiable.","Accept given the circumstances and tight deadline.",imp(-5,3,-3,0.0),imp(5,0,0,0.02),"board_pressure",true,"transfer_window","press"),

  // ─── FORMATION / TACTICS EXTENDED ────────────────────────────────────────────
  s("You've won three straight using a 4-3-3 but analysts say opponents have figured you out.","Switch to a 3-5-2 for unpredictability.","Trust the system — don't fix what isn't broken.",imp(-2,3,-3,0.03),imp(3,-2,3,-0.02),"formation",false,"performance_high","stadium"),
  s("Your fullbacks are bombing forward but leaving you exposed. You're up 1-0.","Tell them to hold positions for the last 20 mins.","Let them keep going — attack is the best defense.",imp(3,-3,3,-0.05),imp(-3,5,-3,0.08),"formation",false,"match_winning","stadium"),
  s("Your striker is unmarked at the back post but never makes the run. He scores from elsewhere.","Accept his instinct — he's scoring.","Drill the back post run regardless of his preference.",imp(0,5,0,-0.02),imp(3,0,3,0.02),"tactics",false,"any_time","training"),
  s("Your press has been bypassed three times in a row. The system looks exposed.","Drop to a mid-block immediately.","Keep the press — one adjustment will fix it.",imp(2,0,0,-0.03),imp(-3,3,-3,0.05),"formation",false,"match_day","stadium"),
  s("You're playing a team that sits very deep. Your wingers are useless against a low block.","Bring on your target man and go direct.","Keep the wingers on and be patient.",imp(-3,3,-2,0.05),imp(3,-3,2,-0.03),"substitution",false,"match_day","stadium"),
  s("Your dominant pressing style is causing fatigue in a congested fixture schedule.","Take your foot off the press for a couple of matches.","Maintain the intensity — it's your identity.",imp(3,0,5,-0.05),imp(-5,3,-5,0.08),"tactics",true,"any_time","training"),
  s("You've been playing three at the back but your centre-back is on a yellow card.","Revert to four at the back to protect him.","Keep three at the back — protect your structure.",imp(2,0,3,-0.03),imp(-2,0,-2,0.03),"formation",false,"match_day","stadium"),
  s("Your striker asks to drop deeper to link play but it leaves you with no striker.","Let him experiment — trust his vision.","Keep him as an out-and-out striker.",imp(-2,3,-2,0.0),imp(3,-2,3,0.0),"tactics",false,"any_time","training"),
  s("The opposition manager has successfully neutralized your preferred shape three times.","Surprise them with a completely new formation.","Stick to your principles — tweak minor details.",imp(-2,3,-2,0.05),imp(3,-2,3,-0.03),"formation",true,"match_day","stadium"),
  s("Your team scores three goals from set pieces in one game. Fans want more set piece drills.","Increase set piece practice time.","Keep balance — don't over-specialize.",imp(0,5,0,-0.02),imp(3,-2,3,0.02),"tactics",false,"performance_high","training"),
  s("You switch to a high press away from home and concede three on the counter.","Abandon the press for away games.","Tweak the press rather than abandoning it.",imp(2,0,0,-0.05),imp(-2,3,-2,0.03),"formation",false,"away_game","stadium"),
  s("A 17-year-old has earned a start through sheer training performance. The press is watching.","Start him — reward the work rate.","Give him 30 minutes as a sub instead.",imp(-3,10,5,-0.02),imp(3,-3,-3,0.02),"substitution",false,"match_day","stadium"),
  s("Your strikers are pressing high but midfield isn't tracking — leaving gaps everywhere.","Tell midfield to join the press harder.","Drop striker line to close the gap.",imp(-2,3,-3,0.05),imp(3,-2,3,-0.03),"formation",false,"match_day","stadium"),
  s("You want to debut a new counter-pressing system but players aren't drilled in it yet.","Trial it in the next match anyway.","Wait until the international break to drill it properly.",imp(-2,5,-5,0.05),imp(3,-3,5,-0.02),"tactics",false,"match_day","training"),

  // ─── SUBSTITUTION EXTENDED ───────────────────────────────────────────────────
  s("Your goalkeeper is having a nightmare. You have one sub left. Use it on him?","Yes — the team needs stability.","Save the sub — he'll find his way back.",imp(3,-3,5,-0.03),imp(-3,5,-5,0.05),"substitution",true,"match_day","stadium"),
  s("A sub comes on and immediately argues with a teammate about position.","Substitute him off immediately.","Intervene from the touchline and resolve it.",imp(2,0,-8,0.05),imp(-3,0,3,-0.02),"substitution",true,"match_day","stadium"),
  s("You make three subs at once and the team loses the plot — concedes immediately.","Hold your nerve and make no more changes.","Calm the team from the touchline urgently.",imp(2,0,-3,-0.03),imp(-2,5,3,0.0),"substitution",false,"match_day","stadium"),
  s("Your intended sub refuses to warm up. He expected to start.","Force the warm-up — professionalism matters.","Use a different sub and deal with it post-match.",imp(3,0,-8,0.05),imp(-2,0,5,-0.02),"substitution",true,"match_day","stadium"),
  s("You bring on a winger and he scores within 60 seconds of coming on.","Trust the sub to continue and press for another.","Protect the lead and revert to defensive shape.",imp(-3,8,-2,0.05),imp(3,-3,2,-0.03),"substitution",false,"match_winning","stadium"),
  s("A player who's been dropped storms out of the ground after being benched again.","Confront him publicly and discipline him.","Speak to him privately — he's clearly struggling.",imp(3,-3,-8,0.05),imp(-3,3,5,-0.02),"substitution",true,"match_day","locker"),
  s("Your captain demands to know why he's being substituted at halftime while the camera rolls.","Answer honestly and calmly on camera.","Quietly tell him to keep it for the dressing room.",imp(-2,5,-5,0.03),imp(3,-2,5,-0.02),"substitution",true,"halftime","stadium"),

  // ─── PRESS CONFERENCE EXTENDED ───────────────────────────────────────────────
  s("A reporter calls your 4-4-2 'dinosaur football' at a packed press conference.","Laugh and ask if dinosaurs won titles.","Explain your tactical rationale calmly.",imp(0,8,3,0.0),imp(3,-2,-2,-0.02),"press",false,"any_time","press"),
  s("You're asked if you'd drop a player for attitude — and he's sitting next to you.","Answer diplomatically with him present.","Ask the player to leave before answering.",imp(-2,0,-5,0.03),imp(3,0,3,-0.02),"press",true,"any_time","press"),
  s("Your post-match interview is broadcast globally and you accidentally praise the wrong opponent.","Correct yourself and move on gracefully.","Issue a formal clarification post-broadcast.",imp(0,5,0,-0.02),imp(2,0,0,0.0),"press",false,"match_day","press"),
  s("You walk into a press conference to find the previous manager's chair still at the table.","Ignore it and get on with things.","Ask for it to be removed before you sit.",imp(0,3,0,0.0),imp(-2,0,0,0.02),"press",false,"any_time","press"),
  s("A journalist reveals your personal phone number has been shared on a fan forum.","Alert the club's security team immediately.","Laugh it off — football is open enough.",imp(5,0,0,-0.02),imp(-3,5,0,0.0),"press",false,"any_time","press"),
  s("You're asked to give your prediction for the title race live on national TV.","Give an honest prediction confidently.","Deflect — focus on your own game.",imp(-3,5,0,0.0),imp(3,-2,0,-0.02),"press",false,"any_time","press"),
  s("A journalist quotes a player's agent claiming you've 'lost the dressing room'.","Deny it firmly and back your squad.","Invite the press into training to see for themselves.",imp(5,-5,-3,0.03),imp(-3,5,5,-0.03),"press",true,"performance_low","press"),
  s("You go on a live rant about fixture congestion. It becomes a viral clip.","Double down — it needed to be said.","Walk back the comments in the next press conference.",imp(-5,10,-2,0.05),imp(3,-3,2,-0.02),"press",true,"any_time","press"),
  s("A foreign press outlet translates your interview incorrectly and creates a scandal.","Issue a correction through official channels.","Ignore it — domestic audience is what matters.",imp(3,-3,-2,-0.02),imp(-3,3,0,0.02),"press",true,"any_time","press"),
  s("You're offered a weekly radio slot to discuss football. Management would love the exposure.","Accept — good platform for the club.","Decline — too many distractions already.",imp(-3,8,0,-0.02),imp(3,-3,0,0.02),"press",false,"any_time","press"),

  // ─── SOCIAL MEDIA EXTENDED ───────────────────────────────────────────────────
  s("A player's partner live-tweets your half-time team talk from the stands using second-hand info.","Contact the player immediately.","Issue a ban on phones in the family section.",imp(-3,-5,-8,0.05),imp(5,-3,5,-0.02),"social_media",true,"halftime","press"),
  s("Your club's social media team posts a meme mocking a rival club. It gets 500k likes.","Celebrate the engagement.","Remove the post — rivalry should stay on the pitch.",imp(-3,12,0,-0.03),imp(5,-5,0,0.02),"social_media",false,"any_time","press"),
  s("A player creates an anonymous football meme account that's going viral — yours included.","Expose him as a genius.","Remind him of his social media obligations.",imp(-3,12,5,-0.03),imp(3,-5,-3,0.02),"social_media",false,"any_time","locker"),
  s("A former player goes on a podcast and rates every current squad member publicly.","Let it fuel the squad's motivation.","Block all squad access to the podcast.",imp(-3,5,5,-0.02),imp(3,-5,-3,0.03),"social_media",true,"any_time","press"),
  s("Your training video edited with viral music gets 2M views — but exposes your set pieces.","Leave it up — the morale boost is worth it.","Take it down and review content approval processes.",imp(-5,12,-3,-0.02),imp(3,-5,0,0.02),"social_media",true,"any_time","press"),
  s("A player's reaction video to a new signing goes viral for all the wrong reasons.","Dismiss it as misinterpreted.","Speak to the player privately about professionalism.",imp(-3,-5,-5,0.03),imp(3,3,3,-0.02),"social_media",true,"transfer_window","locker"),
  s("The club's chatbot on the website starts giving incorrect transfer information.","Pull the chatbot offline immediately.","Leave it and correct errors manually.",imp(-3,-5,-2,0.0),imp(2,2,0,0.02),"social_media",false,"any_time","press"),
  s("A player's 'goals compilation' montage on YouTube deliberately excludes three teammates.","Address the passive aggression head-on.","Let the algorithm handle who notices.",imp(2,3,-8,0.03),imp(-2,-3,3,-0.02),"social_media",false,"any_time","locker"),
  s("A deepfake of your voice is used in a betting ad. It's convincing and everywhere.","Pursue legal action immediately.","Issue a clear denial and move on.",imp(5,0,0,-0.02),imp(-3,3,0,0.02),"social_media",true,"any_time","press"),
  s("Your club's Instagram story accidentally shows the tactics board before a Champions League match.","Delete it and hope it wasn't screenshotted.","Own the mistake with a joke post.",imp(-8,-5,-5,0.03),imp(0,8,0,-0.02),"social_media",true,"match_important","press"),

  // ─── FAN RELATIONS EXTENDED ──────────────────────────────────────────────────
  s("Fans hang a 'Save Our Club' banner after rumours of a leveraged buyout.","Support the fans' fears publicly.","Stay neutral and focus on football.",imp(-8,12,0,0.03),imp(8,-8,0,-0.02),"fans",true,"any_time","press"),
  s("Supporters call for a minute's applause for a club legend — during your team's warm-up.","Stop the warm-up and lead the applause.","Acknowledge it after the match.",imp(-3,15,5,-0.03),imp(3,-5,-3,0.02),"fans",false,"match_day","stadium"),
  s("An away end is closed by the host club. Your fans are stranded with nowhere to sit.","Delay your pre-match preparations to help coordinate.","Leave it to the club administrators.",imp(-5,10,0,0.0),imp(3,-5,0,0.0),"fans",true,"away_game","press"),
  s("Fan groups demand the introduction of standing sections in the stadium.","Publicly back the campaign.","Stay neutral — it's a board and safety decision.",imp(-5,12,0,0.02),imp(5,-8,0,-0.02),"fans",false,"any_time","press"),
  s("A group of ultras start choreographing TikTok dances in the stands instead of supporting.","Invite them to get behind the team instead.","Appreciate the creativity and engagement.",imp(0,-5,0,0.0),imp(-3,10,0,-0.02),"fans",false,"match_day","stadium"),
  s("Away supporters wave a banner insulting one of your players' personal life.","Make a formal complaint to the away club.","Tell your player to use it as fuel.",imp(3,0,3,-0.02),imp(-3,8,-3,0.05),"fans",true,"match_day","stadium"),
  s("The home end sings a rival manager's name to taunt you. It catches on.","Use it as motivation in your team talk.","Acknowledge it and promise a reaction.",imp(-3,5,5,0.05),imp(3,-3,-3,-0.02),"fans",false,"match_day","stadium"),
  s("Fans organize a 'no noise' protest against ownership. The ground is silent.","Speak publicly in support of the protest.","Ask fans to get behind the team regardless.",imp(-8,10,-3,0.03),imp(3,-5,3,-0.02),"fans",true,"match_day","stadium"),
  s("Supporters' trust buys a 1% stake in the club. They expect a board seat.","Support the representation.","Remain professional but cautious.",imp(-5,12,0,0.0),imp(5,-8,0,-0.02),"fans",false,"any_time","press"),
  s("A fan streaks across the pitch during a pivotal match. Players burst out laughing.","Let the moment pass — refocus on the game.","Ask for stricter security measures post-match.",imp(-3,10,-5,-0.03),imp(3,-3,3,0.02),"fans",true,"match_day","stadium"),

  // ─── INJURY MANAGEMENT ───────────────────────────────────────────────────────
  s("Your physio recommends microchip tracking implants for players to monitor load. Half refuse.","Make it mandatory for the squad.","Make it optional and respect player choice.",imp(3,0,-5,0.0),imp(-3,0,5,-0.02),"training_ground",false,"any_time","training"),
  s("Three players get injured in the same warm-up drill. The session design is questioned.","Suspend the drill pending investigation.","Defend the methodology — injuries are random.",imp(3,0,-3,0.0),imp(-3,0,-3,0.02),"training_ground",true,"player_injury","training"),
  s("A player returns early from injury against medical advice because 'the team needs him'.","Allow it — his mentality is incredible.","Stand him down — protect the long-term.",imp(-3,8,-3,0.05),imp(5,-3,8,-0.05),"training_ground",true,"player_injury","training"),
  s("An injury crisis leaves you playing a central midfielder at right back.","Back him in the unfamiliar role.","Play a youth player in position instead.",imp(-2,5,-3,0.03),imp(-2,3,3,-0.02),"formation",false,"player_injury","stadium"),
  s("The medical team says your best player needs a rest week. There's a cup final in 8 days.","Rest him for the week and trust the recovery.","Manage his training load but keep him involved.",imp(3,0,5,-0.05),imp(-2,3,-2,0.03),"training_ground",true,"cup_match","training"),
  s("A player who just returned from injury asks to play 90 minutes in a low-stakes game.","Give him the confidence boost of 90 minutes.","Manage his minutes carefully — 60 max.",imp(-2,5,5,0.03),imp(3,0,3,-0.02),"training_ground",false,"any_time","stadium"),
  s("Your star player is limping but gesturing he's fine from the pitch.","Trust him — he knows his body.","Substitute him immediately.",imp(-3,8,-3,0.05),imp(5,-3,5,-0.05),"substitution",true,"match_day","stadium"),
  s("New wearable tech flags a player as 'high risk of hamstring injury'. He feels perfectly fine.","Rest him as a precaution.","Trust his feeling — the data isn't always right.",imp(3,0,3,-0.03),imp(-3,5,-3,0.05),"training_ground",false,"any_time","training"),

  // ─── CULTURAL / DIVERSITY ────────────────────────────────────────────────────
  s("Several players want to observe Ramadan fasting while maintaining a training schedule.","Adapt training times to accommodate them fully.","Maintain the schedule — individual arrangements are private.",imp(-3,8,8,-0.05),imp(5,-5,-5,0.03),"training_ground",false,"any_time","training"),
  s("A new foreign signing is homesick and struggling to integrate. He's your biggest transfer.","Pair him with a senior player as a mentor.","Give him time — homesickness is natural.",imp(3,5,8,-0.03),imp(-2,2,3,0.0),"training_ground",false,"any_time","locker"),
  s("Players from different countries celebrate national holidays in incompatible ways. Scheduling clash.","Rotate training to honour each occasion.","Maintain one consistent schedule for all.",imp(-3,5,8,-0.03),imp(5,-3,-3,0.03),"training_ground",false,"any_time","training"),
  s("A player refuses to participate in a club diversity training day claiming it's 'political'.","Make the session mandatory with consequences.","Have a personal conversation to understand his view.",imp(5,-3,-5,0.03),imp(-3,3,5,-0.02),"training_ground",true,"any_time","training"),
  s("Your club is approached to host a Pride event on match day. Board is undecided.","Champion the event publicly.","Let the board make the call — stay professional.",imp(-5,10,0,-0.02),imp(5,-5,0,0.02),"board_pressure",false,"any_time","press"),

  // ─── DRESSING ROOM CULTURE EXTENDED ──────────────────────────────────────────
  s("The squad's whatsapp group leaks to the press. It contains memes about the chairman.","Protect the players — it's private banter.","Address the leak and tighten phone policy.",imp(-8,-3,-3,0.03),imp(5,0,3,-0.02),"training_ground",true,"any_time","locker"),
  s("A player runs into the dressing room during training to place a bet on your match. Staff saw it.","Report it to the FA immediately.","Handle it internally through the PFA.",imp(8,-5,-5,0.0),imp(-5,0,3,0.0),"player_ego",true,"any_time","locker"),
  s("Senior players have started an unofficial 'fines jar' for late arrivals. Junior players are uncomfortable.","Formalize it under club policy.","Shut it down — you run discipline here.",imp(-2,3,5,-0.02),imp(3,-3,-5,0.03),"training_ground",false,"any_time","locker"),
  s("A veteran player 'retires' from headers citing long-term health concerns. Games are approaching.","Support his choice and adjust tactics.","Ask for more time — have a medical team assess.",imp(3,3,-3,-0.03),imp(-2,0,3,0.02),"training_ground",true,"any_time","locker"),
  s("Two players argue loudly about who deserves more followers on social media. Squad watches.","Defuse with humour.","Remind them of their responsibilities immediately.",imp(-2,5,3,-0.02),imp(3,-3,0,0.02),"player_ego",false,"any_time","locker"),
  s("A player cries in the changing room after being dropped. Other players don't know how to react.","Speak to him privately and involve the team.","Give him space and speak to him one-on-one.",imp(0,3,8,-0.03),imp(2,0,5,-0.02),"training_ground",false,"any_time","locker"),
  s("Your squad organizes a penalty shootout tournament at training. Keeper vs outfield.","Join in as a player.","End the session — time is limited.",imp(-3,10,10,-0.03),imp(3,-3,-3,0.02),"training_ground",false,"any_time","locker"),
  s("A player finds out he's on the lowest wage in the squad and confronts you directly.","Be honest and explain the wage structure.","Direct him to the club secretary for contract talks.",imp(-5,0,-3,0.0),imp(3,0,3,-0.02),"player_ego",false,"any_time","locker"),
  s("Your squad has started ironically calling you by the name of your least favourite manager.","Laugh — it shows they're comfortable with you.","Make clear it stops now.",imp(-3,10,5,-0.02),imp(3,-5,-3,0.02),"training_ground",false,"any_time","locker"),
  s("Players are sleep-deprived because of a team hotel noisy renovation mid-week.","Move the squad to a different hotel immediately.","Get earplugs and make do with the situation.",imp(3,3,5,-0.03),imp(-3,-3,-5,0.03),"training_ground",false,"away_game","locker"),

  // ─── COMPETITION / CUP ───────────────────────────────────────────────────────
  s("You're drawn against a lower league club in the cup. Media says it's a walkover.","Field the strongest lineup to avoid embarrassment.","Rest key players — the league is the priority.",imp(2,5,-3,-0.03),imp(5,-5,5,0.03),"formation",false,"cup_match","stadium"),
  s("A cup replay has been scheduled during a crucial league run. The board wants you to win both.","Go all out in both competitions.","Prioritize the league — use the cup to blood youth.",imp(-3,5,-5,0.05),imp(5,-5,5,-0.02),"board_pressure",true,"cup_match","press"),
  s("The club hasn't won a trophy in 20 years. A cup run has the city buzzing.","Make the cup your priority this season.","Don't get distracted — stay focused on the league.",imp(-5,15,5,0.03),imp(5,-10,-5,-0.02),"board_pressure",true,"cup_match","press"),
  s("Your goalkeeper saves a penalty in a cup shootout and sprints to the opposition end to celebrate.","Let him have the moment.","Fine him for provoking opposition fans.",imp(-5,12,-3,0.05),imp(5,-5,3,-0.03),"player_ego",true,"cup_match","stadium"),
  s("You're 2-0 up in a cup final with 10 minutes left. Your captain wants to entertain.","Let them play freely.","Keep the structure — don't concede in a final.",imp(-3,10,-3,0.03),imp(5,-3,3,-0.05),"formation",false,"cup_match","stadium"),

  // ─── END OF SEASON / CONTRACTS ───────────────────────────────────────────────
  s("Five players are out of contract in 6 weeks. None have agreed renewals.","Open emergency talks with all five simultaneously.","Prioritize the two most important and let the rest go.",imp(-3,0,-5,0.0),imp(3,0,5,-0.02),"board_pressure",true,"any_time","press"),
  s("Your best player signs a pre-contract with a rival club. Season still has 12 games to go.","Drop him immediately for disloyalty.","Keep him playing — you need him for the run-in.",imp(5,-5,-10,0.05),imp(-5,5,3,-0.03),"player_ego",true,"any_time","locker"),
  s("The board offers to extend your contract by one year. Your results merit three.","Accept the one year gratefully.","Negotiate firmly for the deal you deserve.",imp(5,0,0,-0.02),imp(-5,0,0,0.03),"board_pressure",false,"any_time","press"),
  s("A player accepts terms at a rival club at midnight on the last day of the season.","Wish him well and move on.","Confront him and make clear he's burned bridges.",imp(3,-3,-8,0.0),imp(-3,0,3,0.03),"player_ego",true,"any_time","locker"),
  s("The board wants to exercise a release clause on a player you were planning to keep.","Let the business run its course.","Fight to keep him — he's central to your plans.",imp(8,-3,-5,-0.02),imp(-8,5,5,0.03),"board_pressure",true,"any_time","press"),
  s("A player rejecting your contract offer leaks the wage details to the press.","Respond through proper legal channels.","Call him out publicly for the breach of trust.",imp(-5,-5,-5,0.03),imp(-8,-3,-3,0.08),"player_ego",true,"any_time","press"),

  // ─── PRE-SEASON ──────────────────────────────────────────────────────────────
  s("A pre-season friendly finishes 6-0 and your tactical plans are broadcasted everywhere.","Brush it off — results don't matter pre-season.","Demand stricter filming restrictions at friendlies.",imp(0,0,-3,0.0),imp(2,0,0,0.02),"tactics",false,"any_time","press"),
  s("A local non-league club asks you for a pre-season friendly. Your players expect a bigger name.","Accept — community matters.","Politely decline and find a higher-quality opponent.",imp(-3,8,3,-0.02),imp(5,-5,-3,0.02),"fans",false,"any_time","press"),
  s("Pre-season training reveals a player has let his fitness drop severely over the summer.","Fine him and put him on an intensive plan.","Speak to him privately to understand what happened.",imp(3,0,-5,0.05),imp(-2,0,5,-0.03),"training_ground",false,"any_time","training"),
  s("Pre-season results have been poor. Media calls it 'warning signs'. Squad is tight.","Ignore the noise — pre-season means nothing.","Use the performances to drive urgency in training.",imp(0,-5,3,-0.02),imp(3,3,5,0.02),"press",false,"any_time","press"),
  s("A fringe player runs a 5km personal best during pre-season fitness tests. Demands recognition.","Acknowledge it publicly.","Manage expectations — fitness is baseline, not exceptional.",imp(-2,3,5,-0.02),imp(3,0,-3,0.02),"training_ground",false,"any_time","training"),

  // ─── MISCELLANEOUS / UNIQUE ──────────────────────────────────────────────────
  s("Your assistant leaves his clipboard in the opposition dug-out at halftime.","Laugh it off — retrieve it quietly.","Use it as a teaching moment about preparation.",imp(-2,5,3,-0.02),imp(2,-2,-2,0.02),"tactics",false,"halftime","stadium"),
  s("A club legend crashes your press conference uninvited with advice for the team.","Welcome him and listen.","Politely but firmly redirect proceedings.",imp(-3,8,3,-0.02),imp(3,-3,-3,0.02),"press",false,"any_time","press"),
  s("An owl lands on the pitch during a night match and refuses to leave. Play is halted.","Embrace the surreal moment with the crowd.","Pressure officials to resolve it quickly.",imp(-3,10,5,-0.02),imp(2,-3,-3,0.02),"tactics",false,"match_day","stadium"),
  s("Your goal celebration is accidentally identical to a rival manager's signature move.","Invent a new one immediately.","Keep it — maybe he copied you.",imp(-3,5,3,-0.02),imp(3,-3,-3,0.02),"press",false,"match_day","press"),
  s("A match ball boy retrieves the ball too slowly for your goalkeeper during a vital attack.","Complain formally to the fourth official.","Focus your team on the bigger picture.",imp(-2,3,-2,0.03),imp(2,-2,2,-0.02),"tactics",false,"match_day","stadium"),
  s("Local schools want to use your training pitch on weekends during the off-season.","Allow it — great community relations.","Decline — the pitch needs rest and maintenance.",imp(-3,10,0,-0.02),imp(5,-5,0,0.02),"fans",false,"any_time","press"),
  s("A player scores from his own half by accident and the crowd goes wild.","Celebrate and make him the hero.","Privately laugh but stay professional on the touchline.",imp(0,12,5,-0.02),imp(-2,8,3,-0.02),"player_ego",false,"match_day","stadium"),
  s("The stadium announcer mispronounces your name at every home game. It's become a running joke.","Correct it once and move on.","Embrace it as part of the folklore.",imp(0,5,0,-0.02),imp(-2,8,2,-0.02),"press",false,"any_time","press"),
  s("Your team sheet is submitted with an error — a player listed who isn't in the building.","Admit the clerical error and correct immediately.","Try to substitute him out at the earliest opportunity.",imp(-2,0,-2,0.0),imp(-5,-3,-5,0.03),"tactics",true,"match_day","stadium"),
  s("A sponsor offers to name the half-time whistle sound after their brand.","Accept — free revenue for the club.","Reject — ridiculous commercialization of the game.",imp(5,-5,0,-0.02),imp(-5,5,0,0.02),"board_pressure",false,"any_time","press"),
];

const cleaned = batch2.filter(sc =>
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
