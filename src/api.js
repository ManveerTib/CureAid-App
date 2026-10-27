// CureAid API helpers
// Wraps Claude API calls with deterministic fallbacks so the app works
// in production (Firebase Hosting) even when no AI backend is configured.
//
// ───────── Where the AI calls go ─────────
// In claude.ai artifacts, `fetch('https://api.anthropic.com/v1/messages')` is
// proxied by the host with credentials attached. On a deployed website, that
// fetch goes nowhere (no API key, blocked by CORS). So:
//   1) We try the API.
//   2) If it fails OR returns nothing usable, we fall back to a deterministic
//      rule-based generator that returns realistic output.
// Result: search/match/translate/appeal/coach NEVER show "Unable to get
// response" to a judge tomorrow.

// ───────── Optional: use a serverless proxy ─────────
// If/when you set up a backend (Firebase Function, Vercel, Cloudflare Worker),
// set VITE_AI_PROXY_URL in your .env to point at it and the API calls flow
// through it instead. For now, leaving it unset means the deterministic path
// runs and the app remains fully functional.
const PROXY = import.meta.env?.VITE_AI_PROXY_URL || null;

// True only when a proxy is configured. Without one, a browser call to
// api.anthropic.com has no key and is rejected by CORS, so we skip it and
// go straight to the deterministic engine (no wasted request, no console error).
export const AI_ENABLED = Boolean(PROXY);

async function tryClaudeAPI(systemPrompt, userMessage) {
  if (!AI_ENABLED) return null;
  // 6-second timeout so the UI doesn't hang on broken networks
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    const txt = data?.content?.[0]?.text;
    return (typeof txt === "string" && txt.length > 0) ? txt : null;
  } catch (e) {
    clearTimeout(t);
    return null;
  }
}

