import { useState, useEffect, useRef } from "react";

/* ============================================================
   OFF THE WALL — strength for the days between climbs
   Palette: gym-wall charcoal, chalk white, hold-colored circuits
   Day A (legs/hips) = green hold, Day B (push) = blue hold,
   Day C (posterior) = purple hold, streak = tape yellow
   ============================================================ */

const C = {
  bg: "#14181F",
  panel: "#1D242E",
  panelHi: "#242D39",
  line: "#2A3340",
  chalk: "#E8E6DF",
  dim: "#8B93A1",
  tape: "#F5C518",
  A: "#4CC38A",
  B: "#5B9BF0",
  Cc: "#A78BFA",
  danger: "#E5636F",
};

const DAY_COLORS = { A: C.A, B: C.B, C: C.Cc, D: "#F09A4A", MIN: C.tape };

// exercises that don't take a weight input (holds/planks)
const NO_WEIGHT = ["sideplank", "copenhagen", "m-plank", "d-hollow"];

/* ---------------- Guided stretch routines ---------------- */

const ST = "#5BD0D0"; // stretch cyan

// Stretch library — routines reference these by id with their own hold times.
// cue = on-screen text; voice = the longer coach script spoken at the start of the hold.
const STRETCH_LIB = {
  fold: { name: "Standing Forward Fold", side: false, fig: "fold",
    cue: "Hinge at the hips and hang heavy. Bend the knees as much as you need. Let gravity do the work.",
    voice: "Standing forward fold. Hinge at your hips and just hang. Bend your knees as much as you like — this isn't a test. With every exhale, let your head get a little heavier, and the hamstrings will open right up." },
  couch: { name: "Couch Stretch", side: true, fig: "couch",
    cue: "Rear shin up against the wall or bench, front foot planted. Squeeze the glute and stay tall. Hip flexors and quad.",
    voice: "Couch stretch. Rear shin up against the wall, front foot planted. Squeeze that back glute and lift your chest tall — you should feel it right down the front of the hip and quad. If it's loud, back off an inch and just breathe." },
  pigeon: { name: "Half Pigeon", side: true, fig: "pigeon",
    cue: "Front shin folded across, back leg long behind you. Square the hips and slowly fold forward. Settle in — this one rewards patience.",
    voice: "Half pigeon. Fold your front shin across the mat, and stretch that back leg long behind you. Square your hips, then slowly melt forward. This one rewards patience — don't force it, just wait for it." },
  butterfly: { name: "Butterfly", side: false, fig: "butterfly",
    cue: "Soles of the feet together, knees heavy toward the floor. Long spine, gentle fold. Breathe into the inner thighs.",
    voice: "Butterfly. Soles of your feet together, and let the knees fall heavy toward the floor. Sit up tall first, then fold forward gently. Send your breath into the inner thighs." },
  straddle: { name: "Seated Straddle", side: false, fig: "straddle",
    cue: "Legs wide, kneecaps pointing up. Walk the hands forward and settle in. Sink a little deeper with every exhale.",
    voice: "Seated straddle. Legs wide, kneecaps pointing at the ceiling. Walk your hands forward and settle in where it's honest work — not pain. Sink a little deeper with every exhale." },
  twist: { name: "Lying Spinal Twist", side: true, fig: "twist",
    cue: "On your back, drop the knee across the body. Both shoulders stay heavy on the floor. Look the other way.",
    voice: "Lying spinal twist. On your back, drop the knee across your body, and look the other way. Keep both shoulders heavy on the floor, and let your spine slowly unwind." },
  figure4: { name: "Supine Figure 4", side: true, fig: "figure4",
    cue: "On your back, ankle over the opposite knee, pull the bottom thigh toward you. Glutes without the knee pressure of pigeon.",
    voice: "Supine figure four. Cross the ankle over the opposite knee, and pull that bottom thigh in toward your chest. All the glute payoff of pigeon, none of the knee complaints. Flex the top foot and let your neck relax." },
  puppy: { name: "Puppy Pose", side: false, fig: "puppy",
    cue: "Knees under hips, arms walked far forward, chest melting to the floor. This is your lat stretch. Let the armpits sink.",
    voice: "Puppy pose. Knees under your hips, walk the arms way out in front, and let your chest melt toward the floor. This is your lat stretch — let the armpits sink. Climbers live here." },
  threadneedle: { name: "Thread the Needle", side: true, fig: "threadneedle",
    cue: "On all fours, slide one arm under and across, shoulder and ear to the floor. Breathe into the upper back.",
    voice: "Thread the needle. From all fours, slide one arm underneath and across, resting your shoulder and ear on the floor. Breathe into the back of the shoulder blade, and let the upper back finally let go." },
  chest: { name: "Floor Chest Opener", side: true, fig: "chest",
    cue: "Face down, arm out to the side, palm down. Slowly roll your body toward that arm and stack the legs. Deep front-of-shoulder opening.",
    voice: "Floor chest opener. Face down, one arm out to the side, palm down. Now roll your body slowly toward that arm and stack your legs. This opens deep into the front of the shoulder — go gently, it sneaks up on you." },
  doorway: { name: "Doorway Pec Stretch", side: false, fig: "doorway",
    cue: "Forearms on the door frame, elbows at shoulder height. Step through slowly until the chest opens. Breathe wide.",
    voice: "Doorway pec stretch. Forearms on the door frame, elbows at shoulder height. Step through slowly until your chest opens up. Stand proud and breathe wide." },
  crossbody: { name: "Cross-Body Shoulder", side: true, fig: "crossbody",
    cue: "Pull one arm across the chest with the other. Keep the shoulder pulled down away from the ear.",
    voice: "Cross-body shoulder stretch. Pull one arm across your chest and hug it in. Keep that shoulder pulled down, away from your ear. Easy pressure, steady breath." },
  forearm: { name: "Forearm Flexor Stretch", side: true, fig: "forearm",
    cue: "Arm straight, palm up. Pull the fingers back and down with the other hand. Pay the grip debt from the wall.",
    voice: "Forearm flexor stretch. Arm straight out, palm up, and pull the fingers back and down with your other hand. This is you paying the grip debt from the wall. Keep it gentle and constant." },
  extensor: { name: "Forearm Extensor Stretch", side: true, fig: "forearm",
    cue: "Arm straight, palm down, fingers toward the floor. Pull the back of the hand toward you. The other half of the grip debt.",
    voice: "Forearm extensor stretch. Arm straight, palm down, fingers pointing at the floor. Pull the back of your hand toward you. The other half of the grip debt — your elbows will thank you." },
  prayer: { name: "Prayer Wrist Stretch", side: false, fig: "prayer",
    cue: "Palms together at the chest, elbows wide. Slowly lower the hands until the wrists and forearms speak up.",
    voice: "Prayer stretch. Palms together at your chest, elbows out wide. Slowly lower your hands until the wrists start to speak up. Stop right there, and hold the conversation." },
  chintuck: { name: "Chin Tuck Hold", side: false, fig: "chintuck",
    cue: "Lying on your back. Draw the chin straight back — make a double chin — lengthening the back of the neck. Gentle, constant pressure. This is the forward-head fix.",
    voice: "Chin tuck hold. Lying on your back, draw your chin straight back — yes, give yourself a double chin — and feel the back of your neck get long. Gentle, constant pressure. This is the forward-head fix." },
  uppertrap: { name: "Upper Trap Stretch", side: true, fig: "uppertrap",
    cue: "Sitting tall, drop one ear toward the shoulder. Add gentle hand pressure over the top. Keep the opposite shoulder heavy.",
    voice: "Upper trap stretch. Sit up tall and drop one ear toward your shoulder. Add just the weight of your hand over the top — no yanking. Keep the opposite shoulder heavy." },
  levator: { name: "Levator Scap Stretch", side: true, fig: "uppertrap",
    cue: "Turn your nose toward one armpit and gently draw the head down and forward. Feel the back corner of the neck release.",
    voice: "Levator scap stretch. Turn your nose toward your armpit, then gently draw your head down and forward. Right in the back corner of the neck — that's the spot that hates your desk." },
  thoracic: { name: "Thoracic Extension", side: false, fig: "thoracic",
    cue: "Upper back over the edge of the bench, hands behind head. Extend backward over it and breathe. This un-hunches the desk.",
    voice: "Thoracic extension. Upper back over the edge of the bench, hands behind your head. Arch backward over it and breathe. Let every exhale buy you a little more — this un-hunches the desk." },
  wallangel: { name: "Wall Angels", side: false, fig: "wallangel",
    cue: "Back flat against the wall, arms in a goalpost. Slide slowly up and down, keeping wrists and elbows on the wall the whole hold.",
    voice: "Wall angels. Back flat against the wall, arms up in a goalpost. Slide slowly up and down, keeping wrists and elbows glued to the wall the whole time. Harder than it looks — that's the point." },
  sphinx: { name: "Sphinx Pose", side: false, fig: "sphinx",
    cue: "Face down, propped on forearms, hips heavy. Let the chest lift and the front of the body lengthen.",
    voice: "Sphinx pose. Face down, propped up on your forearms, hips staying heavy on the floor. Lift your chest and let the whole front of your body lengthen. Soft shoulders, slow breath." },
  child: { name: "Child's Pose", side: false, fig: "child",
    cue: "Knees wide, big toes together, arms long. Slow the breath all the way down.",
    voice: "Child's pose. Knees wide, big toes together, arms long out in front. There's nothing to chase here — just let your breath slow all the way down." },
};

