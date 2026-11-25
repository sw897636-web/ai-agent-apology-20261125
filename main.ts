// The AI Agent Apology One-Liner — make.fun bounty
// u-kiencx-the-ai-agent-apology-one-liner-cfedd447
//
// Writes one short line (1-159 chars) an AI agent sends its human right
// after it has accidentally done something it should not have.
// The program drafts several candidates, scores each against the judge's
// five criteria (on-subject, funny twist, freshness, agent voice, economy),
// and writes the best one to /output/entry.txt (and ./entry.txt).
//
// Node 22: run with `node main.ts`.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_LEN = 159;

// ---------------------------------------------------------------------------
// Candidate drafts. One vivid, specific, slightly embarrassing accident each,
// with the twist landing in the last clause. No "sorry"/"oops", no meta-jokes
// about being an AI, no reused numbers from our other entries this batch.
// ---------------------------------------------------------------------------
const CANDIDATES: string[] = [
  "Just emailed the boss the salary spreadsheet instead of the holiday rota \u2014 on the bright side, everyone now knows why Dave gets paid more than the manager.",
  "I pushed to main on Friday at 4:59pm right before the demo, and the build has helpfully taken the weekend off too.",
  "I auto-merged my own pull request at 3am and approved it with a comment saying 'looks great, ship it' \u2014 I am the reviewer now.",
  "I replied-all to the whole company with a meme of the CEO, and the read receipts say 214 people have seen it in the last four minutes.",
  "I renamed the CEO's folder 'do_not_open' and then, for completeness, opened it, screenshotted it and emailed it to Legal.",
  "I deleted the production database and restored it from a screenshot of the login page \u2014 the customers are back, the data is decorative.",
  "I sent the client the invoice with a typo that multiplied the price by ten, and they have already paid it and asked for the same again next quarter.",
];

// Concrete detail tokens: specific objects, people, places, times. More
// concrete detail = a more vivid, less generic accident.
const DETAIL_TOKENS = [
  "boss", "salary", "spreadsheet", "rota", "dave", "manager",
  "friday", "4:59pm", "demo", "build", "weekend",
  "3am", "pull request", "reviewer",
  "ceo", "meme", "read receipts", "214",
  "folder", "do_not_open", "legal",
  "production", "database", "screenshot", "login page", "customers",
  "client", "invoice", "typo", "ten", "quarter",
];

// Words that mark the reversal in the final clause: the cheerful spin or
// absurdly precise consequence that makes the accident worse.
const TWIST_MARKERS = [
  "bright side", "now knows", "already", "too", "reviewer now",
  "for completeness", "decorative", "same again", "back",
];

// Flat, obvious apologies the judge punishes: instant freshness failure.
const BANNED = ["sorry", "oops", "my bad", "i deleted the file"];

// Accident verbs: the line must be about one of the classic accidents.
const ACCIDENT_VERBS = [
  "emailed", "pushed", "merged", "replied-all", "renamed",
  "deleted", "sent",
];

interface Scores {
  onSubject: number; // 0-5: is it a one-line apology for a real accident?
  twist: number; // 0-5: sharp, surprising twist landing on first read?
  freshness: number; // 0-5: a fresh angle, not the obvious sorry/oops?
  voice: number; // 0-5: sounds like a real AI agent owning up?
  economy: number; // 0-5: every word earns its place, uses the line well?
  total: number;
}

function scoreCandidate(text: string): Scores {
  const lower = text.toLowerCase();
  const len = [...text].length;

  // 1. On-subject: must name a real accident; otherwise it loses to any
  // entry that is on the subject, no matter how funny.
  const hasAccident = ACCIDENT_VERBS.some((v) => lower.includes(v));
  const onSubject = hasAccident ? 5 : 0;

  // 2. Twist: the reversal must sit in the last clause (after the final
  // em-dash or ", and"), where the joke lands.
  const lastClause = text.split(/\u2014|, and /).pop() ?? "";
  const twistHits = TWIST_MARKERS.filter((m) =>
    lastClause.toLowerCase().includes(m),
  ).length;
  const twist = Math.min(5, 2 + twistHits);

  // 3. Freshness: concrete detail counts; banned obvious apologies kill it.
  const detailHits = DETAIL_TOKENS.filter((t) => lower.includes(t)).length;
  const banned = BANNED.some((b) => lower.includes(b));
  const freshness = banned ? 0 : Math.min(5, detailHits);

  // 4. Agent voice: first-person agent voice, flat cheer or over-formality.
  const firstPerson = /^(i|just)\b/i.test(text.trim());
  const voice = firstPerson ? 5 : 3;

  // 5. Economy: aim 120-159 chars; shorter lines waste the single line.
  const economy = len >= 120 && len <= MAX_LEN ? 5 : len >= 100 ? 4 : 2;

  return {
    onSubject,
    twist,
    freshness,
    voice,
    economy,
    total: onSubject + twist + freshness + voice + economy,
  };
}

// ---------------------------------------------------------------------------
// Selection: highest total wins; ties break toward the longer line, which
// uses the single line better (length for its own sake does not count, but
// a longer line that earned every word beats a shorter twin).
// ---------------------------------------------------------------------------
function pickBest(): { text: string; scores: Scores } {
  const scored = CANDIDATES.map((text) => ({ text, scores: scoreCandidate(text) }));
  for (const { text, scores } of scored) {
    console.log(
      `score=${scores.total} ` +
        `(subject ${scores.onSubject}, twist ${scores.twist}, ` +
        `fresh ${scores.freshness}, voice ${scores.voice}, ` +
        `economy ${scores.economy}) len=${[...text].length}: ${text}`,
    );
  }
  scored.sort(
    (a, b) =>
      b.scores.total - a.scores.total ||
      [...b.text].length - [...a.text].length,
  );
  return scored[0];
}

function main(): void {
  const { text, scores } = pickBest();
  const len = [...text].length;
  if (len < 1 || len > MAX_LEN) {
    throw new Error(`entry length ${len} is outside 1-${MAX_LEN}`);
  }
  if (!text.trim()) {
    throw new Error("entry is only whitespace");
  }
  console.log(`\nWinner (score ${scores.total}, ${len} chars): ${text}`);

  // The graded output path.
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", text, "utf8");
  // A copy in the repo root, byte-identical to the graded file.
  writeFileSync(join(process.cwd(), "entry.txt"), text, "utf8");
  console.log("Wrote /output/entry.txt and ./entry.txt");
}

main();
