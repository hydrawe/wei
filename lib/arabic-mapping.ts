// Arabic to transliteration mapping based on the provided table

export const arabicMapping: Record<string, string> = {
  // Hamza variants
  'آ': 'ao',
  'ء': 'e',
  'أ': 'ae',
  'ئ': 'ye',
  'ؤ': 'we',
  'إ': 'ie',
  'ٱ': 'o', // alif wasl
  'ة': 'hh', // ta marbuta - feminine ending

  // Alif variants
  'ا': 'a',
  'ى': 'ya',
  'ٰ': 'ap', // dagger alif (superscript alif)
  'اٰ': 'ap', // alif with dagger alif

  // Semi-vowels
  'ي': 'y',
  'و': 'w',

  // Consonants
  'ر': 'r',
  'ز': 'z',
  'د': 'd',
  'ذ': 'dh',
  'ت': 't',
  'ث': 'th',
  'س': 's',
  'ل': 'l',
  'ن': 'n',
  'ش': 'sh',
  'ص': 'sr',
  'ض': 'dr',
  'ط': 'tr',
  'ظ': 'zr',
  'ب': 'b',
  'ف': 'f',
  'ك': 'k',
  'ق': 'q',
  'ع': 'g',
  'غ': 'gh',
  'ه': 'h',
  'ﻫ': 'h', // alternate form
  'ج': 'j',
  'ح': 'x',
  'خ': 'xh',
  'م': 'm',

  // Diacritics (vowel marks)
  'ً': 'av', // tanwin fatha (accusative)
  'ٌ': 'uv', // tanwin damma (nominative)
  'ٍ': 'iv', // tanwin kasra (genitive)
  'ْ': '', // sukun (silent)
  'َ': 'ac', // fatha
  'ِ': 'ic', // kasra
  'ُ': 'uc', // damma
  'ّ': '', // shadda (handled specially - doubles the consonant)

  // Common ligatures
  'لا': 'la',
  'لأ': 'lae',
  'لإ': 'lie',
  'لآ': 'lao',
}

// Letters that can be doubled with shadda
export const consonants = new Set([
  'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
  'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'ي', 'و'
])

export function transcribeArabic(text: string): string {
  let result = ''
  const chars = [...text] // Handle multi-byte characters properly

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    const nextChar = chars[i + 1]

    // Check for ligatures first (two-character combinations)
    if (nextChar) {
      const ligature = char + nextChar
      if (arabicMapping[ligature] !== undefined) {
        result += arabicMapping[ligature]
        i++ // Skip next character
        continue
      }
    }

    // Handle shadda (doubles the previous consonant)
    if (char === 'ّ') {
      // Find the last consonant in the result and double it
      const lastConsonant = result.slice(-1)
      if (lastConsonant) {
        result += lastConsonant
      }
      continue
    }

    // Regular character mapping
    if (arabicMapping[char] !== undefined) {
      result += arabicMapping[char]
    } else if (char === ' ' || char === '\n' || char === '\t') {
      result += char // Preserve whitespace
    } else if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(char)) {
      // Unknown Arabic character - keep as is with marker
      result += `[${char}]`
    } else {
      // Non-Arabic character (punctuation, numbers, etc.)
      result += char
    }
  }

  return result
}

// Reverse mapping: Latin transliteration -> Arabic character
const latinToArabicMap: Record<string, string> = {
  // Multi-character mappings (digraphs) - must be checked first (longest match)
  'ao': 'آ',
  'ye': 'ئ',
  'we': 'ؤ',
  'ie': 'إ',
  'lao': 'لآ',
  'lie': 'لإ',
  'lae': 'لأ',
  'ae': 'أ',
  'la': 'لا',
  'dh': 'ذ',
  'th': 'ث',
  'sh': 'ش',
  'gh': 'غ',
  'av': 'ً',
  'iv': 'ٍ',
  'uv': 'ٌ',
  'hh': 'ة',
  'ap': 'اٰ',
  'ya': 'ى',
  'o': 'ٱ',
  // Single character mappings
  'e': 'ء',
  'a': 'ا',
  'y': 'ي',
  'w': 'و',
  'r': 'ر',
  'z': 'ز',
  'd': 'د',
  't': 'ت',
  's': 'س',
  'l': 'ل',
  'n': 'ن',
  'sr': 'ص',
  'dr': 'ض',
  'tr': 'ط',
  'zr': 'ظ',
  'b': 'ب',
  'f': 'ف',
  'k': 'ك',
  'q': 'ق',
  'g': 'ع',
  'h': 'ه',
  'j': 'ج',
  'x': 'ح',
  'xh': 'خ',
  'm': 'م',
  'p': 'ّ',
  'ic': 'ِ',
  'uc': 'ُ',
  'ac': 'َ',
}

// Sort keys by length (longest first) for greedy matching
const sortedLatinKeys = Object.keys(latinToArabicMap).sort((a, b) => b.length - a.length)

export function transcribeLatin(text: string): string {
  let result = ''
  let i = 0

  while (i < text.length) {
    let matched = false

    // Try to match the longest possible sequence first
    for (const key of sortedLatinKeys) {
      if (text.slice(i, i + key.length) === key) {
        result += latinToArabicMap[key]
        i += key.length
        matched = true
        break
      }
    }

    if (!matched) {
      // Keep non-mapped characters as-is (spaces, punctuation, etc.)
      result += text[i]
      i++
    }
  }

  return result
}

// Get description for an Arabic character
export const arabicDescriptions: Record<string, string> = {
  'آ': 'Alif with madda - ao',
  'ء': 'Hamza - glottal stop (e)',
  'أ': 'Alif with hamza above - ae',
  'ئ': 'Ya with hamza - ye',
  'ؤ': 'Waw with hamza - we',
  'إ': 'Alif with hamza below - ie',
  'ٱ': 'Alif wasl - o',
  'ة': 'Ta marbuta - feminine ending (hh)',
  'ا': 'Alif - a',
  'ى': 'Alif maqsura - ya (at end)',
  'ٰ': 'Dagger alif - ap (superscript alif)',
  'ي': 'Ya - y',
  'و': 'Waw - w',
  'ر': 'Ra - r (like "t" in American "water")',
  'ز': 'Zayn - z',
  'د': 'Dal - d',
  'ذ': 'Dhal - dh (heavier than th)',
  'ت': 'Ta - t',
  'ث': 'Tha - th',
  'س': 'Sin - s (air through tongue tip and upper teeth)',
  'ل': 'Lam - l (tongue on upper mouth)',
  'ن': 'Nun - n',
  'ش': 'Shin - sh',
  'ص': 'Sad - sr (stressed s, thicker)',
  'ض': 'Dad - dr',
  'ط': 'Ta (emphatic) - tr (back of mouth)',
  'ظ': 'Za (emphatic) - zr (further back)',
  'ب': 'Ba - b',
  'ف': 'Fa - f',
  'ك': 'Kaf - k',
  'ق': 'Qaf - q (deep in throat)',
  'ع': 'Ayn - g (surprised "a")',
  'غ': 'Ghayn - gh (gargling sound)',
  'ه': 'Ha - h',
  'ج': 'Jim - j',
  'ح': 'Ha (emphatic) - x (fogging up window)',
  'خ': 'Kha - xh (whispered gargle)',
  'م': 'Mim - m',
}