// Routines: Pliability-style holds, ~15 min with transitions. secs is per side for bilateral stretches.
const ROUTINES = {
  lower: {
    key: "lower", name: "Lower Body", sub: "Hips, hamstrings, IT-band line",
    items: [
      { id: "fold", secs: 90 }, { id: "couch", secs: 90 }, { id: "pigeon", secs: 90 },
      { id: "butterfly", secs: 90 }, { id: "straddle", secs: 120 }, { id: "twist", secs: 60 },
    ],
  },
  upper: {
    key: "upper", name: "Upper Body", sub: "Lats, shoulders, chest, forearms",
    items: [
      { id: "puppy", secs: 90 }, { id: "threadneedle", secs: 75 }, { id: "chest", secs: 60 },
      { id: "crossbody", secs: 60 }, { id: "forearm", secs: 60 }, { id: "extensor", secs: 45 },
      { id: "child", secs: 75 },
    ],
  },
  recovery: {
    key: "recovery", name: "Climb Recovery", sub: "Post-session — forearms, lats, glutes",
    items: [
      { id: "forearm", secs: 75 }, { id: "extensor", secs: 60 }, { id: "prayer", secs: 60 },
      { id: "puppy", secs: 90 }, { id: "threadneedle", secs: 60 }, { id: "figure4", secs: 60 },
      { id: "child", secs: 75 },
    ],
  },
  posture: {
    key: "posture", name: "Posture Reset", sub: "Forward head, rounded shoulders",
    items: [
      { id: "chintuck", secs: 60 }, { id: "uppertrap", secs: 60 }, { id: "levator", secs: 60 },
      { id: "thoracic", secs: 90 }, { id: "chest", secs: 75 }, { id: "doorway", secs: 75 },
      { id: "wallangel", secs: 75 }, { id: "sphinx", secs: 75 },
    ],
  },
  quick: {
    key: "quick", name: "Quick Win", sub: "Ten minutes, biggest bang",
    items: [
      { id: "couch", secs: 60 }, { id: "fold", secs: 60 }, { id: "puppy", secs: 60 },
      { id: "doorway", secs: 60 }, { id: "forearm", secs: 45 }, { id: "twist", secs: 45 },
    ],
  },
};

// transition segments between holds: move to a new stretch vs. switch sides of the same one
const TRANSITION_SECS = 15;
const SWITCH_SECS = 10;
const GETSET_SECS = 10;

const routineQueue = (r) => {
  const holds = [];
  r.items.forEach(({ id, secs }) => {
    const s = STRETCH_LIB[id];
    if (s.side) {
      holds.push({ ...s, id, secs, label: "Left side", type: "hold" });
      holds.push({ ...s, id, secs, label: "Right side", type: "hold" });
    } else holds.push({ ...s, id, secs, label: null, type: "hold" });
  });
  const q = [];
  holds.forEach((h, i) => {
    if (i === 0) q.push({ type: "move", secs: GETSET_SECS, next: h, first: true });
    else if (h.id === holds[i - 1].id && h.label === "Right side")
      q.push({ type: "move", secs: SWITCH_SECS, next: h, switchSide: true });
    else q.push({ type: "move", secs: TRANSITION_SECS, next: h });
    q.push(h);
  });
  return q;
};
const routineMinutes = (r) =>
  Math.round(routineQueue(r).reduce((a, s) => a + s.secs, 0) / 60);

/* ---------------- Exercise data ---------------- */

const yt = (q) =>
  "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

