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
// Final codes reuse the base-consonant letters (no "x" suffix). Compound finals
// use the concatenation of their two component letters (e.g. "lg" = ㄺ). These
// codes overlap with the initial-consonant codes, so composition relies on the
// position-based Hangul IME logic below rather than on unique tokens.
const TAIL: [string, string][] = [
  ["g", "ㄱ"],
  ["gg", "ㄲ"],
  ["gs", "ㄳ"],
  ["n", "ㄴ"],
  ["nj", "ㄵ"],
  ["nh", "ㄶ"],
  ["d", "ㄷ"],
  ["l", "ㄹ"],
  ["lg", "ㄺ"],
  ["lm", "ㄻ"],
  ["lb", "ㄼ"],
  ["ls", "ㄽ"],
  ["lt", "ㄾ"],
  ["lp", "ㄿ"],
  ["lh", "ㅀ"],
  ["m", "ㅁ"],
  ["b", "ㅂ"],
  ["bs", "ㅄ"],
  ["s", "ㅅ"],
  ["ss", "ㅆ"],
  ["v", "ㅇ"],
  ["j", "ㅈ"],
  ["c", "ㅊ"],
  ["k", "ㅋ"],
  ["t", "ㅌ"],
  ["p", "ㅍ"],
  ["h", "ㅎ"],
]

const SILENT_LEAD = 11 // ㅇ

// Because final-consonant codes now overlap with initial-consonant codes, the
// tokenizer only recognizes base consonants (LEAD) and vowels. A consonant's
// role (initial vs. final) is decided by position, and compound finals are
// formed by combining two consonants, exactly like a real Hangul IME.
type Token = { type: "L" | "V"; index: number }
const CODE_MAP = new Map<string, Token>()
LEAD.forEach(([code], i) => CODE_MAP.set(code, { type: "L", index: i }))
VOWEL.forEach(([code], i) => CODE_MAP.set(code, { type: "V", index: i }))

// index -> latin (for the reverse direction)
const LEAD_LATIN = LEAD.map(([code]) => code)
const VOWEL_LATIN = VOWEL.map(([code]) => code)
const TAIL_LATIN = ["", ...TAIL.map(([code]) => code)] // 1-based

// compatibility jamo used to display a lone/incomplete jamo
const LEAD_JAMO = LEAD.map(([, jamo]) => jamo)
const VOWEL_JAMO = VOWEL.map(([, jamo]) => jamo)
const TAIL_JAMO = ["", ...TAIL.map(([, jamo]) => jamo)]

// --- Position-based combining tables ---------------------------------------
// Built from jamo relationships so index bookkeeping stays correct.

const leadIndexOfJamo = (jamo: string) => LEAD_JAMO.indexOf(jamo)
const tailIndexOfJamo = (jamo: string) => TAIL_JAMO.indexOf(jamo) // 1-based (0 = none)

// A base consonant (LEAD index) -> its jongseong index, or undefined if it
// cannot be a final (ㄸ/ㅃ/ㅉ have no final form).
const LEAD_TO_TAIL = new Map<number, number>()
LEAD_JAMO.forEach((jamo, i) => {
  const t = tailIndexOfJamo(jamo)
  if (t > 0) LEAD_TO_TAIL.set(i, t)
})

// Compound finals: compound jamo -> [first component, second component].
const COMPOUND_TAILS: [string, [string, string]][] = [
  ["ㄳ", ["ㄱ", "ㅅ"]],
  ["ㄵ", ["ㄴ", "ㅈ"]],
  ["ㄶ", ["ㄴ", "ㅎ"]],
  ["ㄺ", ["ㄹ", "ㄱ"]],
  ["ㄻ", ["ㄹ", "ㅁ"]],
  ["ㄼ", ["ㄹ", "ㅂ"]],
  ["ㄽ", ["ㄹ", "ㅅ"]],
  ["ㄾ", ["ㄹ", "ㅌ"]],
  ["ㄿ", ["ㄹ", "ㅍ"]],
  ["ㅀ", ["ㄹ", "ㅎ"]],
  ["ㅄ", ["ㅂ", "ㅅ"]],
]

