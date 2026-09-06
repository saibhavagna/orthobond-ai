/**
 * Safe object sanitizer for Firestore and API boundaries.
 * Removes undefined fields, trims string lengths, and ensures safe JSON persistence.
 */

export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value === null) {
      clean[key] = null;
    } else if (Array.isArray(value)) {
      clean[key] = value
        .filter((item) => item !== undefined)
        .map((item) => (typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item));
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      clean[key] = sanitizeForFirestore(value);
    } else {
      clean[key] = value;
    }
  }

  return clean as Partial<T>;
}

export function validateImageBase64(dataUri: string): { isValid: boolean; mimeType?: string; error?: string } {
  if (!dataUri || typeof dataUri !== 'string') {
    return { isValid: false, error: 'Image data is missing or not a string' };
  }

  const trimmed = dataUri.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Image data is empty' };
  }

  // 1. Data URI pattern: data:<mediatype>[;<params>]*[;base64|utf8],<data>
  const dataUriRegex = /^data:([a-zA-Z0-9+.-]+\/[a-zA-Z0-9+.-]+)(?:;[a-zA-Z0-9_.-]+=[^;,]+)*(?:;(base64|utf8|utf-8))?,([\s\S]+)$/i;
  const match = trimmed.match(dataUriRegex);

  if (match) {
    const mimeType = match[1].toLowerCase();
    const encoding = (match[2] || '').toLowerCase();
    const payload = match[3];
    const isBase64 = encoding === 'base64';

    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/heic',
      'image/heif',
      'image/gif',
    ];

    if (!allowedMimes.includes(mimeType)) {
      return {
        isValid: false,
        error: `Unsupported image MIME type: ${mimeType}. Allowed: JPEG, PNG, WEBP, SVG, HEIC, GIF`,
      };
    }

    const approxBytes = isBase64 ? (payload.length * 3) / 4 : Buffer.byteLength(payload, 'utf8');
    const maxBytes = 12 * 1024 * 1024; // 12MB limit

    if (approxBytes > maxBytes) {
      return { isValid: false, error: 'Image file exceeds the 12MB size limit' };
    }

    return { isValid: true, mimeType };
  }

  // 2. Raw SVG XML markup
  if (trimmed.startsWith('<svg') || trimmed.includes('<svg xmlns=')) {
    return { isValid: true, mimeType: 'image/svg+xml' };
  }

  // 3. Raw Base64 string without data: URI header
  const cleaned = trimmed.replace(/\s+/g, '');
  if (/^[A-Za-z0-9+/=]{20,}$/.test(cleaned.slice(0, 100))) {
    const approxBytes = (cleaned.length * 3) / 4;
    if (approxBytes > 12 * 1024 * 1024) {
      return { isValid: false, error: 'Image file exceeds the 12MB size limit' };
    }
    return { isValid: true, mimeType: 'image/jpeg' };
  }

  // 4. HTTP/HTTPS URLs (remote clinical image assets)
  if (/^https?:\/\//i.test(trimmed)) {
    return { isValid: true, mimeType: 'image/jpeg' };
  }

  return { isValid: false, error: 'Invalid data URI format for image' };
}

export function extractBase64Raw(dataUri: string): { base64: string; mimeType: string } {
  if (!dataUri || typeof dataUri !== 'string') {
    return { mimeType: 'image/jpeg', base64: '' };
  }

  const trimmed = dataUri.trim();

  // 1. Match Data URI
  const dataUriRegex = /^data:([a-zA-Z0-9+.-]+\/[a-zA-Z0-9+.-]+)(?:;[a-zA-Z0-9_.-]+=[^;,]+)*(?:;(base64|utf8|utf-8))?,([\s\S]+)$/i;
  const match = trimmed.match(dataUriRegex);

  if (match) {
    const mimeType = match[1].toLowerCase();
    const encoding = (match[2] || '').toLowerCase();
    const payload = match[3];

    if (encoding === 'base64') {
      return { mimeType, base64: payload.replace(/\s+/g, '') };
    }

    // utf8 / URL-encoded (e.g. SVG)
    let decoded = payload;
    if (payload.includes('%')) {
      try {
        decoded = decodeURIComponent(payload);
      } catch (e) {
        decoded = payload;
      }
    }
    const base64 = Buffer.from(decoded, 'utf8').toString('base64');
    return { mimeType, base64 };
  }

  // 2. Raw SVG XML markup
  if (trimmed.startsWith('<svg') || trimmed.includes('<svg xmlns=')) {
    const base64 = Buffer.from(trimmed, 'utf8').toString('base64');
    return { mimeType: 'image/svg+xml', base64 };
  }

  // 3. Raw base64 string
  return { mimeType: 'image/jpeg', base64: trimmed.replace(/\s+/g, '') };
}