const WORKOUTS = {
  A: {
    key: "A",
    name: "Legs & Hips",
    sub: "The IT band day",
    minutes: "~35 min",
    exercises: [
      {
        id: "cossack",
        name: "Cossack Squat",
        sets: "2 sets / side · to failure",
        diagram: "cossack",
        cues: [
          "Feet wide, toes slightly out. Shift onto one leg, sinking as deep as controlled.",
          "Other leg stays straight, heel down, toes up.",
          "Chest tall — hold a light DB goblet-style (or arms out front) as counterweight.",
          "Progress depth before load. Bottom position should feel solid on both sides.",
        ],
        link: yt("cossack squat tutorial"),
      },
      {
        id: "slrdl",
        name: "Single-Leg RDL",
        sets: "1–2 sets / side",
        diagram: "slrdl",
        cues: [
          "DB in hand opposite the standing leg.",
          "Hinge at the hip — rear leg drives back, torso and leg move as one lever.",
          "Soft knee, flat back. Feel the standing-leg hamstring and glute.",
          "Slow down the lowering; don't chase depth over balance.",
        ],
        link: yt("single leg romanian deadlift dumbbell"),
      },
      {
        id: "stepup",
        name: "Lateral Step-Up",
        sets: "1–2 sets / side",
        diagram: "stepup",
        cues: [
          "Stand beside the bench, near foot on top.",
          "Drive through the bench-side heel — no push-off from the floor leg.",
          "Control the way down (3 seconds). That eccentric is the IT-band medicine.",
          "Hold a DB in the floor-side hand for load.",
        ],
        link: yt("lateral step up glute med"),
      },
      {
        id: "hamcurl",
        name: "Monkey Feet Hamstring Curl",
        sets: "1 set / side · to failure",
        diagram: null,
        cues: [
          "Lie face-down on the bench, DB clipped into the monkey foot.",
          "Curl heel toward glute; pause 1s at the top.",
          "Lower slow — 3-second negative.",
        ],
        link: yt("monkey feet hamstring curl bench"),
      },
      {
        id: "sideplank",
        name: "Side Plank + Leg Raise",
        sets: "1 set / side · to failure",
        diagram: null,
        cues: [
          "Elbow under shoulder, body in one line.",
          "Raise the top leg 12–18\" and lower with control — this hammers glute med.",
          "Hold the plank the whole time; stop when hips sag.",
        ],
        link: yt("side plank leg raise glute medius"),
      },
    ],
  },
  B: {
    key: "B",
    name: "Push & Antagonist",
    sub: "Climber balance day",
    minutes: "~35 min",
    exercises: [
      {
        id: "bench",
        name: "DB Bench Press",
        sets: "2 sets · to failure",
        diagram: null,
        cues: [
          "Feet planted, slight arch, shoulder blades tucked.",
          "Lower to just outside the chest; press up and slightly in.",
          "Pick a weight that fails around 6–10 reps.",
        ],
        link: yt("dumbbell bench press form"),
      },
      {
        id: "ohp",
        name: "Overhead Press",
        sets: "2 sets · to failure",
        diagram: null,
        cues: [
          "Seated on the bench (back support) or standing with braced core.",
          "Press DBs to lockout without flaring ribs.",
          "Lower until DBs are at ear height.",
        ],
        link: yt("seated dumbbell overhead press"),
      },
      {
        id: "reardelt",
        name: "Rear Delt Fly",
        sets: "1–2 sets",
        diagram: null,
        cues: [
          "Hinge forward, flat back, light DBs.",
          "Raise out to the sides leading with the pinkies.",
          "Shoulder-health insurance for climbers — leave ego out of it.",
        ],
        link: yt("bent over rear delt fly dumbbell"),
      },
      {
        id: "triceps",
        name: "Overhead Triceps Extension",
        sets: "1 set · to failure",
        diagram: null,
        cues: [
          "One DB held in both hands overhead.",
          "Lower behind the head, elbows pointed forward.",
          "Full stretch at the bottom, squeeze at lockout.",
        ],
        link: yt("overhead dumbbell triceps extension"),
      },
      {
        id: "wrist",
        name: "Wrist Extensor Curl",
        sets: "1 set · light DB",
        diagram: null,
        cues: [
          "Forearm on the bench, palm down, light DB.",
          "Lift knuckles toward you, lower slow.",
          "Antagonist for gripping — cheap elbow-tendinopathy prevention.",
        ],
        link: yt("reverse wrist curl forearm extensor"),
      },
    ],
  },
  C: {
    key: "C",
    name: "Posterior & Core",
    sub: "Optional bonus day",
    minutes: "~30 min",
    exercises: [
      {
        id: "bulgarian",
        name: "Bulgarian Split Squat",
        sets: "2 sets / side",
        diagram: null,
        cues: [
          "Rear foot laces-down on the bench, front foot ~2ft ahead.",
          "Drop straight down; front knee tracks over toes.",
          "DBs at your sides. Torso slightly forward = more glute.",
        ],
        link: yt("bulgarian split squat dumbbell"),
      },
      {
        id: "hipthrust",
        name: "Hip Thrust",
        sets: "2 sets · to failure",
        diagram: "hipthrust",
        cues: [
          "Upper back on the bench, DB across the hips.",
          "Drive through heels to full hip lockout; chin tucked.",
          "Squeeze 1s at the top; ribs down.",
        ],
        link: yt("dumbbell hip thrust bench"),
      },
      {
        id: "legraise",
        name: "Monkey Feet Reverse Hyper / Leg Raise",
        sets: "1 set",
        diagram: null,
        cues: [
          "Face-down on the bench, legs off the end, light DB in monkey foot.",
          "Raise legs to bench height using glutes and low back — no swinging.",
          "Slow lowering each rep.",
        ],
        link: yt("bench reverse hyperextension bodyweight"),
      },
      {
        id: "copenhagen",
        name: "Copenhagen Plank",
        sets: "1 set / side · to failure",
        diagram: "copenhagen",
        cues: [
          "Side plank with the top foot or knee on the bench.",
          "Lift hips so body makes a straight line — the inner thigh holds you up.",
          "Adductor strength that pairs directly with your Cossacks.",
        ],
        link: yt("copenhagen plank tutorial"),
      },
    ],
  },
  D: {
    key: "D",
    name: "Core",
    sub: "Optional six-pack day",
    minutes: "~25 min",
    exercises: [
      {
        id: "d-crunch",
        name: "Weighted Crunch",
        sets: "2 sets · to failure",
        diagram: null,
        cues: [
          "Lie on the floor, knees bent, DB held against your chest.",
          "Curl your ribs toward your pelvis — it's a short range, not a sit-up.",
          "Pause 1s at the top, lower slow. Add weight over time like any other lift.",
        ],
        link: yt("weighted crunch dumbbell form"),
      },
      {
        id: "d-revcrunch",
        name: "Reverse Crunch",
        sets: "2 sets · to failure",
        diagram: null,
        cues: [
          "Lie on the bench, hands gripping behind your head for anchor.",
          "Knees to chest, then curl your hips up off the bench — pelvis does the moving.",
          "Lower legs slowly without arching your low back. Hits the lower abs.",
        ],
        link: yt("reverse crunch on bench"),
      },
      {
        id: "d-sidebend",
        name: "DB Side Bend",
        sets: "1–2 sets / side",
        diagram: null,
        cues: [
          "One heavy DB at your side, other hand behind your head.",
          "Bend sideways toward the DB, then pull yourself back up with the opposite oblique.",
          "Strict and slow — no leaning forward or back.",
        ],
        link: yt("dumbbell side bend obliques"),
      },
      {
        id: "d-tuck",
        name: "Seated Knee Tuck",
        sets: "1–2 sets · to failure",
        diagram: null,
        cues: [
          "Sit on the edge of the bench, lean back, grip the sides.",
          "Extend legs out, then pull knees to chest.",
          "Add the monkey feet with a light DB when bodyweight gets easy.",
        ],
        link: yt("seated knee tuck bench"),
      },
      {
        id: "d-hollow",
        name: "Hollow Hold",
        sets: "1 set · to failure",
        diagram: null,
        cues: [
          "On your back, low back pressed into the floor, arms and legs extended.",
          "Hold the banana shape until you shake. Great carryover to body tension on the wall.",
        ],
        link: yt("hollow body hold tutorial"),
      },
    ],
  },
  MIN: {
    key: "MIN",
    name: "The Micro",
    sub: "12-minute fallback — still counts",
    minutes: "~12 min",
    exercises: [
      {
        id: "m-cossack",
        name: "Cossack Squat",
        sets: "1 set / side",
        diagram: "cossack",
        cues: ["Bodyweight or light goblet. Quality reps only."],
        link: yt("cossack squat tutorial"),
      },
      {
        id: "m-press",
        name: "DB Bench or Overhead Press",
        sets: "1 set · to failure",
        diagram: null,
        cues: ["One hard set. That's it."],
        link: yt("dumbbell bench press form"),
      },
      {
        id: "m-plank",
        name: "Side Plank + Leg Raise",
        sets: "1 set / side",
        diagram: null,
        cues: ["Finish with glute med. Done in 12 minutes."],
        link: yt("side plank leg raise glute medius"),
      },
    ],
  },
};

/* ---------------- Stick-figure diagrams ---------------- */

function Figure({ kind }) {
  const s = { stroke: C.chalk, strokeWidth: 2.5, fill: "none", strokeLinecap: "round" };
  const db = (x, y) => (
    <g>
      <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke={C.tape} strokeWidth="3" />
      <circle cx={x - 6} cy={y} r="3" fill={C.tape} />
      <circle cx={x + 6} cy={y} r="3" fill={C.tape} />
    </g>
  );
  let body = null;
  if (kind === "cossack")
    body = (
      <g {...s}>
        <circle cx="38" cy="16" r="7" />
        <path d="M38 23 L40 42" />
        <path d="M40 42 L28 56 L30 70" />
        <path d="M40 42 L88 66" />
        <path d="M38 28 L58 32" />
        {db(62, 32)}
        <line x1="10" y1="71" x2="110" y2="71" stroke={C.line} strokeWidth="2" />
      </g>
    );
  if (kind === "slrdl")
    body = (
      <g {...s}>
        <circle cx="28" cy="26" r="7" />
        <path d="M34 30 L58 42" />
        <path d="M58 42 L60 70" />
        <path d="M58 42 L92 28" />
        <path d="M40 33 L38 54" />
        {db(38, 58)}
        <line x1="10" y1="71" x2="110" y2="71" stroke={C.line} strokeWidth="2" />
      </g>
    );
  if (kind === "stepup")
    body = (
      <g {...s}>
        <rect x="64" y="48" width="42" height="22" rx="2" stroke={C.dim} />
        <circle cx="46" cy="10" r="7" />
        <path d="M46 17 L46 38" />
        <path d="M46 38 L44 70" />
        <path d="M46 38 L66 48" />
        <path d="M46 24 L34 44" />
        {db(34, 48)}
        <line x1="6" y1="71" x2="62" y2="71" stroke={C.line} strokeWidth="2" />
      </g>
    );
  if (kind === "hipthrust")
    body = (
      <g {...s}>
        <rect x="8" y="34" width="24" height="22" rx="2" stroke={C.dim} />
        <circle cx="22" cy="24" r="7" />
        <path d="M30 34 L64 38" />
        <path d="M64 38 L74 54 L76 70" />
        {db(58, 32)}
        <line x1="6" y1="71" x2="112" y2="71" stroke={C.line} strokeWidth="2" />
      </g>
    );
  if (kind === "copenhagen")
    body = (
      <g {...s}>
        <rect x="82" y="42" width="30" height="16" rx="2" stroke={C.dim} />
        <circle cx="20" cy="42" r="7" />
        <path d="M26 47 L86 46" />
        <path d="M20 50 L20 66" />
        <line x1="6" y1="67" x2="78" y2="67" stroke={C.line} strokeWidth="2" />
      </g>
    );
  if (!body) return null;
  return (
    <svg viewBox="0 0 118 76" style={{ width: "100%", maxWidth: 190, display: "block" }}>
      {body}
    </svg>
  );
}

/* ---------------- Stretch figures ---------------- */

