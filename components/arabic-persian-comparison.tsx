"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { transcribeArabic, transcribeLatin, arabicPhrases } from "@/lib/arabic-mapping"
import { transcribePersian, transcribePersianLatin, persianKeyboardRows } from "@/lib/persian-mapping"
import { transcribeArabicIpa, transcribePersianIpa } from "@/lib/ipa-mapping"
import { Copy, Check, Trash2, Keyboard, Bookmark } from "lucide-react"

// Latin codes for the short-vowel diacritic keys shared by both scripts.
const diacriticKeys: { latin: string; glyph: string }[] = [
  { latin: "a", glyph: "َ" },
  { latin: "i", glyph: "ِ" },
  { latin: "u", glyph: "ُ" },
  { latin: "av", glyph: "ً" },
  { latin: "iv", glyph: "ٍ" },
  { latin: "uv", glyph: "ٌ" },
]

export function ArabicPersianComparison() {
  const [latinText, setLatinText] = useState("")
  const [arabicText, setArabicText] = useState("")
  const [persianText, setPersianText] = useState("")
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  // IPA is derived from each script rendering so the phonetics line up with the
  // transliteration shown in that column.
  const arabicIpa = arabicText.trim() ? transcribeArabicIpa(arabicText) : ""
  const persianIpa = persianText.trim() ? transcribePersianIpa(persianText) : ""

  // Latin is the shared source: it drives both the Arabic and Persian renderings.
  const applyFromLatin = (value: string) => {
    setLatinText(value)
    setArabicText(transcribeLatin(value))
    setPersianText(transcribePersianLatin(value))
  }

  const handleLatinChange = (value: string) => applyFromLatin(value)

  // Editing a script box back-computes the shared Latin, then re-derives the
  // other script so the comparison stays in sync.
  const handleArabicChange = (value: string) => {
    setArabicText(value)
    const latin = transcribeArabic(value)
    setLatinText(latin)
    setPersianText(transcribePersianLatin(latin))
  }

  const handlePersianChange = (value: string) => {
    setPersianText(value)
    const latin = transcribePersian(value)
    setLatinText(latin)
    setArabicText(transcribeLatin(latin))
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000)
  }

  const handleClear = () => {
    setLatinText("")
    setArabicText("")
    setPersianText("")
  }

  const handleKeyPress = (latin: string) => applyFromLatin(latinText + latin)
  const handleSpace = () => applyFromLatin(latinText + " ")
  const handleBackspace = () => applyFromLatin(latinText.slice(0, -1))

  const copyButton = (text: string, key: string) =>
    text ? (
      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(text, key)}>
        {copied === key ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </>
        )}
      </Button>
    ) : null

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Intro note */}
          <p className="text-sm text-muted-foreground rounded-lg border bg-muted/30 p-3">
            Type in Latin to compare how the same word is written and pronounced in{" "}
            <strong>Arabic</strong> and <strong>Persian</strong>. Both scripts share the Wei Latin
            codes, so one input renders both at once. Editing either script box updates the rest.
          </p>

          {/* Latin source input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="latin-input" className="text-sm font-medium">
                Latin Text
              </label>
              {copyButton(latinText, "latin")}
            </div>
            <Textarea
              id="latin-input"
              placeholder="Type Latin transliteration here..."
              className="min-h-24 !text-[20px] font-mono !leading-normal"
              value={latinText}
              onChange={(e) => handleLatinChange(e.target.value)}
            />
          </div>

          {/* Side-by-side comparison: Arabic vs Persian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arabic column */}
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <label htmlFor="arabic-input" className="text-sm font-semibold">
                  Arabic
                </label>
                {copyButton(arabicText, "arabic")}
              </div>
              <Textarea
                id="arabic-input"
                placeholder="النص العربي..."
                className="min-h-24 !text-[30px] text-right font-arabic !leading-normal"
                dir="rtl"
                value={arabicText}
                onChange={(e) => handleArabicChange(e.target.value)}
              />
              <div className="rounded-md border bg-muted/50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Pronunciation (IPA)
                  </span>
                  {arabicIpa && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(`/${arabicIpa}/`, "arabic-ipa")}
                    >
                      {copied === "arabic-ipa" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="sr-only">Copy Arabic IPA pronunciation</span>
                    </Button>
                  )}
                </div>
                <p
                  lang="und-fonipa"
                  aria-label={arabicIpa ? `Arabic IPA pronunciation: ${arabicIpa}` : "Arabic IPA pronunciation"}
                  className="mt-1 min-h-7 font-mono text-lg leading-relaxed text-foreground"
                  dir="ltr"
                >
                  {arabicIpa ? `/${arabicIpa}/` : "—"}
                </p>
              </div>
            </div>

            {/* Persian column */}
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <label htmlFor="persian-input" className="text-sm font-semibold">
                  Persian
                </label>
                {copyButton(persianText, "persian")}
              </div>
              <Textarea
                id="persian-input"
                placeholder="متن فارسی..."
                className="min-h-24 !text-[30px] text-right font-arabic !leading-normal"
                dir="rtl"
                value={persianText}
                onChange={(e) => handlePersianChange(e.target.value)}
              />
              <div className="rounded-md border bg-muted/50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Pronunciation (IPA)
                  </span>
                  {persianIpa && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(`/${persianIpa}/`, "persian-ipa")}
                    >
                      {copied === "persian-ipa" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="sr-only">Copy Persian IPA pronunciation</span>
                    </Button>
                  )}
                </div>
                <p
                  lang="und-fonipa"
                  aria-label={persianIpa ? `Persian IPA pronunciation: ${persianIpa}` : "Persian IPA pronunciation"}
                  className="mt-1 min-h-7 font-mono text-lg leading-relaxed text-foreground"
                  dir="ltr"
                >
                  {persianIpa ? `/${persianIpa}/` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Common phrases */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5" />
              Try:
            </span>
            {arabicPhrases.map((phrase, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => applyFromLatin(phrase.latin)}
                title={`${phrase.english}: ${phrase.arabic}`}
              >
                {phrase.english}
              </Button>
            ))}
            {(latinText || arabicText || persianText) && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground ml-auto">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Virtual keyboard (shared Latin codes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Latin Keyboard
              </label>
              <Button variant="ghost" size="sm" onClick={() => setShowKeyboard(!showKeyboard)}>
                {showKeyboard ? "Hide" : "Show"}
              </Button>
            </div>
            {showKeyboard && (
              <div className="p-2 sm:p-4 border rounded-lg bg-muted/30 space-y-1.5 sm:space-y-2">
                {persianKeyboardRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
                    {row.map((keyDef) => (
                      <Button
                        key={keyDef.latin}
                        variant="outline"
                        size="sm"
                        className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                        onClick={() => handleKeyPress(keyDef.latin)}
                      >
                        <span className="font-mono text-xs sm:text-sm font-semibold">{keyDef.label}</span>
                        <span className="text-base sm:text-xl font-arabic">{keyDef.arabic}</span>
                      </Button>
                    ))}
                  </div>
                ))}
                {/* Diacritics + space + delete */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center mt-2 sm:mt-2.5">
                  {diacriticKeys.map((d) => (
                    <Button
                      key={d.latin}
                      variant="outline"
                      size="sm"
                      className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                      onClick={() => handleKeyPress(d.latin)}
                    >
                      <span className="font-mono text-xs sm:text-sm font-semibold">{d.latin}</span>
                      <span className="text-base sm:text-xl font-arabic">{d.glyph}</span>
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 sm:h-14 px-4 sm:px-8 text-xs sm:text-sm"
                    onClick={handleSpace}
                  >
                    Space
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 sm:h-14 px-3 sm:px-4 text-xs sm:text-sm"
                    onClick={handleBackspace}
                  >
                    Del
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About This Comparison</CardTitle>
          <CardDescription>
            Arabic and Persian both use the Arabic script and share the Wei Latin transliteration codes, but they
            differ in pronunciation and in a few Persian-only letters.
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <h4>Key Differences</h4>
          <ul>
            <li>
              <strong>Persian-only letters </strong> پ (p), چ (jv), ژ (zv) and گ (kv) do not exist in Arabic.
            </li>
            <li>
              <strong>Merged sounds </strong> several distinct Arabic letters (e.g. ث ذ ص ض ط ظ) collapse to a
              single Persian sound, so their IPA differs even when the letter is the same.
            </li>
            <li>
              <strong>Vowel qualities </strong> the same short vowels lean toward Arabic (a, i, u) versus Persian
              (æ, e, o), and long ā is /aː/ in Arabic but /ɒː/ in Persian.
            </li>
            <li>
              <strong>ق / غ </strong> are separate sounds in Arabic (/q/, /ɣ/) but merge to /ɢ/ in Persian.
            </li>
          </ul>
          <p className="mt-4">
            Learn more at{" "}
            <a
              href="https://www.hydrawe.org/pathways/Wei/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              hydrawe.org/pathways/Wei
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
