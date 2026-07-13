// Korean (Hangul) transliteration mapping.
//
// Korean syllables are composed from jamo: an initial consonant (choseong),
// a medial vowel (jungseong), and an optional final consonant (jongseong).
// We map Latin codes to jamo and compose them into precomposed Hangul syllable
// blocks using the Unicode algorithm:
//   code = 0xAC00 + (L * 21 + V) * 28 + T
// where L = choseong index (0-18), V = jungseong index (0-20),
// T = jongseong index (0 = none, 1-27).

import type { KeyDef, Phrase } from "./arabic-mapping"

export type { KeyDef, Phrase }

const HANGUL_BASE = 0xac00
const HANGUL_LAST = 0xd7a3

// --- Initial consonants (choseong), index 0-18 -----------------------------
// [latin code, compatibility jamo for display]
const LEAD: [string, string][] = [
  ["g", "ㄱ"],
  ["gg", "ㄲ"],
  ["n", "ㄴ"],
  ["d", "ㄷ"],
  ["dd", "ㄸ"],
  ["l", "ㄹ"],
  ["m", "ㅁ"],
  ["b", "ㅂ"],
  ["bb", "ㅃ"],
  ["s", "ㅅ"],
  ["ss", "ㅆ"],
  ["v", "ㅇ"], // silent / "ng" placeholder as an initial
  ["j", "ㅈ"],
  ["jj", "ㅉ"],
  ["c", "ㅊ"],
  ["k", "ㅋ"],
  ["t", "ㅌ"],
  ["p", "ㅍ"],
  ["h", "ㅎ"],
]

// --- Vowels (jungseong), index 0-20 ----------------------------------------
const VOWEL: [string, string][] = [
  ["a", "ㅏ"],
  ["ay", "ㅐ"],
  ["ia", "ㅑ"],
  ["iay", "ㅒ"],
  ["e", "ㅓ"],
  ["ey", "ㅔ"],
  ["ie", "ㅕ"],
  ["iey", "ㅖ"],
  ["o", "ㅗ"],
  ["oa", "ㅘ"],
  ["oay", "ㅙ"],
  ["oy", "ㅚ"],
  ["io", "ㅛ"],
  ["u", "ㅜ"],
  ["ue", "ㅝ"],
  ["uey", "ㅞ"],
  ["uy", "ㅟ"],
  ["iu", "ㅠ"],
  ["w", "ㅡ"],
  ["wy", "ㅢ"],
  ["y", "ㅣ"],
]

// --- Final consonants (jongseong), index 1-27 (0 = none) -------------------
// Every final code ends with "x", which keeps them unambiguous from initials.
const TAIL: [string, string][] = [
  ["gx", "ㄱ"],
  ["ggx", "ㄲ"],
  ["gsx", "ㄳ"],
  ["nx", "ㄴ"],
  ["njx", "ㄵ"],
  ["nhx", "ㄶ"],
  ["dx", "ㄷ"],
  ["lx", "ㄹ"],
  ["lgx", "ㄺ"],
  ["lmx", "ㄻ"],
  ["lbx", "ㄼ"],
  ["lsx", "ㄽ"],
  ["ltx", "ㄾ"],
  ["lpx", "ㄿ"],
  ["lhx", "ㅀ"],
  ["mx", "ㅁ"],
  ["bx", "ㅂ"],
  ["bsx", "ㅄ"],
  ["sx", "ㅅ"],
  ["ssx", "ㅆ"],
  ["vx", "ㅇ"],
  ["jx", "ㅈ"],
  ["cx", "ㅊ"],
  ["kx", "ㅋ"],
  ["tx", "ㅌ"],
  ["px", "ㅍ"],
  ["hx", "ㅎ"],
]

const SILENT_LEAD = 11 // ㅇ

// latin code -> { type, index }
type Token = { type: "L" | "V" | "T"; index: number }
const CODE_MAP = new Map<string, Token>()
LEAD.forEach(([code], i) => CODE_MAP.set(code, { type: "L", index: i }))
VOWEL.forEach(([code], i) => CODE_MAP.set(code, { type: "V", index: i }))
TAIL.forEach(([code], i) => CODE_MAP.set(code, { type: "T", index: i + 1 }))

// index -> latin (for the reverse direction)
const LEAD_LATIN = LEAD.map(([code]) => code)
const VOWEL_LATIN = VOWEL.map(([code]) => code)
const TAIL_LATIN = ["", ...TAIL.map(([code]) => code)] // 1-based

// compatibility jamo used to display a lone/incomplete jamo
const LEAD_JAMO = LEAD.map(([, jamo]) => jamo)
const VOWEL_JAMO = VOWEL.map(([, jamo]) => jamo)
const TAIL_JAMO = ["", ...TAIL.map(([, jamo]) => jamo)]

