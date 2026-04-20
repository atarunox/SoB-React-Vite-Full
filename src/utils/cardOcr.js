// src/utils/cardOcr.js
// Lazy-loads Tesseract.js only when first used, so it doesn't bloat the bundle
// for users who never open the card scanner.

let workerPromise = null;

async function getWorker() {
  if (workerPromise) return workerPromise;
  workerPromise = (async () => {
    const { createWorker } = await import('tesseract.js');
    const w = await createWorker('eng', 1, {
      logger: () => {}, // silence verbose logging
    });
    return w;
  })();
  return workerPromise;
}

/**
 * Preprocess an image for better OCR accuracy on dark card backgrounds.
 * Steps: grayscale → high-contrast threshold → returns data URL.
 */
export function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Grayscale using luminance formula
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // High-contrast threshold — cards are often light text on dark bg
        // Try both dark-on-light and light-on-dark; pick threshold 110
        const val = lum < 110 ? 0 : 255;
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
 * Run OCR on a File object. Returns raw text string.
 * Preprocesses the image first for better accuracy.
 */
export async function runOcr(file, onProgress) {
  const processedUrl = await preprocessImage(file);
  const worker = await getWorker();

  // Re-initialize progress reporting
  if (onProgress) onProgress(10);

  const result = await worker.recognize(processedUrl);
  if (onProgress) onProgress(100);
  return result.data.text;
}

/**
 * Terminate the shared worker (call on unmount if desired).
 */
export async function terminateOcrWorker() {
  if (!workerPromise) return;
  const w = await workerPromise;
  await w.terminate();
  workerPromise = null;
}