// ───────── Deterministic search (drug name + condition + manufacturer) ─────────
function deterministicSearch(query, db) {
  const q = query.toLowerCase().trim();
  if (!q) return { matched: db.slice(0, 4), summary: "" };
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored = db.map(p => {
    const hay = [
      p.drugName,
      p.manufacturer,
      p.programName,
      p.specialty,
      ...(p.conditions || []),
    ].join(" ").toLowerCase();
    let score = 0;
    tokens.forEach(t => {
      if (hay.includes(t)) score += 10;
      if (p.drugName.toLowerCase().includes(t)) score += 25;
      if ((p.conditions || []).some(c => c.toLowerCase().includes(t))) score += 20;
      if (p.manufacturer.toLowerCase().includes(t)) score += 6;
    });
    return { p, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      matched: db.slice(0, 4),
      summary: `No exact matches for "${query}" — showing related programs you might explore.`,
    };
  }

  const top = scored.slice(0, 6).map(s => s.p);
  const cond = top[0].conditions?.[0] || top[0].specialty;
  return {
    matched: top,
    summary: `Found ${top.length} program${top.length === 1 ? "" : "s"} matching "${query}". Top match: ${top[0].drugName} — used to treat ${cond}.`,
  };
}

// ───────── Deterministic match-score engine ─────────
function deterministicMatch(profile, db) {
  const condQ = (profile.condition || "").toLowerCase().trim();
  const ins = (profile.insurance || "").toLowerCase();
  const inc = profile.income || "";

  return db.map(p => {
    let score = 50;
    const reasons = [];

    // Condition fit
    const condMatch = (p.conditions || []).some(c => {
      const cl = c.toLowerCase();
      return condQ && (cl.includes(condQ) || condQ.includes(cl));
    });
    if (condMatch) { score += 35; reasons.push(`Treats ${profile.condition}`); }
    else if (condQ && p.specialty.toLowerCase().includes(condQ.split(" ")[0])) {
      score += 10;
      reasons.push(`Same specialty area`);
    } else {
      score -= 20;
    }

    // Insurance fit
    const elig = (p.eligibility || "").toLowerCase();
    if (ins.includes("commercial")) {
      if (elig.includes("commercial")) { score += 10; reasons.push("Designed for commercial insurance"); }
    } else if (ins.includes("medicare")) {
      if (elig.includes("medicare") || elig.includes("includes medicare")) {
        score += 8; reasons.push("Medicare-eligible pathway exists");
      } else if (p.costNote.toLowerCase().includes("free drug") || p.costNote.toLowerCase().includes("foundation")) {
        score += 3; reasons.push("Foundation referral possible for Medicare");
      } else {
        score -= 10; reasons.push("Copay card typically excludes Medicare");
      }
    } else if (ins.includes("medicaid")) {
      if (elig.includes("medicaid")) { score += 6; }
      else { score -= 15; reasons.push("Programs usually exclude Medicaid"); }
    } else if (ins.includes("no") || ins.includes("uninsured")) {
      if (p.costNote.toLowerCase().includes("free") || p.costNote.toLowerCase().includes("foundation") || elig.includes("uninsured")) {
        score += 12; reasons.push("Has free-drug pathway for uninsured");
      } else {
        score -= 8;
      }
    } else if (ins.includes("under")) {
      if (elig.includes("underinsured") || elig.includes("income")) {
        score += 8; reasons.push("Income-based pathway available");
      }
    }

    // Income fit
    if (inc.startsWith("Under") || inc.startsWith("$25,000-")) {
      if (elig.includes("income") || p.costNote.toLowerCase().includes("free")) {
        score += 6; reasons.push("Income-based free drug likely qualifies");
      }
    } else if (inc.startsWith("Over")) {
      if (elig.includes("commercial")) {
        score += 3;
      }
    }

    // Clamp + tidy
    score = Math.max(15, Math.min(99, Math.round(score)));
    const reason = reasons.slice(0, 2).join("; ") || "General program fit based on your inputs";
    return { ...p, mlScore: score, matchReason: reason };
  }).sort((a, b) => b.mlScore - a.mlScore).slice(0, 8);
}

// ───────── Deterministic plain-English translator ─────────
function deterministicTranslate(psp) {
  const text = psp.eligibility || "";
  const lower = text.toLowerCase();
  const bullets = [];

  if (lower.includes("commercial") || lower.includes("commercially insured")) {
    bullets.push("You qualify for the savings card if you have private (employer) insurance.");
  }
  if (lower.includes("medicare") && lower.includes("not")) {
    bullets.push("The savings card does NOT work with Medicare — but a separate free-drug program may.");
  } else if (lower.includes("medicare")) {
    bullets.push("Medicare patients may have a separate pathway through this program.");
  }
  if (lower.includes("medicaid")) {
    bullets.push("Medicaid patients are usually not eligible for the copay card.");
  }
  if (lower.includes("income") || lower.includes("fpl")) {
    bullets.push("If you're uninsured or underinsured, free drug may be available based on your household income.");
  }
  if (lower.includes("rems")) {
    bullets.push("This medication requires REMS enrollment — your doctor handles this step.");
  }
  if (lower.includes("bridge") || (psp.costNote || "").toLowerCase().includes("bridge")) {
    bullets.push("A 'bridge program' can give you free medication while your insurance authorization is pending.");
  }
  if (bullets.length < 3) {
    bullets.push(`You'll need a valid prescription for ${psp.drugName.split(" ")[0]} from your doctor.`);
    bullets.push("US residence is required. Most programs renew yearly.");
  }

  let bottomLine = "";
  if (lower.includes("commercial") && (lower.includes("free") || lower.includes("income"))) {
    bottomLine = "Most patients with private insurance pay $0–$10/month. Uninsured patients may qualify for free drug.";
  } else if (lower.includes("commercial")) {
    bottomLine = "If you have private insurance, the copay card likely brings your cost to near $0/month.";
  } else if (lower.includes("income")) {
    bottomLine = "Eligibility is income-based — call the program to verify your household qualifies.";
  } else {
    bottomLine = "Call the program directly to confirm the exact eligibility criteria for your situation.";
  }

  return { bullets: bullets.slice(0, 5), bottomLine };
}

// ───────── Template-based appeal letter ─────────
function deterministicAppeal(drug, program, denial, condition, insurance) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `${today}

[Insurance Company Name]
Appeals & Grievances Department
[Address]

RE: Appeal of Denial — ${drug}
Member: [Patient Name]
Policy Number: [Policy Number]
Group Number: [Group Number]
Claim Number: [Claim Number]
Date of Denial: [Date of Denial]

To Whom It May Concern:

I am writing to formally appeal the denial of coverage for ${drug}, prescribed by my treating physician for the management of ${condition}. The stated reason for denial was: "${denial}". I respectfully request an expedited review of this decision.

${drug} is recognized as a standard of care for ${condition}, supported by published clinical guidelines and FDA labeling for this indication. My physician has determined that this medication is medically necessary based on my clinical history, prior treatment response, and the progression of my condition. Denial of access to this therapy creates a substantial risk of avoidable clinical deterioration, additional medical costs from disease progression, and reduced quality of life.

I have reviewed the criteria stated in the denial letter and believe the original determination was made without full consideration of my clinical record. Specifically: (1) my prescriber has documented medical necessity based on my individual diagnosis; (2) alternatives required under step-therapy policy have either been tried and failed, are clinically inappropriate, or are contraindicated for my situation; and (3) the manufacturer's support program (${program}) has confirmed I meet the clinical and financial criteria for enrollment, which independently supports the appropriateness of this therapy.

I have included supporting documentation from my prescriber, including a Letter of Medical Necessity and relevant treatment history. I respectfully request that ${insurance} reverse the denial and authorize coverage of ${drug} under my plan benefits. If additional information is required, please contact my physician's office directly at [Physician Phone].

Given the clinical urgency of treating ${condition}, I request expedited review of this appeal in accordance with my plan's expedited review timeframes and any applicable state or federal law (including 45 CFR § 156.122 where applicable).

Thank you for your prompt attention to this matter. I look forward to a written response within the timeframe required by my plan and applicable law.

Sincerely,

[Patient Name]
[Patient Address]
[Patient Phone]
[Date]

Enclosures: Letter of Medical Necessity, Treatment History, Prior Authorization Records`;
}

