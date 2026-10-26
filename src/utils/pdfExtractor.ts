/**
 * Browser-compatible PDF Text Extractor & Utilities
 * Extracts text from PDF files directly in the browser without external binary dependencies.
 * Handles literal text strings, kerning arrays, hex-encoded strings, and FlateDecode streams.
 */

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  fileSizeFormatted: string;
  rawByteLength: number;
}

export function isPdfFile(file: File | { name?: string; type?: string }): boolean {
  if (!file) return false;
  const mime = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return mime === 'application/pdf' || name.endsWith('.pdf');
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as Data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Decompress zlib / FlateDecode byte buffer in the browser
 */
async function decompressFlateStream(bytes: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined' || bytes.length === 0) {
    return '';
  }

  // 1. Try standard zlib wrapped deflate
  try {
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const response = new Response(ds.readable);
    const buffer = await response.arrayBuffer();
    return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  } catch {
    // 2. Try raw deflate (skip 2-byte header and 4-byte checksum)
    try {
      if (bytes.length > 6) {
        const rawBytes = bytes.slice(2, bytes.length - 4);
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(rawBytes);
        writer.close();
        const response = new Response(ds.readable);
        const buffer = await response.arrayBuffer();
        return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      }
    } catch {
      // Decompression fallback
    }
  }

  return '';
}

/**
 * Clean up PDF escaped characters
 */
function cleanPdfString(raw: string): string {
  return raw
    .replace(/\\([\\()])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse text from a string of PDF stream operators
 */
function parseTextFromPdfStream(streamContent: string): string[] {
  const chunks: string[] = [];

  // Match TJ arrays: [(text1) 120 (text2)] TJ
  const tjArrayRegex = /\[((?:[^[\]]|\\[[\]])*)\]\s*TJ/g;
  let arrayMatch: RegExpExecArray | null;
  while ((arrayMatch = tjArrayRegex.exec(streamContent)) !== null) {
    const arrayContent = arrayMatch[1];
    const itemRegex = /\(((?:\\.|[^()\\])*)\)/g;
    let itemMatch: RegExpExecArray | null;
    const lineParts: string[] = [];
    while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
      const cleaned = cleanPdfString(itemMatch[1]);
      if (cleaned) lineParts.push(cleaned);
    }
    if (lineParts.length > 0) {
      chunks.push(lineParts.join(' '));
    }
  }

  // Match single string operators: (text) Tj, (text) ', (text) "
  const singleRegex = /\(((?:\\.|[^()\\])*)\)\s*(?:Tj|'|")/g;
  let singleMatch: RegExpExecArray | null;
  while ((singleMatch = singleRegex.exec(streamContent)) !== null) {
    const cleaned = cleanPdfString(singleMatch[1]);
    if (cleaned) chunks.push(cleaned);
  }

  // Match hex strings: <48656c6c6f> Tj
  const hexRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|'|")/g;
  let hexMatch: RegExpExecArray | null;
  while ((hexMatch = hexRegex.exec(streamContent)) !== null) {
    const hex = hexMatch[1];
    let decoded = '';
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.substring(i, i + 2), 16);
      if (code >= 32 && code <= 126) {
        decoded += String.fromCharCode(code);
      }
    }
    const cleaned = cleanPdfString(decoded);
    if (cleaned) chunks.push(cleaned);
  }

  return chunks;
}

/**
 * Main PDF text extractor
 */
export async function extractTextFromPdf(file: File | ArrayBuffer): Promise<PdfExtractionResult> {
  let arrayBuffer: ArrayBuffer;
  let fileSize = 0;

  if (file instanceof File) {
    fileSize = file.size;
    arrayBuffer = await file.arrayBuffer();
  } else {
    arrayBuffer = file;
    fileSize = arrayBuffer.byteLength;
  }

  const bytes = new Uint8Array(arrayBuffer);
  const rawAscii = new TextDecoder('latin1').decode(bytes);

  // Validate PDF header
  if (!rawAscii.startsWith('%PDF-') && rawAscii.indexOf('%PDF-') === -1) {
    throw new Error('Invalid file format. Please upload a valid PDF document.');
  }

  // Count pages heuristic
  const pageMatches = rawAscii.match(/\/Type\s*\/Page[^s]/g);
  const countMatches = rawAscii.match(/\/Count\s+(\d+)/);
  let pageCount = 1;
  if (countMatches && countMatches[1]) {
    pageCount = Math.max(1, parseInt(countMatches[1], 10));
  } else if (pageMatches) {
    pageCount = Math.max(1, pageMatches.length);
  }

  const extractedLines: string[] = [];

  // 1. Search for all streams in the PDF
  const streamStartRegex = /stream\r?\n/g;
  let match: RegExpExecArray | null;

  while ((match = streamStartRegex.exec(rawAscii)) !== null) {
    const streamStart = match.index + match[0].length;
    const streamEnd = rawAscii.indexOf('endstream', streamStart);
    if (streamEnd === -1) continue;

    // Check header before stream for /FlateDecode
    const headerSlice = rawAscii.slice(Math.max(0, match.index - 350), match.index);
    const isFlate = /\/Filter\s*(?:\[\s*)?\/FlateDecode/i.test(headerSlice);

    const streamBytes = bytes.slice(streamStart, streamEnd);

    let decodedContent = '';
    if (isFlate) {
      decodedContent = await decompressFlateStream(streamBytes);
    } else {
      decodedContent = new TextDecoder('latin1').decode(streamBytes);
    }

    if (decodedContent) {
      const lines = parseTextFromPdfStream(decodedContent);
      if (lines.length > 0) {
        extractedLines.push(...lines);
      }
    }
  }

  // 2. Also parse any uncompressed literal strings in the document body
  const uncompressedLines = parseTextFromPdfStream(rawAscii);
  if (uncompressedLines.length > 0) {
    extractedLines.push(...uncompressedLines);
  }

  // 3. Deduplicate and clean lines
  const seen = new Set<string>();
  const cleanedTextLines: string[] = [];

  for (const line of extractedLines) {
    const trimmed = line.trim();
    // Filter out PDF syntax fragments
    if (!trimmed || trimmed.startsWith('/') || trimmed.length < 2) continue;
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      cleanedTextLines.push(trimmed);
    }
  }

  let finalResumeText = cleanedTextLines.join('\n');

  // If text extraction yielded limited words, extract ASCII word tokens as fallback
  if (finalResumeText.split(/\s+/).length < 20) {
    const tokenRegex = /[A-Za-z0-9+#.]{2,30}/g;
    const words = rawAscii.match(tokenRegex) || [];
    const technicalKeywords = words.filter(w => 
      /^(python|java|javascript|typescript|react|html|css|sql|c\+\+|fastapi|aws|docker|linux|django|git|dsa|b\.tech|gpa|cgpa|engineer|developer|intern|experience|projects|education|skills|certifications)$/i.test(w)
    );
    if (technicalKeywords.length > 5) {
      finalResumeText = (finalResumeText ? finalResumeText + '\n' : '') + technicalKeywords.join(' ');
    }
  }

  return {
    text: finalResumeText,
    pageCount,
    fileSizeFormatted: formatFileSize(fileSize),
    rawByteLength: fileSize,
  };
}