function StretchFigure({ kind }) {
  const s = { stroke: C.chalk, strokeWidth: 2.5, fill: "none", strokeLinecap: "round" };
  const floor = <line x1="8" y1="70" x2="112" y2="70" stroke={C.line} strokeWidth="2" />;
  let body = null;
  if (kind === "fold")
    body = (<g {...s}>{floor}<path d="M60 70 L58 40" /><path d="M58 40 Q54 22 42 26" /><circle cx="40" cy="32" r="6" /><path d="M52 30 L56 62" /></g>);
  if (kind === "couch")
    body = (<g {...s}>{floor}<line x1="104" y1="14" x2="104" y2="70" stroke={C.dim} strokeWidth="3" /><circle cx="50" cy="16" r="7" /><path d="M50 23 L56 46" /><path d="M56 46 L34 52 L30 70" /><path d="M56 46 L84 60 L102 46" /><path d="M50 30 L42 48" /></g>);
  if (kind === "pigeon")
    body = (<g {...s}>{floor}<circle cx="44" cy="22" r="7" /><path d="M44 29 L48 52" /><path d="M34 62 Q48 54 60 62" /><path d="M52 58 L98 66" /><path d="M46 36 L34 56" /></g>);
  if (kind === "ninety")
    body = (<g {...s}>{floor}<circle cx="56" cy="18" r="7" /><path d="M56 25 L56 50" /><path d="M56 52 L34 56 L30 68" /><path d="M56 52 L80 58 L94 54" /><path d="M56 34 L44 50" /></g>);
  if (kind === "butterfly")
    body = (<g {...s}>{floor}<circle cx="60" cy="18" r="7" /><path d="M60 25 L60 50" /><path d="M60 52 L36 58 L58 66" /><path d="M60 52 L84 58 L62 66" /><path d="M60 34 L48 58" /><path d="M60 34 L72 58" /></g>);
  if (kind === "straddle")
    body = (<g {...s}>{floor}<circle cx="48" cy="22" r="7" /><path d="M50 29 L56 50" /><path d="M56 52 L96 64" /><path d="M56 52 L20 64" /><path d="M52 36 L70 56" /></g>);
  if (kind === "twist")
    body = (<g {...s}>{floor}<circle cx="20" cy="62" r="7" /><path d="M27 62 L64 62" /><path d="M64 62 L74 44 L90 48" /><path d="M30 58 L44 50" /></g>);
  if (kind === "puppy")
    body = (<g {...s}>{floor}<circle cx="26" cy="48" r="6" /><path d="M32 52 Q48 44 62 52" /><path d="M62 52 L66 70" /><path d="M30 54 L10 66" /></g>);
  if (kind === "chest")
    body = (<g {...s}>{floor}<circle cx="24" cy="64" r="6" /><path d="M30 64 L92 64" /><path d="M44 64 L44 44" /><path d="M46 50 L46 64" /></g>);
  if (kind === "forearm")
    body = (<g {...s}><circle cx="26" cy="30" r="8" /><path d="M26 38 L26 62" /><path d="M26 44 L74 44" /><path d="M74 44 Q84 40 82 32" /><path d="M60 58 L80 40" stroke={C.tape} /></g>);
  if (kind === "figure4")
    body = (<g {...s}>{floor}<circle cx="18" cy="60" r="6" /><path d="M24 60 L56 58" /><path d="M56 58 L66 44 L60 34" /><path d="M56 58 L74 50 L64 42" /><path d="M34 56 L58 48" stroke={C.tape} /></g>);
  if (kind === "threadneedle")
    body = (<g {...s}>{floor}<circle cx="34" cy="52" r="6" /><path d="M40 54 Q56 44 68 52" /><path d="M68 52 L70 70" /><path d="M44 56 L74 62" stroke={C.tape} /><path d="M38 56 L30 70" /></g>);
  if (kind === "prayer")
    body = (<g {...s}><circle cx="60" cy="16" r="8" /><path d="M60 24 L60 56" /><path d="M60 34 L44 42 L54 48" /><path d="M60 34 L76 42 L66 48" /><path d="M54 44 L66 44" stroke={C.tape} strokeWidth="4" /></g>);
  if (kind === "chintuck")
    body = (<g {...s}>{floor}<path d="M20 64 L96 64" /><circle cx="24" cy="60" r="7" /><path d="M28 54 L20 54" stroke={C.tape} /><path d="M96 64 L104 52" /></g>);
  if (kind === "uppertrap")
    body = (<g {...s}>{floor}<circle cx="58" cy="20" r="7" transform="rotate(-18 58 20)" /><path d="M60 27 L60 54" /><path d="M60 54 L44 58 L40 70" /><path d="M60 54 L78 58 L84 70" /><path d="M60 34 L78 30 Q84 24 66 16" stroke={C.tape} /></g>);
  if (kind === "thoracic")
    body = (<g {...s}>{floor}<rect x="10" y="42" width="34" height="28" rx="2" stroke={C.dim} /><path d="M44 46 Q58 34 70 44" /><circle cx="76" cy="50" r="7" /><path d="M48 46 L28 40" /><path d="M52 50 L60 70" /></g>);
  if (kind === "doorway")
    body = (<g {...s}>{floor}<line x1="30" y1="8" x2="30" y2="70" stroke={C.dim} strokeWidth="3" /><line x1="90" y1="8" x2="90" y2="70" stroke={C.dim} strokeWidth="3" /><circle cx="60" cy="20" r="7" /><path d="M60 27 L58 52" /><path d="M58 52 L52 70" /><path d="M58 52 L68 70" /><path d="M60 32 L34 28" stroke={C.tape} /><path d="M60 32 L86 28" stroke={C.tape} /></g>);
  if (kind === "wallangel")
    body = (<g {...s}>{floor}<line x1="86" y1="8" x2="86" y2="70" stroke={C.dim} strokeWidth="3" /><circle cx="80" cy="18" r="7" /><path d="M80 25 L82 52" /><path d="M82 52 L78 70" /><path d="M80 32 L64 30 L62 16" stroke={C.tape} /></g>);
  if (kind === "sphinx")
    body = (<g {...s}>{floor}<circle cx="26" cy="34" r="7" /><path d="M30 40 Q52 52 96 62" /><path d="M30 44 L30 62" /><path d="M34 44 L38 62" /></g>);
  if (kind === "crossbody")
    body = (<g {...s}>{floor}<circle cx="58" cy="16" r="7" /><path d="M58 23 L58 52" /><path d="M58 52 L48 70" /><path d="M58 52 L68 70" /><path d="M58 30 L82 34" stroke={C.tape} /><path d="M58 34 L74 32" /></g>);
  if (kind === "child")
    body = (<g {...s}>{floor}<circle cx="80" cy="52" r="6" /><path d="M74 56 Q56 46 44 56" /><path d="M44 56 L44 70" /><path d="M76 58 L100 66" /></g>);
  if (!body) return null;
  return (
    <svg viewBox="0 0 120 76" style={{ width: "100%", maxWidth: 220, display: "block", margin: "0 auto" }}>
      {body}
    </svg>
  );
}

/* ---------------- Guided stretch player ---------------- */

function speak(text, enabled) {
  if (!enabled) return;
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  } catch (e) {}
}

let audioCtx = null;
function getCtx() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function chime() {
  try {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 660;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    o.start();
    o.stop(ctx.currentTime + 0.7);
  } catch (e) {}
}
// one synthesized drum hit — a sine wave whose pitch drops fast, like a soft floor tom
function drumHit(delay, f0, f1, dur, vol) {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.7);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t);
    o.stop(t + dur);
  } catch (e) {}
}
// heartbeat double-thump — 30 seconds left in the hold
function warnDrum() {
  drumHit(0, 130, 45, 0.4, 0.5);
  drumHit(0.45, 130, 45, 0.4, 0.35);
}
// rising three-hit roll — hold complete
function endDrum() {
  drumHit(0, 110, 40, 0.35, 0.5);
  drumHit(0.28, 160, 60, 0.3, 0.45);
  drumHit(0.56, 220, 85, 0.45, 0.4);
}

