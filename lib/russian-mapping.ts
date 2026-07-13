// Russian (Cyrillic) transliteration mapping.
// Russian is a left-to-right Cyrillic script. Unlike Arabic there are no
// diacritics or consonant doubling (shadda), so we reuse the generic
// scriptToLatin / latinToScript helpers with an EMPTY consonant set.

import { scriptToLatin, latinToScript, type KeyDef, type Phrase } from "./arabic-mapping"

// Cyrillic letter -> Latin code
export const russianMapping: Record<string, string> = {
  // Vowels
  а: "a",
  е: "ye",
  о: "o",
  у: "u",
  и: "i",
  э: "e",
  ё: "yo",
  ю: "yu",
  я: "ya",
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
  // Signs
  ь: "q", // soft sign
  ъ: "qh", // hard sign
}

// Latin code -> Cyrillic letter (reverse of the map above)
export const russianLatinToScriptMap: Record<string, string> = Object.fromEntries(
  Object.entries(russianMapping).map(([cyrillic, latin]) => [latin, cyrillic]),
)

// Russian has no shadda-style doubling, so no consonant is "doublable".
const russianConsonants = new Set<string>()

export function transcribeRussian(text: string): string {
  // Transliteration is case-insensitive for this tool; lowercase so both
  // uppercase and lowercase Cyrillic resolve through the same map.
  return scriptToLatin(text.toLowerCase(), russianMapping, russianConsonants)
}

export function transcribeRussianLatin(text: string): string {
  return latinToScript(text, russianLatinToScriptMap, russianConsonants)
}

// Cyrillic letter -> short description shown in the letter reference
export const russianDescriptions: Record<string, string> = {
  а: 'A - a (like "a" in "father")',
  е: 'Ye - ye (like "ye" in "yes")',
  о: 'O - o (like "o" in "more")',
  у: 'U - u (like "oo" in "boot")',
  и: 'I - i (like "ee" in "see")',
  э: 'E - e (like "e" in "met")',
  ё: 'Yo - yo (like "yo" in "yonder")',
  ю: 'Yu - yu (like "u" in "use")',
  я: 'Ya - ya (like "ya" in "yard")',
  б: "Be - b",
  в: "Ve - v",
  г: "Ge - g (hard g)",
  д: "De - d",
  й: 'Short I - j (like "y" in "boy")',
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
  щ: 'Shcha - sh (a softer, longer "sh")',
  ь: "Soft sign - q (softens the previous consonant)",
  ъ: "Hard sign - qh (hard separator, no sound)",
}

// --- IPA phonetic transcription ---------------------------------------------
// Per-letter IPA using standard Russian values (broad transcription).
export const russianIpa: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "ɡ",
  д: "d",
  е: "je",
  ё: "jo",
  ж: "ʐ",
  з: "z",
  и: "i",
  й: "j",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "x",
  ц: "ts",
  ч: "tɕ",
  ш: "ʂ",
  щ: "ɕː",
  ъ: "", // hard sign - silent
  ь: "ʲ", // soft sign - palatalizes the previous consonant
  э: "ɛ",
  ю: "ju",
  я: "ja",
}

export function transcribeRussianIpa(text: string): string {
  let out = ""
  for (const ch of text.toLowerCase()) {
    const ipa = russianIpa[ch]
    if (ipa !== undefined) out += ipa
    else if (ch === " " || ch === "\n" || ch === "\t") out += ch
    else out += ch
  }
  return out
}

// Virtual keyboard layout, grouped vowels / consonants / signs.
const key = (cyrillic: string): KeyDef => ({ latin: russianMapping[cyrillic], arabic: cyrillic, label: russianMapping[cyrillic] })

export const russianKeyboardRows: KeyDef[][] = [
  ["а", "о", "у", "и", "э", "е", "ё", "ю", "я"].map(key), // vowels: plain then yotated (ye/yo/yu/ya)
  ["б", "в", "г", "д", "ж", "з", "й", "к", "л", "м", "н"].map(key), // consonants
  ["п", "р", "с", "т", "ф", "х", "ц", "ч", "ш", "щ"].map(key), // consonants
  ["ь", "ъ"].map(key), // soft / hard signs
]

// Common Russian phrases (latin derived from the script for consistency)
export const russianPhrases: Phrase[] = [
  { english: "Hello", arabic: "Привет", latin: transcribeRussian("Привет") },
  { english: "Thank you", arabic: "Спасибо", latin: transcribeRussian("Спасибо") },
  { english: "Russian", arabic: "Русский", latin: transcribeRussian("Русский") },
]
