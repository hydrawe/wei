// Japanese (Kana) transliteration mapping.
//
// Romaji codes map directly to hiragana (lowercase codes) and katakana
// (uppercase codes). Conversion is a longest-match lookup in each direction,
// so it is fully reversible for the canonical codes below.

import type { KeyDef, Phrase } from "./arabic-mapping"
import type { ReferenceItem } from "./korean-mapping"

export type { KeyDef, Phrase, ReferenceItem }

// [latin code, kana] pairs. Hiragana uses lowercase codes, katakana uppercase.
const HIRAGANA: [string, string][] = [
  ["a", "あ"], ["i", "い"], ["u", "う"], ["e", "え"], ["o", "お"],
  ["ka", "か"], ["ki", "き"], ["ku", "く"], ["ke", "け"], ["ko", "こ"],
  ["ga", "が"], ["gi", "ぎ"], ["gu", "ぐ"], ["ge", "げ"], ["go", "ご"],
  ["sa", "さ"], ["si", "し"], ["su", "す"], ["se", "せ"], ["so", "そ"],
  ["za", "ざ"], ["zi", "じ"], ["zu", "ず"], ["ze", "ぜ"], ["zo", "ぞ"],
  ["ta", "た"], ["ti", "ち"], ["tu", "つ"], ["te", "て"], ["to", "と"],
  ["da", "だ"], ["di", "ぢ"], ["du", "づ"], ["de", "で"], ["do", "ど"],
  ["ha", "は"], ["hi", "ひ"], ["hu", "ふ"], ["he", "へ"], ["ho", "ほ"],
  ["ba", "ば"], ["bi", "び"], ["bu", "ぶ"], ["be", "べ"], ["bo", "ぼ"],
  ["pa", "ぱ"], ["pi", "ぴ"], ["pu", "ぷ"], ["pe", "ぺ"], ["po", "ぽ"],
  ["ma", "ま"], ["mi", "み"], ["mu", "む"], ["me", "め"], ["mo", "も"],
  ["na", "な"], ["ni", "に"], ["nu", "ぬ"], ["ne", "ね"], ["no", "の"],
  ["ra", "ら"], ["ri", "り"], ["ru", "る"], ["re", "れ"], ["ro", "ろ"],
  ["ya", "や"], ["yu", "ゆ"], ["yo", "よ"],
  ["wa", "わ"], ["wo", "を"], ["n", "ん"],
  ["ac", "ぁ"], ["ic", "ぃ"], ["uc", "ぅ"], ["ec", "ぇ"], ["oc", "ぉ"], ["q", "っ"],
  ["ia", "ゃ"], ["iu", "ゅ"], ["io", "ょ"],
]

const KATAKANA: [string, string][] = [
  ["A", "ア"], ["I", "イ"], ["U", "ウ"], ["E", "エ"], ["O", "オ"],
  ["KA", "カ"], ["KI", "キ"], ["KU", "ク"], ["KE", "ケ"], ["KO", "コ"],
  ["GA", "ガ"], ["GI", "ギ"], ["GU", "グ"], ["GE", "ゲ"], ["GO", "ゴ"],
  ["SA", "サ"], ["SI", "シ"], ["SU", "ス"], ["SE", "セ"], ["SO", "ソ"],
  ["ZA", "ザ"], ["ZI", "ジ"], ["ZU", "ズ"], ["ZE", "ゼ"], ["ZO", "ゾ"],
  ["TA", "タ"], ["TI", "チ"], ["TU", "ツ"], ["TE", "テ"], ["TO", "ト"],
  ["DA", "ダ"], ["DI", "ヂ"], ["DU", "ヅ"], ["DE", "デ"], ["DO", "ド"],
  ["HA", "ハ"], ["HI", "ヒ"], ["HU", "フ"], ["HE", "ヘ"], ["HO", "ホ"],
  ["BA", "バ"], ["BI", "ビ"], ["BU", "ブ"], ["BE", "ベ"], ["BO", "ボ"],
  ["PA", "パ"], ["PI", "ピ"], ["PU", "プ"], ["PE", "ペ"], ["PO", "ポ"],
  ["MA", "マ"], ["MI", "ミ"], ["MU", "ム"], ["ME", "メ"], ["MO", "モ"],
  ["NA", "ナ"], ["NI", "ニ"], ["NU", "ヌ"], ["NE", "ネ"], ["NO", "ノ"],
  ["RA", "ラ"], ["RI", "リ"], ["RU", "ル"], ["RE", "レ"], ["RO", "ロ"],
  ["YA", "ヤ"], ["YU", "ユ"], ["YO", "ヨ"],
  ["WA", "ワ"], ["WO", "ヲ"], ["N", "ン"],
  ["AC", "ァ"], ["IC", "ィ"], ["UC", "ゥ"], ["EC", "ェ"], ["OC", "ォ"], ["Q", "ッ"],
  ["IA", "ャ"], ["IU", "ュ"], ["IO", "ョ"],
  ["x", "ー"], ["X", "ー"], // prolonged sound mark
]