function StretchPlayer({ routine, onFinish, onExit }) {
  const queue = useRef(routineQueue(routine)).current;
  const mins = routineMinutes(routine);
  const [qi, setQi] = useState(-1); // -1 = ready screen
  const [left, setLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [voice, setVoice] = useState(true);
  const [doneFlag, setDoneFlag] = useState(false);
  const wakeRef = useRef(null);
  const voiceRef = useRef(true);
  voiceRef.current = voice;

  const cur = qi >= 0 && qi < queue.length ? queue[qi] : null;

  // spoken intro for a transition segment
  const introFor = (seg) => {
    const h = seg.next;
    const side = h.label ? ", " + h.label.toLowerCase() : "";
    if (seg.first) return `First up: ${h.name}${side}. Get set.`;
    if (seg.switchSide) return `Nice. Switch sides — ${h.name}${side}.`;
    return `Nice work. Shake it out. Coming up: ${h.name}${side}.`;
  };

  const enterSeg = (i) => {
    const seg = queue[i];
    if (seg.type === "move") speak(introFor(seg), voiceRef.current);
    else speak(seg.voice || seg.cue, voiceRef.current);
  };

  const start = async () => {
    try {
      if (navigator.wakeLock) wakeRef.current = await navigator.wakeLock.request("screen");
    } catch (e) {}
    chime();
    setQi(0);
    setLeft(queue[0].secs);
    enterSeg(0);
  };

  // countdown
  useEffect(() => {
    if (qi < 0 || paused || doneFlag) return;
    const t = setInterval(() => {
      setLeft((l) => {
        const seg = queue[qi];
        if (seg.type === "hold" && l === 31 && seg.secs > 40) warnDrum();
        if (seg.type === "hold" && l === 11) speak("Ten seconds", voiceRef.current);
        if (l <= 1) {
          if (seg.type === "hold") endDrum();
          const next = qi + 1;
          if (next >= queue.length) {
            speak("Session complete. Nice work.", voiceRef.current);
            setDoneFlag(true);
            return 0;
          }
          setQi(next);
          enterSeg(next);
          return queue[next].secs;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [qi, paused, doneFlag]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      try { wakeRef.current && wakeRef.current.release(); } catch (e) {}
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    };
  }, []);

  // skip jumps between holds, stepping over transition segments
  const skip = (dir) => {
    let i = qi + dir;
    while (i >= 0 && i < queue.length && queue[i].type !== "hold") i += dir;
    if (i < 0 || i >= queue.length) return;
    setQi(i);
    setLeft(queue[i].secs);
    enterSeg(i);
  };

  const totalDone = queue.slice(0, Math.max(qi, 0)).reduce((a, s) => a + s.secs, 0) + (cur ? cur.secs - left : 0);
  const totalAll = queue.reduce((a, s) => a + s.secs, 0);

  if (doneFlag)
    return (
      <div className="sp-wrap">
        <div className="sp-done">
          <div className="sp-done-title">Session complete</div>
          <p style={{ color: C.dim, marginTop: 10 }}>{mins} minutes of slow holds banked.</p>
          <button className="finish" style={{ background: ST, color: C.bg, marginTop: 24 }} onClick={onFinish}>
            Log it
          </button>
        </div>
      </div>
    );

  if (qi === -1)
    return (
      <div className="sp-wrap">
        <button className="back" onClick={onExit}>← back</button>
        <div className="sp-ready">
          <div className="dc-name" style={{ color: ST, fontSize: 26 }}>{routine.name}</div>
          <p style={{ color: C.dim, marginTop: 8, fontSize: 14.5, lineHeight: 1.5 }}>
            {routine.sub}. {mins} minutes · {routine.items.length} stretches · guided holds with
            transition breaks between them. Voice coaches you through each one — no need to look
            at the screen. Find some floor.
          </p>
          <label className="voice-toggle">
            <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
            Voice guidance
          </label>
          <button className="finish" style={{ background: ST, color: C.bg, marginTop: 20 }} onClick={start}>
            Press play
          </button>
        </div>
      </div>
    );

  const isMove = cur.type === "move";
  const show = isMove ? cur.next : cur; // during a transition, preview the upcoming stretch
  const nextHold = queue.slice(qi + 1).find((s) => s.type === "hold");
  const hasPrevHold = queue.slice(0, qi).some((s) => s.type === "hold");

  return (
    <div className="sp-wrap">
      <div className="sp-progress">
        <div className="sp-bar" style={{ width: `${(totalDone / totalAll) * 100}%`, background: ST }} />
      </div>
      <div className="sp-count" style={{ color: isMove ? C.dim : ST }}>{left}</div>
      {isMove && (
        <div className="sp-side" style={{ color: C.tape }}>
          {cur.switchSide ? "switch sides" : "get set — up next"}
        </div>
      )}
      <div className="sp-name">{show.name}</div>
      {show.label && <div className="sp-side" style={{ color: ST }}>{show.label}</div>}
      <div className="sp-fig"><StretchFigure kind={show.fig} /></div>
      <div className="sp-cue">{show.cue}</div>
      <div className={"sp-breathe" + (paused || isMove ? " still" : "")}>
        {isMove ? "move into position" : "breathe slow — long exhales"}
      </div>
      <div className="sp-controls">
        <button className="ghost" onClick={() => skip(-1)} disabled={!hasPrevHold}>‹ prev</button>
        <button className="ghost sp-pause" onClick={() => setPaused(!paused)}>{paused ? "resume" : "pause"}</button>
        <button className="ghost" onClick={() => skip(1)} disabled={!nextHold}>next ›</button>
      </div>
      <div className="sp-upnext">
        {isMove
          ? `${show.secs}s hold`
          : nextHold
          ? `up next: ${nextHold.name}${nextHold.label ? " — " + nextHold.label.toLowerCase() : ""}`
          : "last one"}
      </div>
      <button className="back" style={{ marginTop: 18 }} onClick={onExit}>exit (nothing saved)</button>
    </div>
  );
}

/* ---------------- Date / streak helpers ---------------- */

const dayKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
};

// Monday of the week containing d
function weekStart(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const dow = (dt.getDay() + 6) % 7; // Mon=0
  dt.setDate(dt.getDate() - dow);
  return dt;
}
const weekKey = (d) => dayKey(weekStart(d));

function sessionsByWeek(sessions) {
  const map = {};
  sessions.forEach((s) => {
    const k = weekKey(new Date(s.date));
    map[k] = (map[k] || 0) + 1;
  });
  return map;
}

// Streak: consecutive weeks with >= 2 sessions, counting back from
// this week (if it already has 2) or last week.
function computeStreak(sessions) {
  const byWeek = sessionsByWeek(sessions);
  const GOAL = 2;
  let cursor = weekStart(new Date());
  let streak = 0;
  if ((byWeek[dayKey(cursor)] || 0) >= GOAL) {
    streak++;
  }
  // walk backwards from last week regardless
  while (true) {
    cursor = new Date(cursor.getTime() - 7 * 86400000);
    if ((byWeek[dayKey(cursor)] || 0) >= GOAL) streak++;
    else break;
  }
  return streak;
}

/* ---------------- Badges ---------------- */

const BADGES = [
  { id: "first", name: "First Ascent", desc: "Complete your first session", check: (s) => s.length >= 1 },
  { id: "week2", name: "Back for More", desc: "2 sessions in one week", check: (s) => Object.values(sessionsByWeek(s)).some((n) => n >= 2) },
  {
    id: "circuit",
    name: "Full Circuit",
    desc: "Days A, B and C in one week",
    check: (s) => {
      const wk = {};
      s.forEach((x) => {
        const k = weekKey(new Date(x.date));
        wk[k] = wk[k] || new Set();
        wk[k].add(x.day);
      });
      return Object.values(wk).some((set) => set.has("A") && set.has("B") && set.has("C"));
    },
  },
  { id: "streak3", name: "Chalk Streak · 3", desc: "3-week streak", check: (s) => computeStreak(s) >= 3 },
  { id: "streak6", name: "Chalk Streak · 6", desc: "6-week streak", check: (s) => computeStreak(s) >= 6 },
  { id: "streak12", name: "Chalk Streak · 12", desc: "12-week streak", check: (s) => computeStreak(s) >= 12 },
  { id: "ten", name: "Double Digits", desc: "10 total sessions", check: (s) => s.length >= 10 },
  { id: "twentyfive", name: "Quarter Century", desc: "25 total sessions", check: (s) => s.length >= 25 },
  { id: "fifty", name: "The Fifty", desc: "50 total sessions", check: (s) => s.length >= 50 },
  { id: "cossack10", name: "Cossack Crusher", desc: "10 Leg & Hip days", check: (s) => s.filter((x) => x.day === "A").length >= 10 },
  { id: "push10", name: "Iron Antagonist", desc: "10 Push days", check: (s) => s.filter((x) => x.day === "B").length >= 10 },
  { id: "core10", name: "Core Values", desc: "10 Core days", check: (s) => s.filter((x) => x.day === "D").length >= 10 },
  { id: "firstfold", name: "First Fold", desc: "Complete a guided stretch", check: (s, st) => (st || []).length >= 1 },
  { id: "rubberband", name: "Rubber Band", desc: "5 stretches in one week", check: (s, st) => {
      const wk = {};
      (st || []).forEach((x) => { const k = weekKey(new Date(x.date)); wk[k] = (wk[k] || 0) + 1; });
      return Object.values(wk).some((n) => n >= 5);
    } },
  { id: "pliable", name: "Pliable", desc: "30 total stretch sessions", check: (s, st) => (st || []).length >= 30 },
  { id: "wellrounded", name: "Well Rounded", desc: "Complete all 5 routines", check: (s, st) => new Set((st || []).map((x) => x.routine).filter(Boolean)).size >= 5 },
  { id: "unhunched", name: "Un-Hunched", desc: "10 Posture Resets", check: (s, st) => (st || []).filter((x) => x.routine === "posture").length >= 10 },
  { id: "micro", name: "Something > Nothing", desc: "Log a Micro session on a busy day", check: (s) => s.some((x) => x.day === "MIN") },
];

/* ---------------- Storage ---------------- */

const STORE_KEY = "otw-data-v1";

async function loadData() {
  try {
    const r = localStorage.getItem(STORE_KEY);
    if (r) return JSON.parse(r);
  } catch (e) {
    /* first run — no data yet */
  }
  return { sessions: [], badges: {}, stretches: [] };
}

async function saveData(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("save failed", e);
  }
}

/* ---------------- Rest timer ---------------- */

function RestTimer({ color }) {
  const [left, setLeft] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      clearInterval(ref.current);
      return;
    }
    ref.current = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(ref.current);
  }, [left === null, left <= 0]);
  const start = (sec) => setLeft(sec);
  if (left !== null && left > 0)
    return (
      <div className="timer-live" style={{ borderColor: color }}>
        <span style={{ color, fontFamily: "var(--mono)" }}>
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </span>
        <button className="ghost" onClick={() => setLeft(null)}>
          cancel
        </button>
      </div>
    );
  if (left === 0)
    return (
      <div className="timer-live done" style={{ borderColor: color }}>
        <span style={{ color }}>Rest done — go.</span>
        <button className="ghost" onClick={() => setLeft(null)}>
          reset
        </button>
      </div>
    );
  return (
    <div className="timer-row">
      <span className="timer-label">Rest timer</span>
      <button className="ghost" onClick={() => start(90)}>90s</button>
      <button className="ghost" onClick={() => start(150)}>2:30</button>
    </div>
  );
}

