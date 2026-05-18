// src/utils/cardOcr.js
// Tesseract.js lazy-loaded for users who never open the card scanner.
// Claude Vision API path used when an API key is configured — much more
// accurate on dark/stylised card backgrounds.

// ── Tesseract shared worker ───────────────────────────────────────────────────

let workerPromise = null;

async function getWorker() {
  if (workerPromise) return workerPromise;
  workerPromise = (async () => {
    const { createWorker } = await import('tesseract.js');
    const w = await createWorker('eng', 1, {
      logger: () => {},
    });
    // PSM 6 = assume uniform block of text (better for card effect sections)
    await w.setParameters({ tessedit_pageseg_mode: '6' });
    return w;
  })();
  return workerPromise;
}

// ── Image preprocessing (Tesseract path) ─────────────────────────────────────

/**
 * Preprocess for Tesseract: scale 2×, detect dark background,
 * convert to grayscale, apply high-contrast threshold.
 * Returns a data URL of the processed image.
 */
export function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // Scale up 2× — larger text is dramatically better for Tesseract
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Sample pixels to detect if background is predominantly dark
      let darkPixels = 0;
      const sampleSize = Math.min(data.length / 4, 1000);
      for (let i = 0; i < sampleSize; i++) {
        const idx = Math.floor(i * (data.length / 4 / sampleSize)) * 4;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (lum < 128) darkPixels++;
      }
      // If >60% of sampled pixels are dark, image has a dark background.
      // Invert the threshold so text becomes black on white for Tesseract.
      const darkBackground = darkPixels / sampleSize > 0.6;

      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const val = darkBackground ? (lum > 128 ? 0 : 255) : (lum < 128 ? 0 : 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }

      ctx.putImageData(imageData, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

/**
 * Run Tesseract OCR on a File. Returns raw text string.
 */
export async function runOcr(file, onProgress) {
  const processedUrl = await preprocessImage(file);
  const worker = await getWorker();
  if (onProgress) onProgress(10);
  const result = await worker.recognize(processedUrl);
  if (onProgress) onProgress(100);
  return result.data.text;
}

/**
 * Terminate the shared Tesseract worker (call on unmount if desired).
 */
export async function terminateOcrWorker() {
  if (!workerPromise) return;
  const w = await workerPromise;
  await w.terminate();
  workerPromise = null;
}

// ── Claude Vision API path ────────────────────────────────────────────────────

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMediaType(file) {
  if (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) return file.type;
  return 'image/jpeg';
}

function buildPrompt(deckType, extra = {}) {
  if (extra.isThreat) {
    const worldLine = extra.world ? `\nOtherWorld context: ${extra.world}` : '';
    return `You are extracting data from a Shadows of Brimstone THREAT CARD photo.
Threat tier: ${extra.tier || 'unknown'}${worldLine}

Threat cards are drawn at the start of a fight. They describe an enemy group that appears and any special rules for that encounter.

Extract ALL visible text and return a JSON object with these fields:
- name: the card title (usually bold text at top, often formatted as "Enemy Group — Variant" e.g. "Lost Army — Generalisimo")
- flavorText: italic lore/flavor text if present (not rules text)
- tier: the threat tier shown — "low", "medium", "high", "epic", or "otherworld"
- world: the OtherWorld name if this is an otherworld threat card (e.g. "Jargono", "Trederra"), otherwise omit
- enemyGroup: the name of the enemy group that spawns (e.g. "Lost Army", "Black Fang Tribe")
- enemyCount: if the card shows a specific fixed number of enemies to spawn (e.g. "3", "D6+1"), put that here as a string. Leave blank if a Peril Die icon is shown instead.
- perilCount: set to true if the card shows a YELLOW CUBE with the letter "P" on it (this is the Peril Die icon — a custom yellow D6 die used in Shadows of Brimstone). This means the number of enemies is determined by rolling the Peril Die. If you see this yellow P-cube icon anywhere on the card, set perilCount to true and leave enemyCount blank.
- lootCount: number of Loot cards heroes draw after winning this fight (integer, default 1)
- xp: XP reward for defeating this threat, as a string (e.g. "15+5" means 15 base + 5 per hero)
- effects: array of strings — each special fight rule or ability this threat adds. Each distinct rule is a separate array entry.

Rules:
- The Peril Die is a YELLOW CUBE / YELLOW D6 with a "P" on its face. It looks like a small yellow square/box with the letter P. It is NOT a skull die. If you see this icon, perilCount must be true.
- Correct obvious OCR spelling errors using Shadows of Brimstone context
- Include ALL rules text in effects — do not truncate
- Return ONLY a valid JSON object, no markdown fences, no explanation`;
  }
  if (extra.isEnemy) {
    return `You are extracting data from a Shadows of Brimstone ENEMY SHEET photo.

Extract ALL visible text and stats. Return a JSON object with these fields:
- name: the enemy name (large decorative text at top). IMPORTANT: The Brutal side of enemy sheets has the word "Brutal" printed as a banner/watermark above or near the name. Do NOT include "Brutal" in the name field. The name should be the same on both Normal and Brutal sides (e.g. "Ancient Horror", not "Brutal Ancient Horror").
- isBrutal: boolean — set to true if you see a "BRUTAL" banner/watermark/label on the card. This indicates it's the Brutal difficulty side. If no Brutal marking is visible, set to false.
- keywords: array of keyword subtypes shown below the name (e.g. "Void", "Ancient", "Beast", "Undead", "Demon")
- Size: the size shown on the card ("Small", "Medium", "Large", or "Extra Large")
- initiative: the initiative number (top-right circle)
- move: the Move value (number, or "**" or "*" for special movement). If it says "**" use the string "**"
- escape: the Escape value (e.g. "4+")
- meleeToHit: the Melee To Hit value (e.g. "4+", "3+")
- rangedToHit: the Ranged To Hit value (e.g. "4+"), or null if shown as "-"
- combat: the Combat stat (number, or "*" for special)
- damage: the Damage stat (number)
- defense: the Defense stat (number)
- health: the Health stat (number)
- xp: the XP value as a string (e.g. "25", "10+5" meaning 10 base + 5 per hero)
- abilities: array of ability strings, each formatted as "Name - Description". Include the full text of each ability. Stars (*) before ability names indicate threat level requirements.
- eliteAbilities: array of elite chart entries, each formatted as "Name - Description". These are in the "Elite Chart" section at the bottom, numbered 1-6.

Rules:
- Read ALL stat numbers carefully from the stat boxes at the bottom of the card
- A star/asterisk (*) in Combat means the value is special (described in abilities)
- Double star (**) in Move means special movement (described in abilities)
- Include star prefixes on abilities (e.g. "*Flailing Tentacles" or "**Eruption From Below")
- XP format: "=25" means flat 25 XP. "=10 +5" means 10 base + 5 per additional hero, write as "10+5"
- NEVER include "Brutal" in the name field — use the isBrutal flag instead
- Return ONLY a valid JSON object, no markdown fences, no explanation`;
  }

  return `You are extracting data from a Shadows of Brimstone card photo.
Card type: ${deckType}

Extract ALL visible text and return a JSON object with these fields (omit fields not present on this card):
- name: the card title (usually large bold text at top of the card)
- flavorText: the lore/narrative text — this is the italic or stylistically different text that sets the scene or tells a story. It is NOT rules text. On encounter cards it usually appears right below the subtitle line before the rules. Capture it completely and verbatim.
- effect: the main rules/mechanical text (everything that describes what the card DOES — dice rolls, tests, damage, conditions, etc.). Do NOT include the flavorText here.
- tags: array of keyword tags or subtypes shown on the card subtitle line (e.g. "Encounter", "Environment", "Cold", "Darkness", "Ritual")
- value: numeric gold/dollar value if shown (integer)
- weight: numeric weight shown after "Wt" (integer)
- hands: how many hands the item requires (1, 2, or 3) — look for hand icons or "Two Handed" / "2 Hands" text
- upgradeSlots: number of upgrade slots shown (integer)
- remainsInPlay: true if the card says "Remains in Play"
- test: skill test string if shown, e.g. "Cunning 5+"
- promoId: promo identifier if shown, e.g. "Promo-110"
- depth: depth level number if this is a depth event card

Rules:
- IMPORTANT: Separate flavorText (narrative/lore, usually italic) from effect (rules/mechanics) carefully. They are different fields.
- Correct obvious OCR-style spelling errors using Shadows of Brimstone context
- Include ALL text — do not truncate or summarize
- Return ONLY a valid JSON object, no markdown fences, no explanation`;
}

async function callClaude(file, prompt, apiKey, maxTokens = 2048) {
  const base64 = await fileToBase64(file);
  const mediaType = getMediaType(file);
  const cleanKey = apiKey.replace(/[^\x20-\x7E]/g, '').trim();

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': cleanKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return (data.content?.[0]?.text || '').trim();
}

function parseJsonResponse(text) {
  const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    const arrMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error(`Could not parse Claude response: ${text.slice(0, 200)}`);
  }
}

/**
 * Scan a single card image using the Claude Vision API.
 * Returns a structured object with the fields extracted from the card.
 */
export async function scanWithClaudeVision(file, deckType, apiKey, extra = {}) {
  const text = await callClaude(file, buildPrompt(deckType, extra), apiKey);
  return parseJsonResponse(text);
}

/**
 * Scan an image containing MULTIPLE cards.
 * Returns an array of structured objects, one per card found.
 */
export async function scanMultiCardImage(file, deckType, apiKey, extra = {}) {
  const singlePrompt = buildPrompt(deckType, extra);
  const multiPrompt = `This image contains MULTIPLE cards laid out together (could be 2-12 cards).
Identify each individual card in the image and extract its data separately.

For each card, use these extraction rules:
${singlePrompt}

Return a JSON ARRAY of objects — one object per card found. Even if you only find one card, wrap it in an array.
Return ONLY the JSON array, no markdown fences, no explanation.`;

  const text = await callClaude(file, multiPrompt, apiKey, 8192);
  const result = parseJsonResponse(text);
  return Array.isArray(result) ? result : [result];
}