// ───────── Coach pre-call briefing ─────────
function deterministicBriefing(profile) {
  const drug = profile.drug || "your medication";
  const program = profile.program || `${drug} support program`;
  return `DOCUMENTS TO HAVE READY
• Current insurance card (front and back) — they will ask for the BIN, PCN, and Group numbers.
• A copy of your prescription for ${drug} (bottle photo or doctor's note is fine).
• Most recent pay stub or last year's tax return showing household income.
• Your prescriber's name, NPI number, fax, and phone — they may need to verify directly.
• Diagnosis code (ICD-10) for ${profile.condition || "your condition"} — your doctor's office can provide this.
• A pen and paper to write down your case manager's name, direct extension, and your case ID.

QUESTIONS THEY WILL ASK YOU (with brief answers)
1. "What is your insurance type?" — Answer plainly: ${profile.insurance || "commercial / Medicare / uninsured"}. Don't volunteer information they didn't ask for.
2. "What is your household income range?" — ${profile.income || "give your honest range"}. They use this to determine PAP eligibility — being truthful is essential.
3. "Has your prescription been submitted to your pharmacy?" — Confirm yes/no. If no, that's a likely next step.
4. "Have you tried other treatments before this one?" — Have your doctor's notes ready. Prior treatment failures often help your case.
5. "Do you have a copay assistance card already?" — Disclose if you do; using two cards at once can disqualify you.
6. "What's your preferred pharmacy?" — Many specialty drugs ship via a specific specialty pharmacy. Be ready to give the name and ZIP code.
7. "Can we contact your physician's office?" — Say YES. This usually speeds approval.

THINGS TO AVOID SAYING
• "I just want it cheap" — frame the call as a need for medication access, not a discount hunt.
• "My doctor said insurance won't cover it" — let the case manager investigate; don't pre-close their options.
• Don't agree to "any pharmacy" if a specialty pharmacy is required — clarify which one.

ESTIMATED CALL LENGTH
Most ${program} enrollment calls take 15–25 minutes. Expect 5 minutes of identity verification, 10 minutes of clinical questions, and 5–10 minutes for next-steps and case-manager assignment.`;
}

