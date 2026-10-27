#!/usr/bin/env node
/**
 * CureAid App.jsx Build Fix
 * 
 * Fixes two errors:
 * 1. Duplicate TESTIMONIALS declaration (removes the older first copy)
 * 2. Stray closing brace after the second TestimonialsSection
 *
 * Usage: node fix-app.js src/App.jsx
 */

const fs = require('fs');
const path = process.argv[2] || 'src/App.jsx';

let code = fs.readFileSync(path, 'utf8');
const original = code;

// ═══════════════════════════════════════════════════════════════════════════════
// FIX 1: Remove the FIRST (older, duplicate) block of testimonials code.
//
// The file has TWO testimonial sections:
//   - FIRST (old): TESTIMONIALS array + TestimonialColumn (singular) + TestimonialsSection (no setPage)
//   - SECOND (new): TESTIMONIALS array + TestimonialsColumn (plural) + TestimonialsSection({ setPage })
//
// We remove everything from the FIRST "// ─── Testimonials data" comment
// up to (but NOT including) the "// ─── Animated geometric hero" comment.
// ═══════════════════════════════════════════════════════════════════════════════

const firstTestimonialsStart = code.indexOf("// ─── Testimonials data ─────────────────────────────────────────────────────\nconst TESTIMONIALS");
const geometricHeroStart = code.indexOf("// ─── Animated geometric hero");

if (firstTestimonialsStart === -1) {
  console.log("WARNING: Could not find first TESTIMONIALS block.");
} else if (geometricHeroStart === -1) {
  console.log("WARNING: Could not find geometric hero marker.");
} else if (firstTestimonialsStart < geometricHeroStart) {
  // Remove from the first testimonials block up to the geometric hero comment
  code = code.slice(0, firstTestimonialsStart) + code.slice(geometricHeroStart);
  console.log("FIX 1: Removed duplicate TESTIMONIALS block (" + (geometricHeroStart - firstTestimonialsStart) + " chars)");
} else {
  console.log("WARNING: First TESTIMONIALS block is not before geometric hero. Skipping fix 1.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIX 2: Remove the stray closing brace after the second TestimonialsSection.
//
// The code has:
//   ...
//     );
//   }
//   }          <-- this extra brace causes "Unexpected }"
//
//   function Home({ setPage }) {
//
// We find "}\n}\n\nfunction Home" and replace with "}\n\nfunction Home"
// ═══════════════════════════════════════════════════════════════════════════════

// Try the exact pattern first
const strayBracePatterns = [
  // Pattern: closing of TestimonialsSection followed by stray }
  { find: /\);\s*\n\s*\}\s*\n\}\s*\n\s*\nfunction Home/g, replace: (match) => match.replace(/\}\s*\n\}/, '}') },
];

let fix2Applied = false;

// More robust: find "}\n}" right before "function Home"
const homeIdx = code.indexOf('\nfunction Home(');
if (homeIdx > 0) {
  // Look backwards from function Home to find the double-closing-brace
  const preceding = code.slice(Math.max(0, homeIdx - 50), homeIdx);
  
  // Check if there are two consecutive } lines
  const match = preceding.match(/\}\s*\n\s*\}\s*$/);
  if (match) {
    const cutStart = homeIdx - 50 + preceding.lastIndexOf(match[0]);
    const cutEnd = cutStart + match[0].length;
    // Replace double } with single }
    const replacement = match[0].replace(/\}\s*\n\s*\}/, '}');
    code = code.slice(0, cutStart) + replacement + code.slice(cutEnd);
    console.log("FIX 2: Removed stray closing brace before function Home");
    fix2Applied = true;
  }
}

if (!fix2Applied) {
  // Fallback: just try to find }}\n before function Home
  const pattern = /\}\s*\n\}\s*\n+function Home\(/;
  if (pattern.test(code)) {
    code = code.replace(pattern, '}\n\nfunction Home(');
    console.log("FIX 2 (fallback): Removed stray closing brace");
  } else {
    console.log("WARNING: Could not find stray closing brace to remove.");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Verify fixes
// ═══════════════════════════════════════════════════════════════════════════════

const testimonialsCount = (code.match(/const TESTIMONIALS\s*=/g) || []).length;
if (testimonialsCount === 1) {
  console.log("VERIFY: TESTIMONIALS is now declared exactly once. ✓");
} else {
  console.log("WARNING: TESTIMONIALS found " + testimonialsCount + " times (expected 1).");
}

// Check for unbalanced braces
let braceDepth = 0;
for (const ch of code) {
  if (ch === '{') braceDepth++;
  if (ch === '}') braceDepth--;
}
if (braceDepth === 0) {
  console.log("VERIFY: Braces are balanced. ✓");
} else {
  console.log("WARNING: Brace imbalance of " + braceDepth + " (positive = unclosed, negative = extra close).");
}

if (code === original) {
  console.log("\nNo changes made.");
} else {
  // Backup original
  fs.writeFileSync(path + '.backup', original);
  console.log("\nBackup saved to: " + path + ".backup");
  
  // Write fixed file
  fs.writeFileSync(path, code);
  console.log("Fixed file written to: " + path);
  console.log("\nDone! Try running 'npm run build' again.");
}
