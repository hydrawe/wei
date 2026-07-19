// Ukrainian (Cyrillic) transliteration mapping.
// Ukrainian is a left-to-right Cyrillic script. Like Russian there are no
// diacritics or consonant doubling (shadda), so we reuse the generic
// scriptToLatin / latinToScript helpers with an EMPTY consonant set.
//
// This scheme also includes the Russian-only letters (ё, э, ы, ъ) alongside
// the Ukrainian-specific letters (ґ, є, і, ї) so the full code chart is
// covered by a single map.

import { scriptToLatin, latinToScript, type KeyDef, type Phrase } from "./arabic-mapping"

// Cyrillic letter -> Latin code
export const ukrainianMapping: Record<string, string> = {
  // Vowels
  а: "a",
  е: "ye",
  о: "o",
  и: "i",
  у: "u",
  ю: "yu",
  я: "ya",
  ё: "yo",
  э: "yi",
  ы: "e",
  є: "eh",
  і: "ih",
  ї: "yh",
  // Consonants
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  й: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  п: "p",
  р: "r",
  т: "t",
  ф: "f",
  з: "z",
  ц: "c",
  с: "s",
  х: "x",
  ж: "zh",
  ч: "ch",
  ш: "xh",
  щ: "sh",
  ґ: "gh",
  // Signs
  ь: "q", // soft sign
  ъ: "qh", // hard sign
}

// Latin code -> Cyrillic letter (reverse of the map above)
export const ukrainianLatinToScriptMap: Record<string, string> = Object.fromEntries(
  Object.entries(ukrainianMapping).map(([cyrillic, latin]) => [latin, cyrillic]),
)

// Ukrainian has no shadda-style doubling, so no consonant is "doublable".
const ukrainianConsonants = new Set<string>()

export function transcribeUkrainian(text: string): string {
  // Transliteration is case-insensitive for this tool; lowercase so both
  // uppercase and lowercase Cyrillic resolve through the same map.
  return scriptToLatin(text.toLowerCase(), ukrainianMapping, ukrainianConsonants)
}

export function transcribeUkrainianLatin(text: string): string {
  return latinToScript(text, ukrainianLatinToScriptMap, ukrainianConsonants)
}

// Cyrillic letter -> short description shown in the letter reference
export const ukrainianDescriptions: Record<string, string> = {
  а: 'A - a (like "a" in "father")',
  е: 'E - ye (like "e" in "met")',
  о: 'O - o (like "o" in "more")',
  и: 'Y - i (like "y" in "myth")',
  у: 'U - u (like "oo" in "boot")',
  ю: 'Yu - yu (like "u" in "use")',
  я: 'Ya - ya (like "ya" in "yard")',
  ё: 'Yo - yo (like "yo" in "yonder")',
  э: 'E - yi (like "e" in "met")',
  ы: 'Yery - e (like "i" in "bill", further back)',
  є: 'Ye - eh (like "ye" in "yes")',
  і: 'I - ih (like "ee" in "see")',
  ї: 'Yi - yh (like "yea" in "yeast")',
  б: "Be - b",
  в: 'Ve - v (like "w"/"v")',
  г: 'He - g (voiced "h", like "h" in "aha")',
  д: "De - d",
  й: 'Yot - j (like "y" in "boy")',
  к: "Ka - k",
  л: "El - l",
  м: "Em - m",
  н: "En - n",
  п: "Pe - p",
  р: "Er - r (rolled/trilled)",
  т: "Te - t",
  ф: "Ef - f",
  з: "Ze - z",
  ц: 'Tse - c (like "ts" in "cats")',
  с: "Es - s",
  х: 'Kha - x (like "ch" in Scottish "loch")',
  ж: 'Zhe - zh (like "s" in "measure")',
  ч: 'Che - ch (like "ch" in "church")',
  ш: 'Sha - xh (like "sh" in "shoe")',
  щ: 'Shcha - sh (like "shch" in "fresh cheese")',
  ґ: "Ge - gh (hard g, like in “go”)",
  ь: "Soft sign - q (softens the previous consonant)",
  ъ: "Hard sign - qh (hard separator, no sound)",
}

// --- IPA phonetic transcription ---------------------------------------------
// Per-letter IPA using standard Ukrainian values (broad transcription).
export const ukrainianIpa: Record<string, string> = {
  а: "ɑ",
  б: "b",
  в: "ʋ",
  г: "ɦ", // voiced glottal fricative (distinct from ґ)
  ґ: "ɡ", // hard g
  д: "d",
  е: "ɛ",
  є: "jɛ",
  ж: "ʒ",
  з: "z",
  и: "ɪ",
  і: "i",
  ї: "ji",
  й: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "ɔ",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "x",
  ц: "ts",
  ч: "tʃ",
  ш: "ʃ",
  щ: "ʃtʃ",
  ь: "ʲ", // soft sign - palatalizes the previous consonant
  ъ: "", // hard sign - silent
  // Russian-inherited letters included in the code chart
  ё: "jɔ",
  э: "ɛ",
  ы: "ɪ",
  ю: "ju",
  я: "jɑ",
}

export function transcribeUkrainianIpa(text: string): string {
  let out = ""
  for (const ch of text.toLowerCase()) {
    const ipa = ukrainianIpa[ch]
    if (ipa !== undefined) out += ipa
    else if (ch === " " || ch === "\n" || ch === "\t") out += ch
    else out += ch
  }
  return out
}

// Virtual keyboard layout, grouped vowels / consonants / signs.
const key = (cyrillic: string): KeyDef => ({
  latin: ukrainianMapping[cyrillic],
  arabic: cyrillic,
  label: ukrainianMapping[cyrillic],
})

export const ukrainianKeyboardRows: KeyDef[][] = [
  ["а", "о", "у", "и", "і", "ы", "е", "э"].map(key), // plain vowels
  ["я", "ю", "є", "ї", "ё"].map(key), // yotated vowels
  ["б", "в", "г", "ґ", "д", "ж", "з", "й", "к", "л", "м", "н"].map(key), // consonants
  ["п", "р", "с", "т", "ф", "х", "ц", "ч", "ш", "щ"].map(key), // consonants
  ["ь", "ъ"].map(key), // soft / hard signs
]

// Common Ukrainian phrases (latin derived from the script for consistency)
export const ukrainianPhrases: Phrase[] = [
  { english: "Hello", arabic: "Привіт", latin: transcribeUkrainian("Привіт") },
  { english: "Thank you", arabic: "Дякую", latin: transcribeUkrainian("Дякую") },
  { english: "Ukrainian", arabic: "Українська", latin: transcribeUkrainian("Українська") },
]