const ALL: [string, string][] = [...HIRAGANA, ...KATAKANA]

// latin code -> kana
const CODE_TO_KANA = new Map<string, string>(ALL)
// kana -> latin code (first definition wins; kana are unique across the set)
const KANA_TO_CODE = new Map<string, string>()
for (const [code, kana] of ALL) {
  if (!KANA_TO_CODE.has(kana)) KANA_TO_CODE.set(kana, code)
}

const MAX_CODE_LEN = 2

// Latin (romaji) -> Kana, longest-match from left.
export function transcribeJapaneseLatin(text: string): string {
  let output = ""
  let i = 0
  while (i < text.length) {
    let matched = false
    for (let len = MAX_CODE_LEN; len >= 1; len--) {
      const sub = text.slice(i, i + len)
      const kana = CODE_TO_KANA.get(sub)
      if (kana) {
        output += kana
        i += len
        matched = true
        break
      }
    }
    if (!matched) {
      output += text[i]
      i++
    }
  }
  return output
}

// Kana -> Latin (romaji).
export function transcribeJapanese(text: string): string {
  let output = ""
  for (const ch of text) {
    output += KANA_TO_CODE.get(ch) ?? ch
  }
  return output
}

// --- Virtual keyboard -------------------------------------------------------
function keys(pairs: [string, string][]): KeyDef[] {
  return pairs.map(([code, kana]) => ({ latin: code, arabic: kana, label: code }))
}

export const japaneseKeyboardRows: KeyDef[][] = [
  keys(HIRAGANA.slice(0, 5)), // vowels
  keys(HIRAGANA.slice(5, 20)), // k / g / s rows
  keys(HIRAGANA.slice(20, 35)), // z / t / d rows
  keys(HIRAGANA.slice(35, 50)), // h / b / p rows
  keys(HIRAGANA.slice(50, 65)), // m / n / r rows
  keys(HIRAGANA.slice(65)), // y, w, n, small kana
]

// --- Letter reference -------------------------------------------------------
export const japaneseReference: ReferenceItem[] = [
  ...HIRAGANA.map(([code, kana]) => ({ char: kana, latin: code, description: "Hiragana" })),
  ...KATAKANA.filter(([, kana]) => kana !== "ー").map(([code, kana]) => ({
    char: kana,
    latin: code,
    description: "Katakana",
  })),
  { char: "ー", latin: "x", description: "Long vowel mark" },
]

// Row-based reference for the gojūon table layout. The first 65 kana are the
// complete a-i-u-e-o rows (13 rows of 5). The remaining groups are irregular
// (ya/yu/yo, wa/wo/n, small kana, compound y-kana) and each get their own row,
// so they are not forced to fill five columns.
function kanaRows(pairs: [string, string][], description: string): ReferenceItem[][] {
  const toItem = ([code, kana]: [string, string]): ReferenceItem => ({ char: kana, latin: code, description })
  const rows: ReferenceItem[][] = []
  for (let i = 0; i < 65; i += 5) rows.push(pairs.slice(i, i + 5).map(toItem))
  rows.push(pairs.slice(65, 68).map(toItem)) // ya yu yo
  rows.push(pairs.slice(68, 71).map(toItem)) // wa wo n
  rows.push(pairs.slice(71, 77).map(toItem)) // small kana
  rows.push(pairs.slice(77, 80).map(toItem)) // ia iu io (compound)
  return rows
}

export const japaneseReferenceRows: { description: string; rows: ReferenceItem[][] }[] = [
  { description: "Hiragana", rows: kanaRows(HIRAGANA, "Hiragana") },
  { description: "Katakana", rows: kanaRows(KATAKANA, "Katakana") },
  { description: "Long vowel mark", rows: [[{ char: "ー", latin: "x", description: "Long vowel mark" }]] },
]

// --- Common phrases ---------------------------------------------------------
export const japanesePhrases: Phrase[] = [
  { english: "Hello", arabic: "こんにちは", latin: transcribeJapanese("こんにちは") },
  { english: "Thank you", arabic: "ありがとう", latin: transcribeJapanese("ありがとう") },
  { english: "Japanese", arabic: "にほんご", latin: transcribeJapanese("にほんご") },
]
