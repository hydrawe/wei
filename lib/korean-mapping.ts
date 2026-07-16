// Korean (Hangul) transliteration mapping.
//
// Korean syllables are composed from jamo: an initial consonant (choseong),
// a medial vowel (jungseong), and an optional final consonant (jongseong).
// We map Latin codes to jamo and compose them into precomposed Hangul syllable
// blocks using the Unicode algorithm:
//   code = 0xAC00 + (L * 21 + V) * 28 + T
// where L = choseong index (0-18), V = jungseong index (0-20),
// T = jongseong index (0 = none, 1-27).
//
// Unlike a positional IME, every jamo role has a UNIQUE Latin code: finals use
// their own codes (q / v / z / r prefixed) that never collide with initial or
// vowel codes. That makes both directions fully deterministic and reversible.

import type { KeyDef, Phrase } from "./arabic-mapping"

export type { KeyDef, Phrase }

const HANGUL_BASE = 0xac00
const HANGUL_LAST = 0xd7a3

// The silent ㅇ initial (choseong index 11). It has no typed code: a bare vowel
// automatically gets ㅇ as its initial (so "a" -> 아).
const SILENT_LEAD = 11

// --- Initial consonants (choseong), index 0-18 -----------------------------
// [latin code, compatibility jamo for display]. The ㅇ initial is silent ("").
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
  ["", "ㅇ"], // silent initial (auto-inserted before a bare vowel)
  ["j", "ㅈ"],
  ["jj", "ㅉ"],
  ["c", "ㅊ"],
  ["k", "ㅋ"],
  ["t", "ㅌ"],
  ["p", "ㅍ"],
  ["h", "ㅎ"],
]

// --- Vowels (jungseong), index 0-20 ----------------------------------------
// "y"-prefixed / doubled-stroke vowels carry a [y] glide. Compound vowels
// (diphthongs) combine two vowel qualities.
const VOWEL: [string, string][] = [
  ["a", "ㅏ"],
  ["ae", "ㅐ"],
  ["ya", "ㅑ"],
  ["ie", "ㅒ"],
  ["eo", "ㅓ"],
  ["e", "ㅔ"],
  ["yo", "ㅕ"],
  ["ye", "ㅖ"],
  ["o", "ㅗ"],
  ["ua", "ㅘ"],
  ["ue", "ㅙ"],
  ["oe", "ㅚ"],
  ["io", "ㅛ"],
  ["u", "ㅜ"],
  ["uo", "ㅝ"],
  ["oy", "ㅞ"],
  ["uy", "ㅟ"],
  ["iu", "ㅠ"],
  ["eu", "ㅡ"],
  ["ui", "ㅢ"],
  ["i", "ㅣ"],
]

// --- Final consonants (jongseong), index 1-27 (0 = none) -------------------
// Each final has a unique code that never overlaps with initial/vowel codes.
const TAIL: [string, string][] = [
  ["q", "ㄱ"],
  ["qq", "ㄲ"],
  ["sq", "ㄳ"],
  ["v", "ㄴ"],
  ["jv", "ㄵ"],
  ["hv", "ㄶ"],
  ["dw", "ㄷ"],
  ["r", "ㄹ"],
  ["gr", "ㄺ"],
  ["mr", "ㄻ"],
  ["br", "ㄼ"],
  ["zr", "ㄽ"],
  ["tr", "ㄾ"],
  ["pr", "ㄿ"],
  ["hr", "ㅀ"],
  ["mw", "ㅁ"],
  ["bw", "ㅂ"],
  ["bz", "ㅄ"],
  ["z", "ㅅ"],
  ["zz", "ㅆ"],
  ["vq", "ㅇ"],
  ["jw", "ㅈ"],
  ["cw", "ㅊ"],
  ["kw", "ㅋ"],
  ["tw", "ㅌ"],
  ["pw", "ㅍ"],
  ["hw", "ㅎ"],
]

// --- Code lookup ------------------------------------------------------------
type Token = { type: "L" | "V" | "T"; index: number }
const CODE_MAP = new Map<string, Token>()
LEAD.forEach(([code], i) => {
  if (code) CODE_MAP.set(code, { type: "L", index: i })
})
VOWEL.forEach(([code], i) => CODE_MAP.set(code, { type: "V", index: i }))
TAIL.forEach(([code], i) => CODE_MAP.set(code, { type: "T", index: i + 1 })) // 1-based

const MAX_CODE_LEN = Math.max(
  ...[...CODE_MAP.keys()].map((c) => c.length),
)

// index -> latin (reverse direction)
const LEAD_LATIN = LEAD.map(([code]) => code)
const VOWEL_LATIN = VOWEL.map(([code]) => code)
const TAIL_LATIN = ["", ...TAIL.map(([code]) => code)] // 1-based

