// French and Spanish transliteration mappings
// "Plain" Latin digraph codes <-> accented characters (fully reversible)

// Spanish: code (plain latin) -> accented character
export const spanishForward: Record<string, string> = {
  'ak': 'á',
  'ek': 'é',
  'ik': 'í',
  'ok': 'ó',
  'uk': 'ú',
  'uw': 'ü',
  'nh': 'ñ',
}

// French: code (plain latin) -> accented character
export const frenchForward: Record<string, string> = {
  'ew': 'ë',
  'aw': 'ä',
  'uw': 'ü',
  'ow': 'ö',
  'iw': 'ï',
  'yw': 'ÿ',
  'eh': 'ê',
  'ah': 'â',
  'uh': 'û',
  'oh': 'ô',
  'ih': 'î',
  'ey': 'è',
  'ay': 'à',
  'uy': 'ù',
  'ek': 'é',
  'oe': 'œ',
  'cs': 'ç',
}

// Build the reverse map: accented character -> code
function buildReverse(forward: Record<string, string>): Record<string, string> {
  const reverse: Record<string, string> = {}
  for (const [code, char] of Object.entries(forward)) {
    reverse[char] = code
  }
  return reverse
}

// Convert plain Latin (with digraph codes) -> accented text
// Preserves the case of the first letter of each matched code.
export function transcribeToAccented(text: string, forward: Record<string, string>): string {
  // Longest match first (all codes are 2 chars, but keep this robust)
  const keys = Object.keys(forward).sort((a, b) => b.length - a.length)
  const lower = text.toLowerCase()
  let result = ''
  let i = 0

  while (i < text.length) {
    let matched = false

    for (const key of keys) {
      if (lower.slice(i, i + key.length) === key) {
        const accented = forward[key]
        // Preserve uppercase if the first character of the code was uppercase
        if (text[i] === text[i].toUpperCase() && text[i] !== text[i].toLowerCase()) {
          result += accented.toUpperCase()
        } else {
          result += accented
        }
        i += key.length
        matched = true
        break
      }
    }

    if (!matched) {
      result += text[i]
      i++
    }
  }

  return result
}

// Convert accented text -> plain Latin (with digraph codes)
// Preserves the case of the accented character.
export function transcribeToPlain(text: string, forward: Record<string, string>): string {
  const reverse = buildReverse(forward)
  let result = ''

  for (const ch of text) {
    const lower = ch.toLowerCase()
    if (reverse[lower] !== undefined) {
      const code = reverse[lower]
      // Preserve uppercase by capitalizing the first letter of the code
      if (ch === ch.toUpperCase() && ch !== lower) {
        result += code.charAt(0).toUpperCase() + code.slice(1)
      } else {
        result += code
      }
    } else {
      result += ch
    }
  }

  return result
}

// Build a reference list (code, character) for display
export function buildReference(forward: Record<string, string>): { code: string; char: string }[] {
  return Object.entries(forward).map(([code, char]) => ({ code, char }))
}
