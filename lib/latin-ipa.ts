// Grapheme-to-IPA approximations for the Latin-script European tabs
// (Spanish, French, Portuguese). These are rule-based approximations meant to
// give learners a readable pronunciation guide, not a perfect phonemic engine.
// Spanish is nearly phonemic and comes out very accurate; French and Portuguese
// are inherently context-heavy, so their output is a reasonable approximation.

const isVowel = (ch: string) => !!ch && "aeiouáéíóúàâãäåèêëïîôõöûüùœæyy".includes(ch)

// --- Spanish (Castilian) ----------------------------------------------------
// Per-character IPA for the accented reference characters.
export const spanishCharIpa: Record<string, string> = {
  "á": "a",
  "é": "e",
  "í": "i",
  "ó": "o",
  "ú": "u",
  "ü": "w",
  "ñ": "ɲ",
}

export function spanishToIpa(text: string): string {
  let out = ""
  const s = text.toLowerCase()
  let i = 0
  const at = (n: number) => s[i + n] ?? ""

  while (i < s.length) {
    const c = s[i]
    const two = s.slice(i, i + 2)
    const next = at(1)

    if (two === "ch") { out += "t͡ʃ"; i += 2; continue }
    if (two === "ll") { out += "ʎ"; i += 2; continue }
    if (two === "rr") { out += "r"; i += 2; continue }
    if (two === "qu" && (at(2) === "e" || at(2) === "i")) { out += "k"; i += 2; continue }
    if (two === "gu" && (at(2) === "e" || at(2) === "i")) { out += "ɡ"; i += 2; continue }
    if (two === "gü" && (at(2) === "e" || at(2) === "i")) { out += "ɡw"; i += 2; continue }

    switch (c) {
      case "c":
        out += next === "e" || next === "i" ? "θ" : "k"
        break
      case "z": out += "θ"; break
      case "g": out += next === "e" || next === "i" ? "x" : "ɡ"; break
      case "j": out += "x"; break
      case "h": break // silent
      case "ñ": out += "ɲ"; break
      case "v":
      case "b": out += "b"; break
      case "w": out += "w"; break
      case "y": out += isVowel(next) ? "ʝ" : "i"; break
      case "x": out += "ks"; break
      case "r": out += i === 0 || !isVowel(s[i - 1]) ? "r" : "ɾ"; break
      case "á": out += "a"; break
      case "é": out += "e"; break
      case "í": out += "i"; break
      case "ó": out += "o"; break
      case "ú": out += "u"; break
      case "ü": out += "u"; break
      case "a": case "e": case "i": case "o": case "u":
        out += c; break
      case "d": case "f": case "k": case "l": case "m": case "n":
      case "p": case "s": case "t":
        out += c; break
      default: out += c
    }
    i++
  }
  return out
}

// --- French -----------------------------------------------------------------
export const frenchCharIpa: Record<string, string> = {
  "é": "e",
  "è": "ɛ",
  "ê": "ɛ",
  "ë": "ɛ",
  "à": "a",
  "â": "ɑ",
  "ä": "a",
  "î": "i",
  "ï": "i",
  "ô": "o",
  "ö": "ø",
  "û": "y",
  "ù": "y",
  "ü": "y",
  "ÿ": "i",
  "ç": "s",
  "œ": "œ",
  "æ": "e",
}

const frenchNasal = (v: string, m: string) => {
  const key = v + m
  const map: Record<string, string> = {
    an: "ɑ̃", am: "ɑ̃", en: "ɑ̃", em: "ɑ̃",
    in: "ɛ̃", im: "ɛ̃", yn: "ɛ̃", ym: "ɛ̃",
    on: "ɔ̃", om: "ɔ̃",
    un: "œ̃", um: "œ̃",
  }
  return map[key]
}

