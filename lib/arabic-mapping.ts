// Arabic to transliteration mapping based on the provided table

export const arabicMapping: Record<string, string> = {
  // Hamza variants
  'آ': 'eaa',
  'ء': 'e',
  'أ': 'ea',
  'ئ': 'yee',
  'ؤ': 'wee',
  'إ': 'aee',
  'ٱ': '', // silent when previous word ends in vowel
  'ة': 'a', // ta marbuta - contextual, default to 'a'

  // Alif variants
  'ا': 'a',
  'ى': 'I',
  'اٰ': 'aa', // dagger alif

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
  'ص': 'S',
  'ض': 'D',
  'ط': 'T',
  'ظ': 'Z',
  'ب': 'b',
  'ف': 'f',
  'ك': 'k',
  'ق': 'q',
  'ع': 'g',
  'غ': 'gh',
  'ه': 'h',
  'ﻫ': 'h', // alternate form
  'ج': 'j',
  'ح': 'H',
  'خ': 'K',
  'م': 'm',

  // Diacritics (vowel marks)
  'ً': 'an', // tanwin fatha (accusative)
  'ٌ': 'un', // tanwin damma (nominative)
  'ٍ': 'in', // tanwin kasra (genitive)
  'ْ': '', // sukun (silent)
  'َ': 'a', // fatha
  'ِ': 'i', // kasra
  'ُ': 'u', // damma
  'ّ': '', // shadda (handled specially - doubles the consonant)

  // Common ligatures
  'لا': 'la',
  'لأ': 'lea',
  'لإ': 'laee',
  'لآ': 'leaa',
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

// Get description for an Arabic character
export const arabicDescriptions: Record<string, string> = {
  'آ': 'Alif with madda - eaa',
  'ء': 'Hamza - glottal stop (e)',
  'أ': 'Alif with hamza above - ea',
  'ئ': 'Ya with hamza - yee',
  'ؤ': 'Waw with hamza - wee',
  'إ': 'Alif with hamza below - aee',
  'ٱ': 'Alif wasl - silent when previous word ends in vowel',
  'ة': 'Ta marbuta - feminine ending (a/ha/at)',
  'ا': 'Alif - a (beginning), I (end)',
  'ى': 'Alif maqsura - I (at end)',
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
  'ص': 'Sad - S (stressed s, thicker)',
  'ض': 'Dad - D',
  'ط': 'Ta (emphatic) - T (back of mouth)',
  'ظ': 'Za (emphatic) - Z (further back)',
  'ب': 'Ba - b',
  'ف': 'Fa - f',
  'ك': 'Kaf - k',
  'ق': 'Qaf - q (deep in throat)',
  'ع': 'Ayn - g (surprised "a")',
  'غ': 'Ghayn - gh (gargling sound)',
  'ه': 'Ha - h',
  'ج': 'Jim - j',
  'ح': 'Ha (emphatic) - H (fogging up window)',
  'خ': 'Kha - K (whispered gargle)',
  'م': 'Mim - m',
}