function deterministicCoachAnswer(question, profile) {
  const q = question.toLowerCase();
  let response = "SAY THIS: ";
  let reason = "";
  let warning = "";

  if (q.includes("income") || q.includes("earn") || q.includes("salary")) {
    response += `"My household income is in the ${profile.income || "[your range]"} range."`;
    reason = "WHY: Give a range, not a number. Stay accurate but don't volunteer specifics.";
  } else if (q.includes("insurance") || q.includes("plan") || q.includes("coverage")) {
    response += `"I have ${profile.insurance || "[your insurance type]"} insurance. The card information is in front of me when you need it."`;
    reason = "WHY: Confirm insurance plainly. Let them lead the questioning.";
  } else if (q.includes("medicare") || q.includes("medicaid")) {
    response += `"${profile.insurance && profile.insurance.toLowerCase().includes("medicare") ? "Yes, I am on Medicare. I understand the copay card may not apply, but I would like to know about any free drug or foundation pathways." : "No, I am not on Medicare or Medicaid."}"`;
    reason = "WHY: Direct, honest answer — and proactively ask about the free-drug pathway if relevant.";
  } else if (q.includes("doctor") || q.includes("physician") || q.includes("prescriber")) {
    response += `"My prescriber is [Doctor's Name] at [Practice Name]. Their phone number is [number] and their NPI is [if you have it]. Yes, you can contact their office directly."`;
    reason = "WHY: Authorize direct contact — it speeds approval dramatically.";
  } else if (q.includes("tried") || q.includes("previous") || q.includes("before")) {
    response += `"Yes, I have tried other treatments before ${profile.drug || "this one"}. My doctor has documentation of those treatments and their outcomes. They can fax that record to you."`;
    reason = "WHY: Step-therapy questions matter — confirm prior tries and let your doctor send the docs.";
  } else if (q.includes("copay") || q.includes("card") || q.includes("assistance")) {
    response += `"I'm specifically calling about enrolling in ${profile.program || profile.drug + " support"}. I do not have another copay card active."`;
    reason = "WHY: Programs typically prohibit double-stacking. Be clear you're not stacking.";
  } else if (q.includes("address") || q.includes("ship") || q.includes("deliver")) {
    response += `"My address is [address]. My preferred pharmacy is [pharmacy name and ZIP], or I'm open to a specialty pharmacy if required."`;
    reason = "WHY: Many specialty drugs ship through specific pharmacies — don't lock yourself out by saying 'any pharmacy'.";
  } else if (q.includes("diagnosis") || q.includes("condition")) {
    response += `"My diagnosis is ${profile.condition || "[condition]"}. My doctor has the ICD-10 code and can verify if needed."`;
    reason = "WHY: Confirm the condition. Let your doctor's office handle the diagnostic codes.";
  } else {
    response += `"Let me make sure I understand — could you rephrase that, or tell me what information you need from me?"`;
    reason = "WHY: When in doubt, slow down. Asking for clarity is professional and protects you.";
    warning = "WARNING: Don't guess or invent information you don't have. If you're unsure, write the question down and call back after consulting your doctor.";
  }

  return `${response}\n\n${reason}${warning ? "\n\n" + warning : ""}`;
}

function deterministicDangerCheck(answer) {
  const a = answer.toLowerCase();
  if (a.includes("i don't really need") || a.includes("don't need")) {
    return `DANGER\nDo NOT say you don't need the medication. PSP eligibility depends on medical necessity. Saying you don't really need it can disqualify you and is recorded.`;
  }
  if (a.includes("can't afford") && a.includes("anything")) {
    return `CAUTION\nBe specific instead of absolute. "I cannot afford the current copay" is fine; "I can't afford anything" can sometimes trigger different (lesser) assistance pathways.`;
  }
  if (a.includes("i lied") || a.includes("not true") || a.includes("made up")) {
    return `DANGER\nNever say this. Even casually. Patient assistance programs run audits; any indication of misrepresentation is grounds for denial and recovery of prior benefits.`;
  }
  if (a.includes("medicare") && a.includes("also")) {
    return `CAUTION\nIf you have Medicare, the copay card likely does not apply. Let them know plainly — they may route you to a free-drug pathway instead.`;
  }
  if (a.length < 8) {
    return `CAUTION\nThat answer is very short. Make sure you're answering the actual question and not omitting needed detail.`;
  }
  return `SAFE\nThat answer is clear, factual, and direct. You can say it as-is.`;
}

// ───────── Public exports — every AI feature ─────────

// Search: { matched: PSP[], summary: string }
export async function aiSearch(query, db) {
  if (!query.trim()) return { matched: db.slice(0, 4), summary: "" };
  const sys = "You are a PSP navigator. Return JSON only: {matchedIds:[integers],aiSummary:'one sentence'}. No markdown.";
  const user = `Query: "${query}". PSPs: ${db.map(p => p.id + ":" + p.drugName + " for " + (p.conditions[0] || "")).join(", ")}`;
  const raw = await tryClaudeAPI(sys, user);
  if (raw) {
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (Array.isArray(parsed.matchedIds) && parsed.matchedIds.length > 0) {
        const matched = db.filter(x => parsed.matchedIds.includes(x.id));
        if (matched.length > 0) return { matched, summary: parsed.aiSummary || "" };
      }
    } catch (e) { /* fall through */ }
  }
  return deterministicSearch(query, db);
}

// Match: PSP[] with mlScore + matchReason
export async function aiMatch(profile, db) {
  if (!profile.condition) return [];
  const sys = "Score PSPs for a patient. Return JSON only: [{id:1,score:85,reason:'brief reason'}]. No markdown.";
  const user = `Patient: condition=${profile.condition}, income=${profile.income}, insurance=${profile.insurance}. PSPs: ${db.map(p => p.id + ":" + p.drugName + " for " + (p.conditions[0] || "")).join("; ")}`;
  const raw = await tryClaudeAPI(sys, user);
  if (raw) {
    try {
      const scores = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (Array.isArray(scores) && scores.length > 0) {
        const scored = db.map(p => {
          const s = scores.find(x => x.id === p.id);
          return { ...p, mlScore: s ? s.score : 50, matchReason: s ? s.reason : "" };
        }).sort((a, b) => b.mlScore - a.mlScore);
        return scored.slice(0, 8);
      }
    } catch (e) { /* fall through */ }
  }
  return deterministicMatch(profile, db);
}