export function frenchToIpa(text: string): string {
  let out = ""
  const s = text.toLowerCase()
  let i = 0
  const at = (n: number) => s[i + n] ?? ""

  while (i < s.length) {
    const c = s[i]
    const next = at(1)
    const three = s.slice(i, i + 3)
    const two = s.slice(i, i + 2)

    // Multi-letter vowels
    if (three === "eau") { out += "o"; i += 3; continue }
    if (two === "au") { out += "o"; i += 2; continue }
    if (two === "eu" || two === "œu" || two === "oeu") { out += "ø"; i += 2; continue }
    if (two === "ou") { out += "u"; i += 2; continue }
    if (two === "oi") { out += "wa"; i += 2; continue }
    if (two === "ai" || two === "ei") { out += "ɛ"; i += 2; continue }

    // Nasal vowels: vowel + n/m, when not followed by another vowel and not doubled
    if ("aeiouy".includes(c) && (next === "n" || next === "m")) {
      const after = at(2)
      const nasal = frenchNasal(c, next)
      if (nasal && !isVowel(after) && after !== next) { out += nasal; i += 2; continue }
    }

    // Consonant digraphs
    if (two === "ch") { out += "ʃ"; i += 2; continue }
    if (two === "gn") { out += "ɲ"; i += 2; continue }
    if (two === "qu") { out += "k"; i += 2; continue }
    if (two === "ph") { out += "f"; i += 2; continue }
    if (two === "th") { out += "t"; i += 2; continue }
    if (two === "ss") { out += "s"; i += 2; continue }
    if (three === "ill") { out += "ij"; i += 3; continue }

    if (frenchCharIpa[c]) {
      out += c === "ç" ? "s" : frenchCharIpa[c]
      i++
      continue
    }

    switch (c) {
      case "c": out += next === "e" || next === "i" || next === "y" ? "s" : "k"; break
      case "g": out += next === "e" || next === "i" || next === "y" ? "ʒ" : "ɡ"; break
      case "j": out += "ʒ"; break
      case "h": break // silent
      case "r": out += "ʁ"; break
      case "s": out += isVowel(s[i - 1]) && isVowel(next) ? "z" : "s"; break
      case "w": out += "v"; break
      case "y": out += "i"; break
      case "x": out += "ks"; break
      case "u": out += "y"; break
      case "o": out += "ɔ"; break
      case "e": {
        // Final unaccented "e" is usually silent; elsewhere a schwa.
        const isFinal = i === s.length - 1 || !/[a-zàâäéèêëïîôöûüùçœæ]/.test(next)
        out += isFinal ? "" : "ə"
        break
      }
      case "a": out += "a"; break
      case "i": out += "i"; break
      case "b": case "d": case "f": case "k": case "l": case "m":
      case "n": case "p": case "t": case "v": case "z":
        out += c; break
      default: out += c
    }
    i++
  }
  return out
}

// --- Portuguese (Brazilian) -------------------------------------------------
export const portugueseCharIpa: Record<string, string> = {
  "ã": "ɐ̃",
  "õ": "õ",
  "á": "a",
  "â": "ɐ",
  "à": "a",
  "é": "ɛ",
  "ê": "e",
  "í": "i",
  "ó": "ɔ",
  "ô": "o",
  "ú": "u",
  "ü": "u",
  "ç": "s",
}

const ptNasal = (v: string, m: string) => {
  const map: Record<string, string> = {
    am: "ɐ̃", an: "ɐ̃", em: "ẽ", en: "ẽ", im: "ĩ", in: "ĩ",
    om: "õ", on: "õ", um: "ũ", un: "ũ",
  }
  return map[v + m]
}

export function portugueseToIpa(text: string): string {
  let out = ""
  const s = text.toLowerCase()
  let i = 0
  const at = (n: number) => s[i + n] ?? ""

  while (i < s.length) {
    const c = s[i]
    const next = at(1)
    const two = s.slice(i, i + 2)
    const three = s.slice(i, i + 3)

    if (three === "ão") { out += "ɐ̃w̃"; i += 3; continue }
    if (two === "õe") { out += "õj"; i += 2; continue }
    if (two === "ch") { out += "ʃ"; i += 2; continue }
    if (two === "lh") { out += "ʎ"; i += 2; continue }
    if (two === "nh") { out += "ɲ"; i += 2; continue }
    if (two === "rr") { out += "ʁ"; i += 2; continue }
    if (two === "ss") { out += "s"; i += 2; continue }
    if (two === "qu" && (at(2) === "e" || at(2) === "i")) { out += "k"; i += 2; continue }
    if (two === "gu" && (at(2) === "e" || at(2) === "i")) { out += "ɡ"; i += 2; continue }

    // Nasal vowels: vowel + n/m not before another vowel
    if ("aeiou".includes(c) && (next === "n" || next === "m")) {
      const after = at(2)
      const nasal = ptNasal(c, next)
      if (nasal && !isVowel(after)) { out += nasal; i += 2; continue }
    }

    if (portugueseCharIpa[c]) {
      out += c === "ç" ? "s" : portugueseCharIpa[c]
      i++
      continue
    }

    switch (c) {
      case "c": out += next === "e" || next === "i" ? "s" : "k"; break
      case "g": out += next === "e" || next === "i" ? "ʒ" : "ɡ"; break
      case "j": out += "ʒ"; break
      case "h": break // silent
      case "r": out += i === 0 ? "ʁ" : "ɾ"; break
      case "s": out += isVowel(s[i - 1]) && isVowel(next) ? "z" : "s"; break
      case "x": out += "ʃ"; break
      case "z": out += i === s.length - 1 ? "s" : "z"; break
      case "t": out += next === "i" ? "t͡ʃ" : "t"; break
      case "d": out += next === "i" ? "d͡ʒ" : "d"; break
      case "e": out += i === s.length - 1 ? "i" : "e"; break
      case "o": out += i === s.length - 1 ? "u" : "o"; break
      case "a": out += "a"; break
      case "i": out += "i"; break
      case "u": out += "u"; break
      case "b": case "f": case "k": case "l": case "m":
      case "n": case "p": case "v":
        out += c; break
      default: out += c
    }
    i++
  }
  return out
}