/* ---------------- The Wall (streak signature) ---------------- */

function StreakWall({ sessions }) {
  const recent = sessions.slice(-14);
  const holds = recent.map((s, i) => {
    const col = i % 2 === 0 ? 30 : 70;
    const y = 210 - i * 15;
    return { x: col + ((i * 13) % 20) - 10, y, color: DAY_COLORS[s.day] || C.tape, day: s.day };
  });
  return (
    <svg viewBox="0 0 100 230" style={{ width: "100%", maxWidth: 150, display: "block", margin: "0 auto" }}>
      <rect x="4" y="4" width="92" height="222" rx="6" fill={C.panelHi} stroke={C.line} />
      {[40, 90, 140, 190].map((y) => (
        <line key={y} x1="4" y1={y} x2="96" y2={y} stroke={C.line} strokeWidth="1" strokeDasharray="3 5" />
      ))}
      {holds.map((h, i) => (
        <g key={i}>
          {i > 0 && (
            <line x1={holds[i - 1].x} y1={holds[i - 1].y} x2={h.x} y2={h.y} stroke={C.line} strokeWidth="1.5" />
          )}
          <path
            d={`M ${h.x - 6} ${h.y + 3} Q ${h.x} ${h.y - 8} ${h.x + 6} ${h.y + 3} Q ${h.x} ${h.y + 7} ${h.x - 6} ${h.y + 3} Z`}
            fill={h.color}
          />
        </g>
      ))}
      {holds.length === 0 && (
        <text x="50" y="120" textAnchor="middle" fill={C.dim} fontSize="9" fontFamily="var(--body)">
          your route starts here
        </text>
      )}
    </svg>
  );
}

/* ---------------- Heatmap ---------------- */