const MAX_CODE_LEN = 3

function compose(L: number | null, V: number | null, T: number | null): string {
  if (L !== null && V !== null) {
    return String.fromCharCode(HANGUL_BASE + (L * 21 + V) * 28 + (T ?? 0))
  }
  if (L !== null) return LEAD_JAMO[L]
  if (V !== null) return VOWEL_JAMO[V]
  if (T !== null) return TAIL_JAMO[T]
  return ""
}

// Latin -> Hangul, composing jamo into syllable blocks.
export function transcribeKoreanLatin(text: string): string {
  let output = ""
  let L: number | null = null
  let V: number | null = null
  let T: number | null = null

  const flush = () => {
    output += compose(L, V, T)
    L = V = T = null
  }

  let i = 0
  while (i < text.length) {
    let token: Token | null = null
    let matchLen = 0
    for (let len = MAX_CODE_LEN; len >= 1; len--) {
      const sub = text.slice(i, i + len)
      const entry = CODE_MAP.get(sub)
      if (entry) {
        token = entry
        matchLen = len
        break
      }
    }

    if (!token) {
      // Literal character (space, punctuation, digits, etc.)
      flush()
      output += text[i]
      i++
      continue
    }

    i += matchLen

    if (token.type === "L") {
      if (L !== null || V !== null || T !== null) flush()
      L = token.index
    } else if (token.type === "V") {
      if (L !== null && V === null && T === null) {
        V = token.index
      } else {
        flush()
        L = SILENT_LEAD
        V = token.index
      }
    } else {
      // Final consonant
      if (L !== null && V !== null && T === null) {
        T = token.index
      } else {
        flush()
        output += TAIL_JAMO[token.index]
      }
    }
  }
  flush()
  return output
}

// Hangul -> Latin, decomposing precomposed syllable blocks.
export function transcribeKorean(text: string): string {
  let output = ""
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
      const s = code - HANGUL_BASE
      const T = s % 28
      const V = Math.floor(s / 28) % 21
      const L = Math.floor(s / 28 / 21)
      // Omit the silent ㅇ initial so 아 -> "a" (not "va")
      output += (L === SILENT_LEAD ? "" : LEAD_LATIN[L]) + VOWEL_LATIN[V] + (T > 0 ? TAIL_LATIN[T] : "")
    } else {
      output += ch
    }
  }
  return output
}

// --- Virtual keyboard -------------------------------------------------------
export const koreanKeyboardRows: KeyDef[][] = [
  // Basic initial consonants
  LEAD.slice(0, 11)
    .filter(([code]) => !["gg", "dd", "bb", "ss"].includes(code))
    .map(([code, jamo]) => ({ latin: code, arabic: jamo, label: code })),
  // Remaining basic initials + double consonants
  [
    ...LEAD.slice(11).map(([code, jamo]) => ({ latin: code, arabic: jamo, label: code })),
    ...LEAD.filter(([code]) => ["gg", "dd", "bb", "ss"].includes(code)).map(([code, jamo]) => ({
      latin: code,
      arabic: jamo,
      label: code,
    })),
  ],
  // Basic vowels
  VOWEL.slice(0, 11).map(([code, jamo]) => ({ latin: code, arabic: jamo, label: code })),
  // Remaining vowels
  VOWEL.slice(11).map(([code, jamo]) => ({ latin: code, arabic: jamo, label: code })),
  // Final consonants (first half)
  TAIL.slice(0, 14).map(([code, jamo]) => ({ latin: code, arabic: jamo, label: code })),
  // Final consonants (second half)
  TAIL.slice(14).map(([code, jamo]) => ({ latin: code, arabic: jamo, label: code })),
]

// --- Letter reference -------------------------------------------------------
export interface ReferenceItem {
  char: string
  latin: string
  description: string
}

export const koreanReference: ReferenceItem[] = [
  ...LEAD.map(([code, jamo]) => ({ char: jamo, latin: code, description: "Initial consonant" })),
  ...VOWEL.map(([code, jamo]) => ({ char: jamo, latin: code, description: "Vowel" })),
  ...TAIL.map(([code, jamo]) => ({ char: jamo, latin: code, description: "Final consonant" })),
]

// --- Common phrases ---------------------------------------------------------
export const koreanPhrases: Phrase[] = [
  { english: "Hello", arabic: "안녕하세요", latin: transcribeKorean("안녕하세요") },
  { english: "Thank you", arabic: "감사합니다", latin: transcribeKorean("감사합니다") },
  { english: "Korean", arabic: "한국어", latin: transcribeKorean("한국어") },
]
