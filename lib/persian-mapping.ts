// Persian (Farsi) transliteration mapping.
// Persian uses the Arabic script plus a few extra letters. We reuse the Arabic
// mapping and add the Persian-specific consonants.

import {
  arabicMapping,
  latinToArabicMap,
  consonants,
  arabicDescriptions,
  arabicKeyboardRows,
  arabicPhrases,
  scriptToLatin,
  latinToScript,
  type KeyDef,
  type Phrase,
} from "./arabic-mapping"

// Persian-specific letters -> Latin codes
const persianExtras: Record<string, string> = {
  'ژ': 'zv', // zhe  (like "s" in measure)
  'چ': 'jv', // che  (like English "ch")
  'پ': 'p',  // pe   (like English "p")
  'ک': 'kc', // Persian kaf
  'گ': 'kv', // gaf  (hard "g")
}

// Latin codes -> Persian-specific letters
const persianExtrasReverse: Record<string, string> = {
  'zv': 'ژ',
  'jv': 'چ',
  'p': 'پ',
  'kc': 'ک',
  'kv': 'گ',
}

// Full Persian maps = Arabic maps + Persian extras
export const persianMapping: Record<string, string> = {
  ...arabicMapping,
  ...persianExtras,
}

export const persianLatinToScriptMap: Record<string, string> = {
  ...latinToArabicMap,
  ...persianExtrasReverse,
}

// Persian consonants = Arabic consonants + the new letters (all doublable)
export const persianConsonants = new Set<string>([
  ...consonants,
  'ژ', 'چ', 'پ', 'ک', 'گ',
])

export const persianDescriptions: Record<string, string> = {
  ...arabicDescriptions,
  'پ': 'Pe - p (like English "p")',
  'چ': 'Che - jv (like English "ch")',
  'ژ': 'Zhe - zv (like "s" in "measure")',
  'ک': 'Kaf - kc (Persian "k")',
  'گ': 'Gaf - kv (hard "g")',
}

export function transcribePersian(text: string): string {
  return scriptToLatin(text, persianMapping, persianConsonants)
}

export function transcribePersianLatin(text: string): string {
  return latinToScript(text, persianLatinToScriptMap, persianConsonants)
}

// Persian keyboard = Arabic rows + one extra row with the 5 Persian letters
export const persianKeyboardRows: KeyDef[][] = [
  ...arabicKeyboardRows,
  [
    { latin: 'p', arabic: 'پ', label: 'p' },
    { latin: 'jv', arabic: 'چ', label: 'jv' },
    { latin: 'zv', arabic: 'ژ', label: 'zv' },
    { latin: 'kc', arabic: 'ک', label: 'kc' },
    { latin: 'kv', arabic: 'گ', label: 'kv' },
  ],
]

// Common Persian phrases (latin computed from the script for consistency)
export const persianPhrases: Phrase[] = [
  { english: "Hello", arabic: "سلام", latin: transcribePersian("سلام") },
  { english: "Persian", arabic: "فارسی", latin: transcribePersian("فارسی") },
  { english: "How are you?", arabic: "چطوری", latin: transcribePersian("چطوری") },
]