// (currentTailIndex, addedLeadIndex) -> combined compound tail index.
const COMBINE_TAIL = new Map<string, number>()
// tailIndex -> { remain, stolenLead }: how a final splits when a vowel follows.
// For simple finals the whole consonant is stolen (remain = 0). For compound
// finals only the last component is stolen and the first stays as the final.
const TAIL_SPLIT = new Map<number, { remain: number; stolenLead: number }>()

// Simple finals: stolen consonant is the same jamo.
TAIL_JAMO.forEach((jamo, tailIndex) => {
  if (tailIndex === 0) return
  const isCompound = COMPOUND_TAILS.some(([c]) => c === jamo)
  if (!isCompound) {
    TAIL_SPLIT.set(tailIndex, { remain: 0, stolenLead: leadIndexOfJamo(jamo) })
  }
})

// Compound finals: build combine + split entries.
COMPOUND_TAILS.forEach(([compound, [first, second]]) => {
  const compoundTail = tailIndexOfJamo(compound)
  const firstTail = tailIndexOfJamo(first)
  const secondLead = leadIndexOfJamo(second)
  COMBINE_TAIL.set(`${firstTail}-${secondLead}`, compoundTail)
  TAIL_SPLIT.set(compoundTail, { remain: firstTail, stolenLead: secondLead })
})

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
      // Consonant: decide initial vs. final vs. compound-final by position.
      const c = token.index
      if (V === null) {
        // No vowel yet in the current syllable.
        if (L === null) {
          L = c
        } else {
          // Two consonants with no vowel between them: emit the first alone.
          flush()
          L = c
        }
      } else if (T === null) {
        // Try to attach as a final consonant.
        const tail = LEAD_TO_TAIL.get(c)
        if (tail !== undefined) {
          T = tail
        } else {
          // Cannot be a final (ㄸ/ㅃ/ㅉ) -> start a new syllable.
          flush()
          L = c
        }
      } else {
        // A final already exists: try to form a compound final.
        const combined = COMBINE_TAIL.get(`${T}-${c}`)
        if (combined !== undefined) {
          T = combined
        } else {
          flush()
          L = c
        }
      }
    } else {
      // Vowel.
      if (T !== null) {
        // A trailing consonant is "stolen" to start the next syllable.
        const { remain, stolenLead } = TAIL_SPLIT.get(T) ?? { remain: 0, stolenLead: SILENT_LEAD }
        T = remain === 0 ? null : remain
        flush()
        L = stolenLead
        V = token.index
      } else if (V === null) {
        if (L === null) L = SILENT_LEAD
        V = token.index
      } else {
        // Current syllable already has a vowel: begin a new one.
        flush()
        L = SILENT_LEAD
        V = token.index
      }
    }
  }
  flush()
  return output
}

// Hangul -> Latin, decomposing precomposed syllable blocks.
export function transcribeKorean(text: string): string {
  let output = ""
  // Whether the previous syllable ended in a final consonant. If so, a
  // following silent-ㅇ initial must be written as "v"; otherwise a vowel would
  // "steal" that final when re-parsed (e.g. 국 + 어 -> keep them separate).
  let prevHadFinal = false
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
      const s = code - HANGUL_BASE
      const T = s % 28
      const V = Math.floor(s / 28) % 21
      const L = Math.floor(s / 28 / 21)
      // Omit the silent ㅇ initial (so 아 -> "a") unless it needs to be kept to
      // avoid vowel-stealing across a preceding final consonant.
      const lead = L === SILENT_LEAD && !prevHadFinal ? "" : LEAD_LATIN[L]
      output += lead + VOWEL_LATIN[V] + (T > 0 ? TAIL_LATIN[T] : "")
      prevHadFinal = T > 0
    } else {
      output += ch
      prevHadFinal = false
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
