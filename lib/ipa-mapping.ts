// IPA (International Phonetic Alphabet) mappings for the Arabic-script tabs.
// These give an accessible, standardized phonetic notation for any word the
// user types, so learners and screen-reader users can read the pronunciation
// without relying on audio.

import { consonants } from "./arabic-mapping"
import { persianConsonants } from "./persian-mapping"

// Script character -> IPA symbol(s) for Modern Standard Arabic.
export const arabicIpa: Record<string, string> = {
  // Hamza + alif variants (glottal stop / long a)
  "آ": "ʔaː",
  "ء": "ʔ",
  "أ": "ʔ",
  "ئ": "ʔ",
  "ؤ": "ʔ",
  "إ": "ʔ",
  "ٱ": "", // alif wasl - usually silent
  "ة": "a", // ta marbuta - feminine ending
  "ا": "aː",
  "ى": "aː",
  "ٰ": "aː",

  // Semi-vowels
  "ي": "j",
  "و": "w",

  // Consonants
  "ر": "r",
  "ز": "z",
  "د": "d",
  "ذ": "ð",
  "ت": "t",
  "ث": "θ",
  "س": "s",
  "ل": "l",
  "ن": "n",
  "ش": "ʃ",
  "ص": "sˤ",
  "ض": "dˤ",
  "ط": "tˤ",
  "ظ": "ðˤ",
  "ب": "b",
  "ف": "f",
  "ك": "k",
  "ق": "q",
  "ع": "ʕ",
  "غ": "ɣ",
  "ه": "h",
  "ﻫ": "h",
  "ج": "d͡ʒ",
  "ح": "ħ",
  "خ": "x",
  "م": "m",

  // Diacritics (short vowels / nunation)
  "ً": "an",
  "ٌ": "un",
  "ٍ": "in",
  "ْ": "", // sukun - no vowel
  "َ": "a",
  "ِ": "i",
  "ُ": "u",
  "ّ": "", // shadda - handled specially (gemination)

  // Ligatures
  "لا": "laː",
  "لأ": "laʔ",
  "لإ": "liʔ",
  "لآ": "laːʔ",
}

// Persian shares the Arabic script but several letters are pronounced
// differently, so we override those and add the Persian-specific letters.
export const persianIpa: Record<string, string> = {
  ...arabicIpa,

  // Vowels lean toward Persian qualities
  "ا": "ɒː",
  "آ": "ʔɒː",
  "َ": "æ",
  "ُ": "o",
  "ِ": "e",

  // Merged consonants in Persian phonology
  "ث": "s",
  "ذ": "z",
  "ص": "s",
  "ض": "z",
  "ط": "t",
  "ظ": "z",
  "ع": "ʔ",
  "ق": "ɢ",
  "غ": "ɢ",
  "و": "v",
  "ح": "h",
  "ي": "j",

  // Persian-specific letters
  "ژ": "ʒ",
  "چ": "t͡ʃ",
  "پ": "p",
  "ک": "k",
  "گ": "ɡ",
  "ی": "j", // Farsi yeh (U+06CC)
}

// Convert Arabic-script text to an IPA transcription. Mirrors the ligature and
// shadda (gemination) handling used by scriptToLatin so the phonetics line up
// with the transliteration.
export function scriptToIpa(text: string, ipaMap: Record<string, string>, consonantSet: Set<string>): string {
  let result = ""
  let lastConsonantIpa = ""
  const chars = [...text]

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    const nextChar = chars[i + 1]

    // Two-character ligatures first
    if (nextChar) {
      const ligature = char + nextChar
      if (ipaMap[ligature] !== undefined) {
        result += ipaMap[ligature]
        lastConsonantIpa = ""
        i++
        continue
      }
    }

    // Shadda geminates (doubles) the preceding consonant
    if (char === "ّ") {
      if (lastConsonantIpa) result += lastConsonantIpa
      continue
    }

    if (ipaMap[char] !== undefined) {
      result += ipaMap[char]
      lastConsonantIpa = consonantSet.has(char) ? ipaMap[char] : ""
    } else if (char === " " || char === "\n" || char === "\t") {
      result += char
      lastConsonantIpa = ""
    } else {
      // Keep punctuation, numbers, and unknown characters as-is
      result += char
      lastConsonantIpa = ""
    }
  }

  return result
}

export function transcribeArabicIpa(text: string): string {
  return scriptToIpa(text, arabicIpa, consonants)
}

export function transcribePersianIpa(text: string): string {
  return scriptToIpa(text, persianIpa, persianConsonants)
}
