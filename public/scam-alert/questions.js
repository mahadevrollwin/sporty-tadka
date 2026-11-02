// Each round picks one random question, shows its answer plus up to 8 other options
// from the SAME category only (batsman / bowler / jersey), and avoids repeating
// the previous round's question. `answer` must match a player `id`.
window.SCAM_TRIVIA = {
  players: [
    // Batsmen
    { id: "virat-kohli", name: "Virat Kohli", image: "/scam-alert/players/virat-kohli.jpg", roles: ["batsman"] },
    { id: "ms-dhoni", name: "MS Dhoni", image: "/scam-alert/players/ms-dhoni.jpg", roles: ["batsman"] },
    { id: "rohit-sharma", name: "Rohit Sharma", image: "/scam-alert/players/rohit-sharma.jpg", roles: ["batsman"] },
    { id: "shreyas-iyer", name: "Shreyas Iyer", image: "/scam-alert/players/shreyas-iyer.jpg", roles: ["batsman"] },
    { id: "ab-de-villiers", name: "AB de Villiers", image: "/scam-alert/players/ab-de-villiers.jpg", roles: ["batsman"] },
    { id: "aiden-markram", name: "Aiden Markram", image: "/scam-alert/players/aiden-markram.jpg", roles: ["batsman"] },
    { id: "babar-azam", name: "Babar Azam", image: "/scam-alert/players/babar-azam.jpg", roles: ["batsman"] },
    { id: "kane-williamson", name: "Kane Williamson", image: "/scam-alert/players/kane-williamson.jpg", roles: ["batsman"] },
    { id: "brendon-mccullum", name: "Brendon McCullum", image: "/scam-alert/players/brendon-mccullum.jpg", roles: ["batsman"] },
    { id: "steve-smith", name: "Steve Smith", image: "/scam-alert/players/steve-smith.jpg", roles: ["batsman"] },
    { id: "shai-hope", name: "Shai Hope", image: "/scam-alert/players/shai-hope.jpg", roles: ["batsman"] },
    { id: "david-warner", name: "David Warner", image: "/scam-alert/players/david-warner.jpg", roles: ["batsman"] },
    { id: "joe-root", name: "Joe Root", image: "/scam-alert/players/joe-root.jpg", roles: ["batsman"] },
    { id: "jos-buttler", name: "Jos Buttler", image: "/scam-alert/players/jos-buttler.jpg", roles: ["batsman"] },
    { id: "faf-du-plessis", name: "Faf du Plessis", image: "/scam-alert/players/faf-du-plessis.jpg", roles: ["batsman"] },
    { id: "mohammad-rizwan", name: "Mohammad Rizwan", image: "/scam-alert/players/mohammad-rizwan.jpg", roles: ["batsman"] },
    { id: "ross-taylor", name: "Ross Taylor", image: "/scam-alert/players/ross-taylor.jpg", roles: ["batsman"] },
    { id: "kevin-pietersen", name: "Kevin Pietersen", image: "/scam-alert/players/kevin-pietersen.jpg", roles: ["batsman"] },
    { id: "quinton-de-kock", name: "Quinton de Kock", image: "/scam-alert/players/quinton-de-kock.jpg", roles: ["batsman"] },
    { id: "travis-head", name: "Travis Head", image: "/scam-alert/players/travis-head.jpg", roles: ["batsman"] },

    // Bowlers
    { id: "jasprit-bumrah", name: "Jasprit Bumrah", image: "/scam-alert/players/jasprit-bumrah.jpg", roles: ["bowler"] },
    { id: "shaheen-afridi", name: "Shaheen Shah Afridi", image: "/scam-alert/players/shaheen-afridi.jpg", roles: ["bowler"] },
    { id: "mitchell-starc", name: "Mitchell Starc", image: "/scam-alert/players/mitchell-starc.jpg", roles: ["bowler"] },
    { id: "dale-steyn", name: "Dale Steyn", image: "/scam-alert/players/dale-steyn.jpg", roles: ["bowler"] },
    { id: "haris-rauf", name: "Haris Rauf", image: "/scam-alert/players/haris-rauf.jpg", roles: ["bowler"] },
    { id: "jofra-archer", name: "Jofra Archer", image: "/scam-alert/players/jofra-archer.jpg", roles: ["bowler"] },
    { id: "pat-cummins", name: "Pat Cummins", image: "/scam-alert/players/pat-cummins.jpg", roles: ["bowler"] },
    { id: "sunil-narine", name: "Sunil Narine", image: "/scam-alert/players/sunil-narine.jpg", roles: ["bowler"] },
    { id: "tim-southee", name: "Tim Southee", image: "/scam-alert/players/tim-southee.jpg", roles: ["bowler"] },
    { id: "trent-boult", name: "Trent Boult", image: "/scam-alert/players/trent-boult.jpg", roles: ["bowler"] },

    // All-rounders (valid for batsman and bowler rounds)
    { id: "dwayne-bravo", name: "Dwayne Bravo", image: "/scam-alert/players/dwayne-bravo.jpg", roles: ["batsman", "bowler"] },
    { id: "andre-russell", name: "Andre Russell", image: "/scam-alert/players/andre-russell.jpg", roles: ["batsman", "bowler"] },
    { id: "moeen-ali", name: "Moeen Ali", image: "/scam-alert/players/moeen-ali.jpg", roles: ["batsman", "bowler"] },
    { id: "kieron-pollard", name: "Kieron Pollard", image: "/scam-alert/players/kieron-pollard.jpg", roles: ["batsman", "bowler"] },

    // Jerseys
    { id: "india", name: "India", image: "/scam-alert/players/india.jpg", roles: ["jersey"] },
    { id: "australia", name: "Australia", image: "/scam-alert/players/australia.jpg", roles: ["jersey"] },
    { id: "england", name: "England", image: "/scam-alert/players/england.jpg", roles: ["jersey"] },
    { id: "csk", name: "Chennai Super Kings", image: "/scam-alert/players/csk.jpg", roles: ["jersey"] },
    { id: "kkr", name: "Kolkata Knight Riders", image: "/scam-alert/players/kkr.jpg", roles: ["jersey"] },
    { id: "rcb", name: "Royal Challengers Bengaluru", image: "/scam-alert/players/rcb.jpg", roles: ["jersey"] },
    { id: "brisbane-heat", name: "Brisbane Heat", image: "/scam-alert/players/brisbane-heat.jpg", roles: ["jersey"] },
    { id: "melbourne-renegades", name: "Melbourne Renegades", image: "/scam-alert/players/melbourne-renegades.jpg", roles: ["jersey"] },
    { id: "sydney-sixers", name: "Sydney Sixers", image: "/scam-alert/players/sydney-sixers.jpg", roles: ["jersey"] },
  ],
  questions: [
    // Kept from previous set
    { question: "Who is known as the King of Cricket?", answer: "virat-kohli", category: "batsman" },

    // Batsman rounds
    { question: "Who is known as Captain Cool?", answer: "ms-dhoni", category: "batsman" },
    { question: "Who is nicknamed the Hitman?", answer: "rohit-sharma", category: "batsman" },
    { question: "Who is known as Mr. 360?", answer: "ab-de-villiers", category: "batsman" },
    { question: "Which Australian batter is nicknamed Smudge?", answer: "steve-smith", category: "batsman" },
    { question: "Who smashed a century in the 2023 World Cup final for Australia?", answer: "travis-head", category: "batsman" },
    { question: "Which left-hand opener is nicknamed the Bull?", answer: "david-warner", category: "batsman" },
    { question: "Which England batter is nicknamed Rooty?", answer: "joe-root", category: "batsman" },
    { question: "Which England keeper-batter is nicknamed Jos?", answer: "jos-buttler", category: "batsman" },
    { question: "Who captained South Africa and later led RCB in the IPL?", answer: "faf-du-plessis", category: "batsman" },
    { question: "Which Pakistan keeper-batter is famous for his buzz cut and energy?", answer: "mohammad-rizwan", category: "batsman" },
    { question: "Which New Zealand batter was nicknamed Rosco?", answer: "ross-taylor", category: "batsman" },
    { question: "Which England batter was nicknamed KP?", answer: "kevin-pietersen", category: "batsman" },
    { question: "Which South African keeper-batter is nicknamed Quinny?", answer: "quinton-de-kock", category: "batsman" },
    { question: "Who captained India to the 2011 World Cup title as a batsman-keeper?", answer: "ms-dhoni", category: "batsman" },
    { question: "Who scored three double centuries in ODI cricket?", answer: "rohit-sharma", category: "batsman" },

    // Bowler rounds
    { question: "Which pacer was Player of the Tournament at the 2023 ODI World Cup?", answer: "jasprit-bumrah", category: "bowler" },
    { question: "Which left-arm pacer is nicknamed the Shaheen Express?", answer: "shaheen-afridi", category: "bowler" },
    { question: "Who was Player of the Tournament at the 2015 World Cup?", answer: "mitchell-starc", category: "bowler" },
    { question: "Which South African great was nicknamed Steyn Gun?", answer: "dale-steyn", category: "bowler" },
    { question: "Which Pakistan pacer is nicknamed the Lahore Express?", answer: "haris-rauf", category: "bowler" },
    { question: "Which England pacer is nicknamed the Jofra Express?", answer: "jofra-archer", category: "bowler" },
    { question: "Who captains Australia and leads their pace attack?", answer: "pat-cummins", category: "bowler" },
    { question: "Which West Indies mystery spinner is nicknamed the Magician?", answer: "sunil-narine", category: "bowler" },
    { question: "Which New Zealand pacer is famous for late swing with the new ball?", answer: "tim-southee", category: "bowler" },
    { question: "Which New Zealand left-armer is nicknamed Boultzy?", answer: "trent-boult", category: "bowler" },
    { question: "Which all-rounder is famous for the Champion celebration song?", answer: "dwayne-bravo", category: "bowler" },
    { question: "Which West Indies power-hitter is also a fierce death bowler for KKR?", answer: "andre-russell", category: "bowler" },

    // Jersey rounds
    { question: "Which team's jersey features the blue Ashoka Chakra crest?", answer: "india", category: "jersey" },
    { question: "Which team's yellow jersey has the green and gold baggy-green heritage?", answer: "australia", category: "jersey" },
    { question: "Which team's cyan jersey carries the three lions crest?", answer: "england", category: "jersey" },
    { question: "Which IPL team's jersey is famous for its yellow and blue?", answer: "csk", category: "jersey" },
    { question: "Which IPL team's purple and gold jersey belongs to the Knight Riders?", answer: "kkr", category: "jersey" },
    { question: "Which IPL team's jersey fades from navy into red with a lion crest?", answer: "rcb", category: "jersey" },
    { question: "Which BBL team's teal jersey belongs to the Heat?", answer: "brisbane-heat", category: "jersey" },
    { question: "Which BBL team's red jersey carries a big white R?", answer: "melbourne-renegades", category: "jersey" },
    { question: "Which BBL team's magenta jersey features a stylized 6?", answer: "sydney-sixers", category: "jersey" },
  ],
};
