import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

let purifyInstance: any = null;

function getPurify() {
  if (!purifyInstance) {
    const window = new JSDOM('').window;
    purifyInstance = DOMPurify(window);
  }
  return purifyInstance;
}

/**
 * Robustly sanitizes an HTML/Markdown string server-side to prevent stored XSS.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  try {
    const purify = getPurify();
    return purify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img',
        'span'
      ],
      ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'title', 'class', 'style', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
    });
  } catch (error) {
    console.error('HTML Sanitization error:', error);
    return html; // Fallback to original in case of initialization failure
  }
}

/**
 * Sanitizes block JSON content recursively before database storage.
 */
export function sanitizeBlocks(blocksValue: any): string {
  if (!blocksValue) return '[]';
  try {
    const blocks = typeof blocksValue === 'string' ? JSON.parse(blocksValue) : blocksValue;
    if (!Array.isArray(blocks)) return '[]';

    const sanitized = blocks.map(block => {
      if (!block || typeof block !== 'object') return block;
      const data = block.data || {};
      const sanitizedData: Record<string, any> = {};

      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          // If it looks like HTML, sanitize it
          if (value.includes('<') && (value.includes('>') || value.includes('/>'))) {
            sanitizedData[key] = sanitizeHtml(value);
          } else {
            sanitizedData[key] = value;
          }
        } else if (Array.isArray(value)) {
          // Handle array of nested objects (e.g. features or process steps)
          sanitizedData[key] = value.map(item => {
            if (item && typeof item === 'object') {
              const sanitizedItem: Record<string, any> = {};
              for (const [k, v] of Object.entries(item)) {
                if (typeof v === 'string' && v.includes('<') && (v.includes('>') || v.includes('/>'))) {
                  sanitizedItem[k] = sanitizeHtml(v);
                } else {
                  sanitizedItem[k] = v;
                }
              }
              return sanitizedItem;
            }
            return item;
          });
        } else {
          sanitizedData[key] = value;
        }
      }

      return {
        ...block,
        data: sanitizedData
      };
    });

    return JSON.stringify(sanitized);
  } catch (e) {
    console.error('Block sanitization failed:', e);
    return typeof blocksValue === 'string' ? blocksValue : JSON.stringify(blocksValue);
  }
}
