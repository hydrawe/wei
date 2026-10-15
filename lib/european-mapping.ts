import type { KeyDef, Phrase } from "./arabic-mapping"
import type { ReferenceItem } from "./korean-mapping"

const makeMapping = (entries: [string, string][]): KeyDef[][] => [
  entries.map(([latin, char]) => ({ latin, arabic: char, label: latin })),
]
const makeReference = (entries: [string, string][], description: string): ReferenceItem[] =>
  entries.map(([latin, char]) => ({ char, latin, description }))
const replaceCodes = (text: string, entries: [string, string][]) => {
  return [...entries].sort(([a], [b]) => b.length - a.length).reduce(
    (value, [latin, char]) => value.split(latin).join(char),
    text,
  )
}
const identity = (text: string) => text
const ipa = (text: string) => text

const germanEntries: [string, string][] = [
  ["a1", "ä"], ["o1", "ö"], ["u1", "ü"], ["s5", "ß"],
  ...[..."abcdefghijklmnopqrstuvwxyz"].map((char) => [char, char] as [string, string]),
]
export const transcribeGerman = identity
export const transcribeGermanLatin = (text: string) => replaceCodes(text, germanEntries)
export const transcribeGermanIpa = ipa
export const germanKeyboardRows = makeMapping(germanEntries)
export const germanReference = makeReference(germanEntries, "German letter")
export const germanPhrases: Phrase[] = [
  { english: "Hello", arabic: "Hallo", latin: "Hallo" },
  { english: "Thank you", arabic: "Danke", latin: "Danke" },
]

const frenchEntries: [string, string][] = [
  ["e1", "ë"], ["a1", "ä"], ["u1", "ü"], ["o1", "ö"], ["i1", "ï"], ["y1", "ÿ"],
  ["e2", "é"], ["e3", "ê"], ["a3", "â"], ["u3", "û"], ["o3", "ô"], ["i3", "î"],
  ["e4", "è"], ["a4", "à"], ["u4", "ù"], ["c5", "ç"], ["ae", "æ"], ["oe", "œ"],
  ...[..."abcdefghijklmnopqrstuvwxyz"].map((char) => [char, char] as [string, string]),
]
export const transcribeFrench = identity
export const transcribeFrenchLatin = (text: string) => replaceCodes(text, frenchEntries)
export const transcribeFrenchIpa = ipa
export const frenchKeyboardRows = makeMapping(frenchEntries)
export const frenchReference = makeReference(frenchEntries, "French letter")
export const frenchPhrases: Phrase[] = [
  { english: "Hello", arabic: "Bonjour", latin: "Bonjour" },
  { english: "Thank you", arabic: "Merci", latin: "Merci" },
]

const spanishEntries: [string, string][] = [
  ["a2", "á"], ["e2", "é"], ["i2", "í"], ["o2", "ó"], ["u2", "ú"], ["u1", "ü"], ["n5", "ñ"],
  ...[..."abcdefghijklmnopqrstuvwxyz"].map((char) => [char, char] as [string, string]),
]
export const transcribeSpanish = identity
export const transcribeSpanishLatin = (text: string) => replaceCodes(text, spanishEntries)
export const transcribeSpanishIpa = ipa
export const spanishKeyboardRows = makeMapping(spanishEntries)
export const spanishReference = makeReference(spanishEntries, "Spanish letter")
export const spanishPhrases: Phrase[] = [
  { english: "Hello", arabic: "Hola", latin: "Hola" },
  { english: "Thank you", arabic: "Gracias", latin: "Gracias" },
]
