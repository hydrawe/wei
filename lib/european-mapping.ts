import type { KeyDef, Phrase } from "./arabic-mapping"
import type { ReferenceItem } from "./korean-mapping"

const makeMapping = (letters: string[]): KeyDef[][] => [letters.map((char) => ({ latin: char, arabic: char, label: char }))]
const makeReference = (letters: string[], description: string): ReferenceItem[] => letters.map((char) => ({ char, latin: char, description }))
const identity = (text: string) => text
const latinToScript = (text: string) => text
const ipa = (text: string) => text

export const transcribeGerman = identity
export const transcribeGermanLatin = latinToScript
export const transcribeGermanIpa = ipa
export const germanKeyboardRows = makeMapping([...'abcdefghijklmnopqrstuvwxyzäöüß'])
export const germanReference = makeReference([...'abcdefghijklmnopqrstuvwxyzäöüß'], "German letter")
export const germanPhrases: Phrase[] = [
  { english: "Hello", arabic: "Hallo", latin: "Hallo" },
  { english: "Thank you", arabic: "Danke", latin: "Danke" },
]

export const transcribeFrench = identity
export const transcribeFrenchLatin = latinToScript
export const transcribeFrenchIpa = ipa
export const frenchKeyboardRows = makeMapping([...'abcdefghijklmnopqrstuvwxyzàâçéèêëîïôùûüÿœ'])
export const frenchReference = makeReference([...'abcdefghijklmnopqrstuvwxyzàâçéèêëîïôùûüÿœ'], "French letter")
export const frenchPhrases: Phrase[] = [
  { english: "Hello", arabic: "Bonjour", latin: "Bonjour" },
  { english: "Thank you", arabic: "Merci", latin: "Merci" },
]

export const transcribeSpanish = identity
export const transcribeSpanishLatin = latinToScript
export const transcribeSpanishIpa = ipa
export const spanishKeyboardRows = makeMapping([...'abcdefghijklmnñopqrstuvwxyzáéíóúü¿¡'])
export const spanishReference = makeReference([...'abcdefghijklmnñopqrstuvwxyzáéíóúü¿¡'], "Spanish letter")
export const spanishPhrases: Phrase[] = [
  { english: "Hello", arabic: "Hola", latin: "Hola" },
  { english: "Thank you", arabic: "Gracias", latin: "Gracias" },
]

export const europeanReferenceRows = undefined