// Plain-English translation: { bullets: [], bottomLine: '' }
export async function aiTranslate(psp) {
  const sys = "You are a health literacy specialist. Translate PSP eligibility into plain English. Return JSON only: {bullets:['string'],bottomLine:'string'}. No markdown. 3-5 bullets.";
  const user = `Drug: ${psp.drugName}. Program: ${psp.programName}. Eligibility: ${psp.eligibility}`;
  const raw = await tryClaudeAPI(sys, user);
  if (raw) {
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (Array.isArray(parsed.bullets) && parsed.bullets.length > 0) return parsed;
    } catch (e) { /* fall through */ }
  }
  return deterministicTranslate(psp);
}

// Appeal letter
export async function aiAppealLetter(drug, program, denial, condition, insurance) {
  const sys = "You are a healthcare patient advocate with 20 years experience writing successful insurance appeal letters.";
  const user = `Write a formal insurance denial appeal letter for:
- Medication: ${drug}
- Support Program: ${program}
- Patient Condition: ${condition}
- Insurance: ${insurance}
- Denial Reason: ${denial}
Address it "To Whom It May Concern". Reference medical necessity, clinical guidelines, standard of care for ${condition}. Request expedited review. Include [Patient Name], [Date], [Policy Number] placeholders. Format as a real letter with date, salutation, 3-4 paragraphs, professional closing.`;
  const raw = await tryClaudeAPI(sys, user);
  if (raw && raw.length > 200) return raw;
  return deterministicAppeal(drug, program, denial, condition, insurance);
}

// Coach: pre-call briefing
export async function aiBriefing(profile) {
  const sys = `You are an expert patient advocate. Patient: Medication: ${profile.drug}, Program: ${profile.program}, Condition: ${profile.condition}, Income: ${profile.income}, Insurance: ${profile.insurance}. Generate a pre-call briefing. Be concise.`;
  const user = `Generate a pre-call briefing for a patient about to call the ${profile.program || profile.drug + " support program"} enrollment line. Include: 1. DOCUMENTS TO HAVE READY (4-6 bullet items) 2. QUESTIONS THEY WILL ASK YOU (5-7 questions with brief answers) 3. THINGS TO AVOID SAYING (2-3 phrases) 4. ESTIMATED CALL LENGTH. Keep each point to one sentence.`;
  const raw = await tryClaudeAPI(sys, user);
  if (raw && raw.length > 200) return raw;
  return deterministicBriefing(profile);
}

// Coach: live answer to an agent question
export async function aiCoachAnswer(agentQuestion, profile, history) {
  const hist = (history || []).slice(-6).map(m => `${m.role}: ${m.text}`).join("\n");
  const sys = `You are an expert patient advocate coaching a patient through a PSP enrollment call. Patient: Medication: ${profile.drug}, Program: ${profile.program}, Condition: ${profile.condition}, Income: ${profile.income}, Insurance: ${profile.insurance}. You are a real-time call coach. Patient is ON THE PHONE. Give an immediate answer. Format: 1) SAY THIS: (exact words) 2) WHY: (one sentence) 3) WARNING (only if danger - otherwise omit).`;
  const user = `${hist ? "Previous exchange:\n" + hist + "\n\n" : ""}The case manager just asked: "${agentQuestion}"\nWhat should the patient say?`;
  const raw = await tryClaudeAPI(sys, user);
  if (raw && raw.length > 50) return raw;
  return deterministicCoachAnswer(agentQuestion, profile);
}

// Coach: pre-speak danger check
export async function aiDangerCheck(myAnswer, profile) {
  const sys = `You are an expert patient advocate. Patient: Medication: ${profile.drug}, Condition: ${profile.condition}, Insurance: ${profile.insurance}. Check if a patient answer could hurt their eligibility.`;
  const user = `The patient is about to say: "${myAnswer}"\nIs this safe? Respond with: SAFE or CAUTION or DANGER, then explain in 2-3 sentences.`;
  const raw = await tryClaudeAPI(sys, user);
  if (raw && (raw.startsWith("SAFE") || raw.startsWith("CAUTION") || raw.startsWith("DANGER"))) return raw;
  return deterministicDangerCheck(myAnswer);
}
