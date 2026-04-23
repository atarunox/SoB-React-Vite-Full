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

function buildPrompt(deckType) {
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

/**
 * Scan a card image using the Claude Vision API.
 * Returns a structured object with the fields extracted from the card.
 * Throws if the API key is invalid or the request fails.
 */
export async function scanWithClaudeVision(file, deckType, apiKey) {
  const base64 = await fileToBase64(file);
  const mediaType = getMediaType(file);

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: buildPrompt(deckType) },
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
  const text = (data.content?.[0]?.text || '').trim();

  // Strip markdown fences if present
  const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    const m = jsonStr.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error(`Could not parse Claude response: ${text.slice(0, 200)}`);
  }
}
