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

  // Ligatures use the Persian long-vowel quality (ɒː) rather than Arabic (aː)
  "لا": "lɒː",
  "لأ": "laʔ",
  "لإ": "leʔ",
  "لآ": "lɒːʔ",
}

// Semivowels behave like a syllable nucleus/glide: they satisfy the vowel
// requirement for a following consonant, so they don't trigger a second
// epenthetic vowel after themselves.
const arabicSemivowels = new Set(["ي", "و", "ی"])

// Short-vowel diacritics. When present they give the exact vowel, so no
// epenthesis is needed.
const shortVowelMarks = new Set(["ً", "ٌ", "ٍ", "َ", "ِ", "ُ"])

// Convert Arabic-script text to an IPA transcription. Mirrors the ligature and
// shadda (gemination) handling used by scriptToLatin so the phonetics line up
// with the transliteration.
//
// Arabic and Persian are usually written without short-vowel diacritics, which
// would otherwise leave consonant clusters unpronounceable (e.g. "سلام" -> /slaːm/).
// To keep the pronunciation readable, we insert a default short vowel between two
// adjacent consonants whenever the writer didn't supply an explicit vowel, so
// "سلام" -> /salaːm/.
export function scriptToIpa(
  text: string,
  ipaMap: Record<string, string>,
  consonantSet: Set<string>,
  defaultVowel: string,
): string {
  let result = ""
  let lastConsonantIpa = ""
  // Whether the previous emitted sound was a consonant not yet followed by a vowel.
  let pendingConsonant = false
  const chars = [...text]

  const emitConsonant = (ipa: string, char: string) => {
    // Two consonants in a row with no vowel between them: insert the default
    // short vowel so the cluster is pronounceable.
    if (pendingConsonant) result += defaultVowel
    result += ipa
    lastConsonantIpa = ipa
    // Semivowels act as their own nucleus, so they don't leave a pending
    // consonant that needs an epenthetic vowel after it.
    pendingConsonant = !arabicSemivowels.has(char)
  }

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    const nextChar = chars[i + 1]

    // Two-character ligatures first (these already encode their own vowels)
    if (nextChar) {
      const ligature = char + nextChar
      if (ipaMap[ligature] !== undefined) {
        // Ligatures such as "لا" begin with a consonant, so insert the default
        // vowel if the previous sound was also an unresolved consonant.
        if (pendingConsonant) result += defaultVowel
        result += ipaMap[ligature]
        lastConsonantIpa = ""
        pendingConsonant = false
        i++
        continue
      }
    }

    // Shadda geminates (doubles) the preceding consonant
    if (char === "ّ") {
      if (lastConsonantIpa) result += lastConsonantIpa
      pendingConsonant = true
      continue
    }

    if (ipaMap[char] !== undefined) {
      if (consonantSet.has(char)) {
        emitConsonant(ipaMap[char], char)
      } else {
        // Vowels (long vowel letters + short-vowel diacritics) and other marks
        result += ipaMap[char]
        // A short-vowel diacritic or long vowel resolves the pending consonant.
        if (shortVowelMarks.has(char) || ipaMap[char] !== "") pendingConsonant = false
        lastConsonantIpa = ""
      }
    } else if (char === " " || char === "\n" || char === "\t") {
      result += char
      lastConsonantIpa = ""
      pendingConsonant = false
    } else {
      // Keep punctuation, numbers, and unknown characters as-is
      result += char
      lastConsonantIpa = ""
      pendingConsonant = false
    }
  }

  return result
}

export function transcribeArabicIpa(text: string): string {
  return scriptToIpa(text, arabicIpa, consonants, "a")
}

export function transcribePersianIpa(text: string): string {
  return scriptToIpa(text, persianIpa, persianConsonants, "e")
}
