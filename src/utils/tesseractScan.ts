import { createWorker, Worker } from "tesseract.js";

interface ScanResult {
  title: string;
  amount: string;
  date: string;
  rawText: string;
  confidence: {
    title: number;
    amount: number;
    date: number;
  };
}

function preprocessImage(imageData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      let width = img.width;
      let height = img.height;
      if (width < 2000) {
        const scale = 2;
        width *= scale;
        height *= scale;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const bw = gray > 128 ? 255 : 0;
        data[i] = bw;
        data[i + 1] = bw;
        data[i + 2] = bw;
      }

      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageData;
  });
}

function extractAmount(text: string): { value: string; confidence: number } {
  const patterns = [
    /(?:total|amount|sum|grand\s*total|net\s*total|subtotal)[:\s]*[$₹€£]?\s*([\d,]+\.?\d*)/gi,
    /[$₹€£]\s*([\d,]+\.?\d+)/g,
    /([\d,]+\.\d{2})/g,
  ];

  const amounts: { value: number; raw: string }[] = [];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const rawValue = match[1] || match[0];
      const numericValue = parseFloat(rawValue.replace(/,/g, ""));
      if (!isNaN(numericValue) && numericValue > 0 && numericValue < 10000000) {
        amounts.push({ value: numericValue, raw: rawValue });
      }
    }
  }

  if (amounts.length === 0) {
    return { value: "", confidence: 0 };
  }

  amounts.sort((a, b) => b.value - a.value);
  const largest = amounts[0];
  
  return {
    value: largest.value.toFixed(2),
    confidence: 85,
  };
}

function extractDate(text: string): { value: string; confidence: number } {
  const patterns = [
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/g,
    /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/g,
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/gi,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/gi,
  ];

  const monthMap: { [key: string]: string } = {
    jan: "01", feb: "02", mar: "03", apr: "04",
    may: "05", jun: "06", jul: "07", aug: "08",
    sep: "09", oct: "10", nov: "11", dec: "12",
  };

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      let year, month, day;

      if (pattern.source.includes("jan|feb")) {
        if (/^\d+$/.test(match[1])) {
          day = match[1].padStart(2, "0");
          month = monthMap[match[2].toLowerCase().slice(0, 3)];
          year = match[3];
        } else {
          month = monthMap[match[1].toLowerCase().slice(0, 3)];
          day = match[2].padStart(2, "0");
          year = match[3];
        }
      } else if (match[1].length === 4) {
        year = match[1];
        month = match[2].padStart(2, "0");
        day = match[3].padStart(2, "0");
      } else {
        day = match[1].padStart(2, "0");
        month = match[2].padStart(2, "0");
        year = match[3];
      }

      if (year && month && day) {
        return {
          value: `${year}-${month}-${day}`,
          confidence: 80,
        };
      }
    }
  }

  return {
    value: new Date().toISOString().split("T")[0],
    confidence: 30,
  };
}

function extractMerchant(text: string): { value: string; confidence: number } {
  const lines = text.split("\n").filter((line) => line.trim().length > 2);
  
  const excludePatterns = [
    /^\d+$/,
    /^[₹$€£]/,
    /^(date|time|total|amount|cash|card|tax|gst|receipt|invoice)/i,
    /^\d{1,2}[\/\-:]/,
  ];

  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    if (trimmed.length < 3 || trimmed.length > 50) continue;
    
    const isExcluded = excludePatterns.some((pattern) => pattern.test(trimmed));
    if (!isExcluded) {
      return {
        value: trimmed.replace(/[^a-zA-Z0-9\s&'-]/g, "").trim(),
        confidence: 70,
      };
    }
  }

  return {
    value: "Unknown Merchant",
    confidence: 20,
  };
}

let worker: Worker | null = null;

export async function scanReceipt(
  imageData: string,
  onProgress?: (progress: number) => void
): Promise<ScanResult> {
  const preprocessedImage = await preprocessImage(imageData);

  if (!worker) {
    worker = await createWorker("eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text" && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });
    
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.$₹€£/-:, ",
    });
  }

  const { data } = await worker.recognize(preprocessedImage);
  const text = data.text;

  const amount = extractAmount(text);
  const date = extractDate(text);
  const merchant = extractMerchant(text);

  return {
    title: merchant.value,
    amount: amount.value,
    date: date.value,
    rawText: text,
    confidence: {
      title: merchant.confidence,
      amount: amount.confidence,
      date: date.confidence,
    },
  };
}

export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