// compatibility jamo for display of lone/incomplete jamo
const LEAD_JAMO = LEAD.map(([, jamo]) => jamo)
const VOWEL_JAMO = VOWEL.map(([, jamo]) => jamo)
const TAIL_JAMO = ["", ...TAIL.map(([, jamo]) => jamo)]

function compose(L: number | null, V: number | null, T: number | null): string {
  if (L !== null && V !== null) {
    return String.fromCharCode(HANGUL_BASE + (L * 21 + V) * 28 + (T ?? 0))
  }
  if (L !== null) return LEAD_JAMO[L]
  if (V !== null) return VOWEL_JAMO[V]
  if (T !== null) return TAIL_JAMO[T]
  return ""
}

// Latin -> Hangul, composing jamo into syllable blocks. Because codes are
// unique per role, tokenizing greedily (longest match) and dispatching on the
// token type is unambiguous.
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
      const entry = CODE_MAP.get(text.slice(i, i + len))
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
      // Initial consonant always begins a new syllable.
      flush()
      L = token.index
    } else if (token.type === "V") {
      if (V !== null || T !== null) {
        // Current syllable already has a vowel (and maybe a final): start a new
        // one. Finals are never "stolen" since they have distinct codes.
        flush()
        L = SILENT_LEAD
        V = token.index
      } else {
        if (L === null) L = SILENT_LEAD
        V = token.index
      }
    } else {
      // Final consonant: attach to the current syllable if it has a vowel and
      // no final yet; otherwise emit it as a standalone jamo.
      if (V !== null && T === null) {
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

// Hangul -> Latin, decomposing precomposed syllable blocks. The silent ㅇ
// initial maps to "" and finals have unique codes, so no vowel-stealing guard
// is needed.
export function transcribeKorean(text: string): string {
  let output = ""
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
      const s = code - HANGUL_BASE
      const T = s % 28
      const V = Math.floor(s / 28) % 21
      const L = Math.floor(s / 28 / 21)
      output += LEAD_LATIN[L] + VOWEL_LATIN[V] + (T > 0 ? TAIL_LATIN[T] : "")
    } else {
      output += ch
    }
  }
  return output
}

// --- Virtual keyboard -------------------------------------------------------
const keyOf = ([code, jamo]: [string, string]): KeyDef => ({ latin: code, arabic: jamo, label: code })

const SINGLE_LEAD_CODES = ["g", "n", "d", "l", "m", "b", "s", "j", "c", "h", "k", "t", "p"]
const DOUBLE_LEAD_CODES = ["gg", "dd", "bb", "ss", "jj"]
const leadByCode = (code: string) => LEAD.find(([c]) => c === code)!
const vowelByJamo = (jamo: string) => VOWEL.find(([, j]) => j === jamo)!

export const koreanKeyboardRows: KeyDef[][] = [
  // 14 single consonants (ㅇ is silent/automatic, so 13 typeable keys)
  SINGLE_LEAD_CODES.map((code) => keyOf(leadByCode(code))),
  // 5 double consonants
  DOUBLE_LEAD_CODES.map((code) => keyOf(leadByCode(code))),
  // 5 "next" vowels: 아 야 어 여 이
  ["ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅣ"].map((j) => keyOf(vowelByJamo(j))),
  // 5 "under" vowels: 오 요 우 유 으
  ["ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ"].map((j) => keyOf(vowelByJamo(j))),
  // 4 "next" compound vowels: 애 얘 에 예
  ["ㅐ", "ㅒ", "ㅔ", "ㅖ"].map((j) => keyOf(vowelByJamo(j))),
  // 7 "under" compound vowels: 외 와 왜 위 워 웨 의
  ["ㅚ", "ㅘ", "ㅙ", "ㅟ", "ㅝ", "ㅞ", "ㅢ"].map((j) => keyOf(vowelByJamo(j))),
  // 27 final consonants (first 14)
  TAIL.slice(0, 14).map(keyOf),
  // 27 final consonants (remaining 13)
  TAIL.slice(14).map(keyOf),
]

// --- Letter reference -------------------------------------------------------
export interface ReferenceItem {
  char: string
  latin: string
  description: string
}

export const koreanReference: ReferenceItem[] = [
  ...LEAD.filter(([code]) => code).map(([code, jamo]) => ({
    char: jamo,
    latin: code,
    description: "Initial consonant",
  })),
  { char: "ㅇ", latin: "(none)", description: "Silent initial — just type the vowel" },
  ...VOWEL.map(([code, jamo]) => ({ char: jamo, latin: code, description: "Vowel" })),
  ...TAIL.map(([code, jamo]) => ({ char: jamo, latin: code, description: "Final consonant" })),
]

// --- Common phrases ---------------------------------------------------------
export const koreanPhrases: Phrase[] = [
  { english: "Hello", arabic: "안녕하세요", latin: transcribeKorean("안녕하세요") },
  { english: "Thank you", arabic: "감사합니다", latin: transcribeKorean("감사합니다") },
  { english: "Korean", arabic: "한국어", latin: transcribeKorean("한국어") },
]
