// French and Spanish transliteration mappings
// "Plain" Latin digraph codes <-> accented characters (fully reversible)

// Spanish: code (plain latin) -> accented character
export const spanishForward: Record<string, string> = {
  'a2': 'á',
  'e2': 'é',
  'i2': 'í',
  'o2': 'ó',
  'u2': 'ú',
  'u1': 'ü',
  'n0': 'ñ',
}

// French: code (plain latin) -> accented character
export const frenchForward: Record<string, string> = {
  'e1': 'ë',
  'a1': 'ä',
  'u1': 'ü',
  'o1': 'ö',
  'i1': 'ï',
  'y1': 'ÿ',
  'e2': 'é',
  'e3': 'ê',
  'a3': 'â',
  'u3': 'û',
  'o3': 'ô',
  'i3': 'î',
  'e4': 'è',
  'a4': 'à',
  'u4': 'ù',
  'c5': 'ç',
  'ae': 'æ',
  'oe': 'œ',
}

// Portuguese: code (plain latin) -> accented character
export const portugueseForward: Record<string, string> = {
  'a0': 'ã',
  'o0': 'õ',
  'u1': 'ü',
  'a2': 'á',
  'o2': 'ó',
  'e2': 'é',
  'i2': 'í',
  'u2': 'ú',
  'a3': 'â',
  'o3': 'ô',
  'e3': 'ê',
  'a4': 'à',
  'c5': 'ç',
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