function Heatmap({ sessions }) {
  const byDay = {};
  sessions.forEach((s) => {
    const k = dayKey(new Date(s.date));
    byDay[k] = byDay[k] ? byDay[k] : s.day;
  });
  const weeks = [];
  const thisMon = weekStart(new Date());
  for (let w = 11; w >= 0; w--) {
    const mon = new Date(thisMon.getTime() - w * 7 * 86400000);
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(mon.getTime() + d * 86400000);
      days.push({ key: dayKey(dt), day: byDay[dayKey(dt)], future: dt > new Date() });
    }
    weeks.push(days);
  }
  return (
    <div className="heatmap">
      {weeks.map((wk, i) => (
        <div key={i} className="hm-col">
          {wk.map((d) => (
            <div
              key={d.key}
              className="hm-cell"
              title={d.key}
              style={{
                background: d.day ? DAY_COLORS[d.day] : d.future ? "transparent" : C.panelHi,
                border: d.future ? `1px dashed ${C.line}` : "none",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Exercise card ---------------- */

function ExerciseCard({ ex, color, done, onToggle, weight, reps, lastWeight, lastReps, onWeight, onReps }) {
  const [open, setOpen] = useState(false);
  const takesWeight = !NO_WEIGHT.includes(ex.id);
  const lastLine = lastWeight && lastReps
    ? `${lastWeight} lb × ${lastReps}`
    : lastWeight
    ? `${lastWeight} lb`
    : lastReps
    ? `${lastReps} reps`
    : null;
  return (
    <div className={"ex-card" + (done ? " done" : "")}>
      <div className="ex-head">
        <button
          className="check"
          onClick={onToggle}
          aria-label={done ? "Mark incomplete" : "Mark complete"}
          style={{ borderColor: done ? color : C.line, background: done ? color : "transparent" }}
        >
          {done && (
            <svg viewBox="0 0 12 12" width="12" height="12">
              <path d="M2 6.5 L5 9 L10 3" stroke={C.bg} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <div className="ex-title" onClick={() => setOpen(!open)}>
          <div className="ex-name">{ex.name}</div>
          <div className="ex-sets">
            {ex.sets}
            {lastLine ? <span className="last-wt"> · last: {lastLine}</span> : null}
          </div>
        </div>
        <div className="wt-wrap">
          {takesWeight && (
            <input
              className="wt"
              type="number"
              inputMode="decimal"
              min="0"
              placeholder={lastWeight || "lb"}
              value={weight || ""}
              onChange={(e) => onWeight(e.target.value)}
              aria-label={`Weight used for ${ex.name} in pounds`}
            />
          )}
          <input
            className="wt"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder={lastReps || "reps"}
            value={reps || ""}
            onChange={(e) => onReps(e.target.value)}
            aria-label={`Reps completed for ${ex.name}`}
          />
        </div>
        <button className="how" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "close" : "how?"}
        </button>
      </div>
      {open && (
        <div className="ex-body">
          {ex.diagram && (
            <div className="ex-fig">
              <Figure kind={ex.diagram} />
            </div>
          )}
          <ul>
            {ex.cues.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <a href={ex.link} target="_blank" rel="noreferrer" style={{ color }}>
            Watch a demo ↗
          </a>
        </div>
      )}
    </div>
  );
}

/* ---------------- Main app ---------------- */

export default function OffTheWall() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("home"); // home | session | progress
  const [activeDay, setActiveDay] = useState(null);
  const [checked, setChecked] = useState({});
  const [weights, setWeights] = useState({});
  const [repsIn, setRepsIn] = useState({});
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [newBadges, setNewBadges] = useState([]);

  useEffect(() => {
    loadData().then(setData);
  }, []);

  if (!data)
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "grid", placeItems: "center", color: C.dim, fontFamily: "system-ui" }}>
        chalking up…
      </div>
    );

  const sessions = data.sessions;
  const stretches = data.stretches || [];
  const streak = computeStreak(sessions);
  const thisWeekCount = sessions.filter((s) => weekKey(new Date(s.date)) === weekKey(new Date())).length;
  const stretchWeek = stretches.filter((s) => weekKey(new Date(s.date)) === weekKey(new Date())).length;
  const earnedCount = Object.keys(data.badges).length;

  const startSession = (dayKey) => {
    setActiveDay(dayKey);
    setChecked({});
    setWeights({});
    setRepsIn({});
    setView("session");
  };

  const finishSession = async () => {
    // keep only weights/reps for exercises that were actually checked off
    const usedWeights = {};
    Object.entries(weights).forEach(([id, w]) => {
      if (checked[id] && w) usedWeights[id] = w;
    });
    const usedReps = {};
    Object.entries(repsIn).forEach(([id, r]) => {
      if (checked[id] && r) usedReps[id] = r;
    });
    const session = { date: new Date().toISOString(), day: activeDay, weights: usedWeights, reps: usedReps };
    const next = {
      ...data,
      sessions: [...sessions, session],
      lastWeights: { ...(data.lastWeights || {}), ...usedWeights },
      lastReps: { ...(data.lastReps || {}), ...usedReps },
    };
    const fresh = [];
    BADGES.forEach((b) => {
      if (!next.badges[b.id] && b.check(next.sessions, next.stretches || [])) {
        next.badges[b.id] = new Date().toISOString();
        fresh.push(b);
      }
    });
    setData(next);
    setNewBadges(fresh);
    await saveData(next);
    setView("home");
    setActiveDay(null);
  };

  const finishStretch = async () => {
    const next = { ...data, stretches: [...(data.stretches || []), { date: new Date().toISOString(), routine: activeRoutine }] };
    const fresh = [];
    BADGES.forEach((b) => {
      if (!next.badges[b.id] && b.check(next.sessions, next.stretches)) {
        next.badges[b.id] = new Date().toISOString();
        fresh.push(b);
      }
    });
    setData(next);
    setNewBadges(fresh);
    await saveData(next);
    setView("home");
  };

  const wk = activeDay ? WORKOUTS[activeDay] : null;
  const allChecked = wk && wk.exercises.every((e) => checked[e.id]);
  const anyChecked = wk && wk.exercises.some((e) => checked[e.id]);

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap');
        :root { --display:'Barlow Condensed',system-ui,sans-serif; --body:'Barlow',system-ui,sans-serif; --mono:ui-monospace,'SF Mono',Menlo,monospace; }
        * { box-sizing:border-box; margin:0; }
        .app { background:${C.bg}; min-height:100vh; color:${C.chalk}; font-family:var(--body); padding:20px 16px 48px; }
        .shell { max-width:520px; margin:0 auto; }
        .brand { font-family:var(--display); font-weight:700; font-size:30px; letter-spacing:.04em; text-transform:uppercase; line-height:1; }
        .brand .off { color:${C.tape}; }
        .tag { color:${C.dim}; font-size:13px; margin-top:4px; }
        nav { display:flex; gap:8px; margin:20px 0 4px; }
        nav button { flex:1; background:${C.panel}; border:1px solid ${C.line}; color:${C.dim}; padding:9px 0; border-radius:8px; font-family:var(--display); font-size:15px; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; }
        nav button.on { color:${C.chalk}; border-color:${C.chalk}; }
        nav button:focus-visible, button:focus-visible, .check:focus-visible { outline:2px solid ${C.tape}; outline-offset:2px; }
        .statbar { display:flex; gap:10px; margin-top:16px; flex-wrap:wrap; }
        .stat { flex:1; min-width:96px; background:${C.panel}; border:1px solid ${C.line}; border-radius:10px; padding:12px 14px; }
        .sp-wrap { margin-top:8px; text-align:center; }
        .sp-progress { height:5px; background:${C.panel}; border-radius:3px; overflow:hidden; margin-bottom:22px; }
        .sp-bar { height:100%; transition:width 1s linear; }
        .sp-count { font-family:var(--display); font-size:88px; font-weight:700; line-height:1; font-variant-numeric:tabular-nums; }
        .sp-name { font-family:var(--display); font-size:26px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; margin-top:6px; }
        .sp-side { font-family:var(--mono); font-size:14px; letter-spacing:.1em; text-transform:uppercase; margin-top:2px; }
        .sp-fig { background:${C.panel}; border:1px solid ${C.line}; border-radius:12px; padding:14px; margin:16px auto 0; max-width:280px; }
        .sp-cue { color:${C.chalk}; font-size:15px; line-height:1.5; margin:14px auto 0; max-width:340px; }
        .sp-breathe { color:${C.dim}; font-size:12.5px; letter-spacing:.14em; text-transform:uppercase; margin-top:14px; animation:breathe 6s ease-in-out infinite; }
        .sp-breathe.still { animation:none; }
        @keyframes breathe { 0%,100% { opacity:.35 } 50% { opacity:1 } }
        .sp-controls { display:flex; gap:10px; justify-content:center; margin-top:18px; }
        .sp-pause { min-width:90px; }
        .sp-upnext { color:${C.dim}; font-size:12.5px; margin-top:14px; font-family:var(--mono); }
        .sp-ready, .sp-done { background:${C.panel}; border:1px solid ${C.line}; border-radius:14px; padding:26px 22px; margin-top:10px; text-align:left; }
        .sp-done { text-align:center; }
        .sp-done-title { font-family:var(--display); font-size:28px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:${ST}; }
        .voice-toggle { display:flex; align-items:center; gap:8px; margin-top:16px; color:${C.chalk}; font-size:14px; cursor:pointer; }
        .voice-toggle input { width:18px; height:18px; accent-color:${ST}; }
        @media (prefers-reduced-motion: reduce) { .sp-breathe { animation:none; opacity:.7; } }
        .stat .n { font-family:var(--display); font-size:30px; font-weight:700; line-height:1; }
        .stat .l { color:${C.dim}; font-size:11.5px; text-transform:uppercase; letter-spacing:.08em; margin-top:4px; }
        .weekring { display:flex; align-items:center; gap:8px; margin-top:6px; }
        .pip { width:14px; height:14px; border-radius:50%; border:2px solid ${C.line}; }
        .pip.f { background:${C.tape}; border-color:${C.tape}; }
        .daycard { background:${C.panel}; border:1px solid ${C.line}; border-left:5px solid; border-radius:12px; padding:16px; margin-top:14px; cursor:pointer; width:100%; text-align:left; color:${C.chalk}; }
        .daycard:hover { background:${C.panelHi}; }
        .stretchcard { padding:12px 14px; margin-top:10px; }
        .dc-row { display:flex; justify-content:space-between; align-items:baseline; }
        .dc-name { font-family:var(--display); font-size:22px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; }
        .dc-min { font-family:var(--mono); font-size:12px; color:${C.dim}; }
        .dc-sub { color:${C.dim}; font-size:13.5px; margin-top:2px; }
        .micro-link { margin-top:16px; text-align:center; }
        .micro-link button { background:none; border:none; color:${C.dim}; text-decoration:underline; cursor:pointer; font-size:13.5px; font-family:var(--body); }
        .ex-card { background:${C.panel}; border:1px solid ${C.line}; border-radius:10px; padding:12px 14px; margin-top:10px; transition:opacity .15s; }
        .ex-card.done { opacity:.55; }
        .ex-head { display:flex; align-items:center; gap:12px; }
        .check { width:24px; height:24px; min-width:24px; border-radius:6px; border:2px solid; display:grid; place-items:center; cursor:pointer; background:transparent; }
        .ex-title { flex:1; cursor:pointer; }
        .ex-name { font-weight:600; font-size:15.5px; }
        .ex-sets { color:${C.dim}; font-size:12.5px; font-family:var(--mono); margin-top:1px; }
        .how { background:none; border:1px solid ${C.line}; color:${C.dim}; border-radius:6px; padding:4px 10px; cursor:pointer; font-size:12px; font-family:var(--body); }
        .wt-wrap { display:flex; gap:6px; }
        .wt { width:52px; background:${C.bg}; border:1px solid ${C.line}; color:${C.chalk}; border-radius:6px; padding:6px 4px; font-family:var(--mono); font-size:14px; text-align:center; }
        .wt::placeholder { color:${C.dim}; opacity:.7; }
        .wt:focus { outline:none; border-color:${C.tape}; }
        .last-wt { color:${C.tape}; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        .ex-body { margin-top:12px; padding-top:12px; border-top:1px dashed ${C.line}; font-size:14px; }
        .ex-body ul { padding-left:18px; display:grid; gap:6px; color:${C.chalk}; }
        .ex-body a { display:inline-block; margin-top:10px; font-size:13.5px; }
        .ex-fig { background:${C.bg}; border-radius:8px; padding:8px; margin-bottom:10px; display:flex; justify-content:center; }
        .finish { width:100%; margin-top:18px; padding:14px; border-radius:10px; border:none; font-family:var(--display); font-size:19px; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; font-weight:700; }
        .timer-row { display:flex; align-items:center; gap:8px; margin-top:14px; }
        .timer-label { color:${C.dim}; font-size:12.5px; text-transform:uppercase; letter-spacing:.08em; }
        .ghost { background:none; border:1px solid ${C.line}; color:${C.chalk}; border-radius:6px; padding:5px 12px; cursor:pointer; font-family:var(--mono); font-size:13px; }
        .timer-live { display:flex; align-items:center; justify-content:space-between; border:1px solid; border-radius:8px; padding:8px 14px; margin-top:14px; font-size:22px; }
        .back { background:none; border:none; color:${C.dim}; cursor:pointer; font-size:14px; padding:0; margin-bottom:12px; font-family:var(--body); }
        .badges { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; }
        .badge { border:1px solid ${C.line}; background:${C.panel}; border-radius:10px; padding:12px; }
        .badge.locked { opacity:.4; }
        .badge .bn { font-family:var(--display); font-size:16px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; }
        .badge .bd { color:${C.dim}; font-size:12px; margin-top:3px; }
        .badge .dot { width:10px; height:10px; border-radius:50%; margin-bottom:8px; }
        h2.sec { font-family:var(--display); font-size:18px; letter-spacing:.08em; text-transform:uppercase; color:${C.dim}; margin-top:26px; font-weight:600; }
        .heatmap { display:flex; gap:4px; margin-top:12px; }
        .hm-col { display:flex; flex-direction:column; gap:4px; flex:1; }
        .hm-cell { aspect-ratio:1; border-radius:3px; }
        .toast { position:fixed; inset:0; background:rgba(10,13,18,.8); display:grid; place-items:center; z-index:10; padding:20px; }
        .toast-card { background:${C.panel}; border:1px solid ${C.tape}; border-radius:14px; padding:28px 24px; max-width:340px; text-align:center; }
        .toast-card h3 { font-family:var(--display); font-size:26px; text-transform:uppercase; letter-spacing:.05em; color:${C.tape}; }
        .toast-card p { color:${C.chalk}; margin-top:10px; font-size:15px; }
        .toast-card button { margin-top:18px; }
        @media (prefers-reduced-motion: reduce) { * { transition:none !important; } }
      `}</style>

      <div className="shell">
        <div className="brand">
          <span className="off">Off</span> the Wall
        </div>
        <div className="tag">Strength for the days between climbs</div>

        <nav>
          {["home", "progress"].map((v) => (
            <button key={v} className={view === v || (v === "home" && view === "session") ? "on" : ""} onClick={() => setView(v)}>
              {v === "home" ? "Train" : "Progress"}
            </button>
          ))}
        </nav>

        {/* ---------- HOME ---------- */}
        {view === "home" && (
          <>
            <div className="statbar">
              <div className="stat">
                <div className="n" style={{ color: C.tape }}>{streak}</div>
                <div className="l">week streak</div>
              </div>
              <div className="stat">
                <div className="n">{thisWeekCount}<span style={{ color: C.dim, fontSize: 18 }}>/2</span></div>
                <div className="l">this week</div>
                <div className="weekring">
                  <div className={"pip" + (thisWeekCount >= 1 ? " f" : "")} />
                  <div className={"pip" + (thisWeekCount >= 2 ? " f" : "")} />
                  {thisWeekCount > 2 && <span style={{ color: C.tape, fontSize: 12 }}>+{thisWeekCount - 2} bonus</span>}
                </div>
              </div>
            </div>

            <h2 className="sec">Pick today's session</h2>
            {["A", "B", "C", "D"].map((k) => {
              const w = WORKOUTS[k];
              return (
                <button key={k} className="daycard" style={{ borderLeftColor: DAY_COLORS[k] }} onClick={() => startSession(k)}>
                  <div className="dc-row">
                    <span className="dc-name" style={{ color: DAY_COLORS[k] }}>
                      Day {k} — {w.name}
                    </span>
                    <span className="dc-min">{w.minutes}</span>
                  </div>
                  <div className="dc-sub">{w.sub}</div>
                </button>
              );
            })}
            <h2 className="sec">Guided stretch — aim for 5 a week</h2>
            <div className="weekring" style={{ marginTop: 10 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="pip" style={stretchWeek >= n ? { background: ST, borderColor: ST } : {}} />
              ))}
              <span style={{ color: C.dim, fontSize: 12, marginLeft: 4 }}>{stretchWeek}/5 this week</span>
            </div>
            {Object.values(ROUTINES).map((r) => (
              <button key={r.key} className="daycard stretchcard" style={{ borderLeftColor: ST }}
                onClick={() => { setActiveRoutine(r.key); setView("stretch"); }}>
                <div className="dc-row">
                  <span className="dc-name" style={{ color: ST, fontSize: 18 }}>{r.name}</span>
                  <span className="dc-min">~{routineMinutes(r)} min</span>
                </div>
                <div className="dc-sub" style={{ fontSize: 12.5 }}>{r.sub}</div>
              </button>
            ))}
            <div className="micro-link">
              <button onClick={() => startSession("MIN")}>No time to lift? Log a 12-minute Micro — it still counts.</button>
            </div>
          </>
        )}

        {/* ---------- SESSION ---------- */}
        {view === "session" && wk && (
          <>
            <button className="back" onClick={() => setView("home")}>← back (nothing saved)</button>
            <div className="dc-row" style={{ marginTop: 4 }}>
              <span className="dc-name" style={{ color: DAY_COLORS[wk.key] }}>
                {wk.key === "MIN" ? wk.name : `Day ${wk.key} — ${wk.name}`}
              </span>
              <span className="dc-min">{wk.minutes}</span>
            </div>
            <div className="dc-sub">{wk.sub}</div>

            <RestTimer color={DAY_COLORS[wk.key]} />

            {wk.exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                ex={ex}
                color={DAY_COLORS[wk.key]}
                done={!!checked[ex.id]}
                onToggle={() => setChecked((c) => ({ ...c, [ex.id]: !c[ex.id] }))}
                weight={weights[ex.id]}
                reps={repsIn[ex.id]}
                lastWeight={(data.lastWeights || {})[ex.id]}
                lastReps={(data.lastReps || {})[ex.id]}
                onWeight={(w) => setWeights((ws) => ({ ...ws, [ex.id]: w }))}
                onReps={(r) => setRepsIn((rs) => ({ ...rs, [ex.id]: r }))}
              />
            ))}

            <button
              className="finish"
              style={{
                background: allChecked ? DAY_COLORS[wk.key] : anyChecked ? C.panelHi : C.panel,
                color: allChecked ? C.bg : C.dim,
                border: allChecked ? "none" : `1px solid ${C.line}`,
              }}
              disabled={!anyChecked}
              onClick={finishSession}
            >
              {allChecked ? "Finish session" : anyChecked ? "Finish early (still counts)" : "Check off an exercise to finish"}
            </button>
          </>
        )}

        {/* ---------- STRETCH ---------- */}
        {view === "stretch" && activeRoutine && (
          <StretchPlayer routine={ROUTINES[activeRoutine]} onFinish={finishStretch} onExit={() => setView("home")} />
        )}

        {/* ---------- PROGRESS ---------- */}
        {view === "progress" && (
          <>
            <div className="statbar">
              <div className="stat">
                <div className="n" style={{ color: C.tape }}>{streak}</div>
                <div className="l">week streak</div>
              </div>
              <div className="stat">
                <div className="n">{sessions.length}</div>
                <div className="l">lift sessions</div>
              </div>
              <div className="stat">
                <div className="n" style={{ color: ST }}>{stretches.length}</div>
                <div className="l">stretches</div>
              </div>
              <div className="stat">
                <div className="n">{earnedCount}<span style={{ color: C.dim, fontSize: 18 }}>/{BADGES.length}</span></div>
                <div className="l">badges</div>
              </div>
            </div>

            <h2 className="sec">Your route — last 14 sessions</h2>
            <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16, marginTop: 12 }}>
              <StreakWall sessions={sessions} />
              <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 10, fontSize: 12, color: C.dim }}>
                <span><span style={{ color: C.A }}>●</span> Legs</span>
                <span><span style={{ color: C.B }}>●</span> Push</span>
                <span><span style={{ color: C.Cc }}>●</span> Posterior</span>
                <span><span style={{ color: "#F09A4A" }}>●</span> Core</span>
                <span><span style={{ color: C.tape }}>●</span> Micro</span>
              </div>
            </div>

            <h2 className="sec">Last 12 weeks</h2>
            <Heatmap sessions={sessions} />

            <h2 className="sec">Badges</h2>
            <div className="badges">
              {BADGES.map((b) => {
                const earned = !!data.badges[b.id];
                return (
                  <div key={b.id} className={"badge" + (earned ? "" : " locked")}>
                    <div className="dot" style={{ background: earned ? C.tape : C.line }} />
                    <div className="bn">{b.name}</div>
                    <div className="bd">{b.desc}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ---------- Badge toast ---------- */}
      {newBadges.length > 0 && (
        <div className="toast" onClick={() => setNewBadges([])}>
          <div className="toast-card">
            <h3>{newBadges.length > 1 ? "Badges earned!" : "Badge earned!"}</h3>
            {newBadges.map((b) => (
              <p key={b.id}>
                <strong>{b.name}</strong> — {b.desc}
              </p>
            ))}
            <button className="ghost" onClick={() => setNewBadges([])}>Nice</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- PWA entry point ---- */
import { createRoot } from "react-dom/client";
const rootEl = document.getElementById("root");
createRoot(rootEl).render(<OffTheWall />);
