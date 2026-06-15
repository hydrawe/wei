"use client"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { transcribeArabic, transcribeLatin, arabicMapping, arabicDescriptions } from "@/lib/arabic-mapping"
import { Copy, Check, Trash2, Keyboard, Languages, Loader2, Bookmark } from "lucide-react"

// Reverse mapping: Latin transliteration -> Arabic character
const latinToArabic: Record<string, string> = {
  // Multi-character mappings (digraphs) - order matters for matching
  'oe': 'آ',
  'yc': 'ئ',
  'wc': 'ؤ',
  'ic': 'إ',
  'ec': 'أ',
  'dv': 'ذ',
  'tv': 'ث',
  'sv': 'ش',
  'gv': 'غ',
  'av': 'ً',
  'iv': 'ٍ',
  'uv': 'ٌ',
  // Single character mappings
  'oc': 'ء',
  'e': 'ا',
  'o': 'ٱ',
  'ao': 'ٰ',
  'yo': 'ى',
  'y': 'ي',
  'w': 'و',
  'r': 'ر',
  'z': 'ز',
  'd': 'د',
  't': 'ت',
  's': 'س',
  'l': 'ل',
  'n': 'ن',
  'sc': 'ص',
  'dc': 'ض',
  'tc': 'ط',
  'zc': 'ظ',
  'b': 'ب',
  'f': 'ف',
  'k': 'ك',
  'q': 'ق',
  'g': 'ع',
  'h': 'ه',
  'j': 'ج',
  'x': 'ح',
  'xv': 'خ',
  'm': 'م',
  // Vowel diacritics as standalone keys
  'i': 'ِ',
  'u': 'ُ',
  'a': 'َ',
  'p': 'ّ',
}

// Keyboard layout with 3 rows
const keyboardRows = [
  // Row 1: Vowels and vowel-related letters grouped together
  [
    { latin: 'oc', arabic: 'ء', label: 'oc' },
    { latin: 'e', arabic: 'ا', label: 'e' },
    { latin: 'o', arabic: 'ٱ', label: 'o' },
    { latin: 'oe', arabic: 'آ', label: 'oe' },
    { latin: 'ec', arabic: 'أ', label: 'ec' },
    { latin: 'ic', arabic: 'إ', label: 'ic' },
    { latin: 'yo', arabic: 'ى', label: 'yo' },
    { latin: 'ao', arabic: 'ٰ', label: 'ao' },
    { latin: 'yc', arabic: 'ئ', label: 'yc' },
    { latin: 'wc', arabic: 'ؤ', label: 'wc' },
    { latin: 'y', arabic: 'ي', label: 'y' },
    { latin: 'w', arabic: 'و', label: 'w' },
  ],
  // Row 2: Consonants
  [
    { latin: 'b', arabic: 'ب', label: 'b' },
    { latin: 'f', arabic: 'ف', label: 'f' },
    { latin: 'j', arabic: 'ج', label: 'j' },
    { latin: 'k', arabic: 'ك', label: 'k' },
    { latin: 'l', arabic: 'ل', label: 'l' },
    { latin: 'm', arabic: 'م', label: 'm' },
    { latin: 'n', arabic: 'ن', label: 'n' },
    { latin: 'q', arabic: 'ق', label: 'q' },
    { latin: 'r', arabic: 'ر', label: 'r' },
    { latin: 'z', arabic: 'ز', label: 'z' },
    { latin: 'sc', arabic: 'ص', label: 'sc' },
    { latin: 'dc', arabic: 'ض', label: 'dc' },
    { latin: 'tc', arabic: 'ط', label: 'tc' },
    { latin: 'zc', arabic: 'ظ', label: 'zc' },
  ],
  // Row 3: Letters with "v" suffix paired (base, v-variant), h and hh at far right
  [
    { latin: 't', arabic: 'ت', label: 't' },
    { latin: 'tv', arabic: 'ث', label: 'tv' },
    { latin: 's', arabic: 'س', label: 's' },
    { latin: 'sv', arabic: 'ش', label: 'sv' },
    { latin: 'd', arabic: 'د', label: 'd' },
    { latin: 'dv', arabic: 'ذ', label: 'dv' },
    { latin: 'g', arabic: 'ع', label: 'g' },
    { latin: 'gv', arabic: 'غ', label: 'gv' },
    { latin: 'x', arabic: 'ح', label: 'x' },
    { latin: 'xv', arabic: 'خ', label: 'xv' },
    { latin: 'h', arabic: 'ه', label: 'h' },
    { latin: 'ho', arabic: 'ة', label: 'ho' },
  ],
]

// Common phrases for quick access
const commonPhrases = [
  { english: "Good morning", arabic: "صَبَاحُ الخَيْر", latin: "scabaxu alxvayr" },
  { english: "How are you?", arabic: "كَيْفَ حَالُكَ", latin: "kayfa xaluka" },
  { english: "Arabic", arabic: "العَرَبِيَّة", latin: "algarabiyaho" },
]

export function ArabicTranscriber() {
  const [arabicText, setArabicText] = useState("")
  const [latinText, setLatinText] = useState("")
  const [englishText, setEnglishText] = useState("")
  const [chineseText, setChineseText] = useState("")
  const [copiedLatin, setCopiedLatin] = useState(false)
  const [copiedArabic, setCopiedArabic] = useState(false)
  const [copiedEnglish, setCopiedEnglish] = useState(false)
  const [copiedChinese, setCopiedChinese] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [isTranslating, setIsTranslating] = useState(false)
  // Tracks which field the user last edited so we know the translation direction
  const [source, setSource] = useState<"latin" | "arabic" | "english" | "chinese" | null>(null)
  const lastProcessedRef = useRef<string>("")

  const fetchTranslation = async (text: string, pair: string): Promise<string> => {
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`
      )
      const data = await res.json()
      return data.responseStatus === 200 && data.responseData?.translatedText
        ? data.responseData.translatedText
        : ""
    } catch {
      return ""
    }
  }

  // Bidirectional translation: the edited field drives the other three
  useEffect(() => {
    if (source === null) return

    const sourceText =
      source === "english" ? englishText : source === "chinese" ? chineseText : arabicText
    const key = `${source}:${sourceText}`
    if (key === lastProcessedRef.current) return

    const run = async () => {
      lastProcessedRef.current = key

      // Clear everything if the source field is empty
      if (!sourceText.trim()) {
        if (source !== "arabic" && source !== "latin") {
          setArabicText("")
          setLatinText("")
        }
        if (source !== "english") setEnglishText("")
        if (source !== "chinese") setChineseText("")
        return
      }

      setIsTranslating(true)
      try {
        if (source === "latin" || source === "arabic") {
          const [en, zh] = await Promise.all([
            fetchTranslation(arabicText, "ar|en"),
            fetchTranslation(arabicText, "ar|zh"),
          ])
          setEnglishText(en)
          setChineseText(zh)
        } else if (source === "english") {
          const [ar, zh] = await Promise.all([
            fetchTranslation(englishText, "en|ar"),
            fetchTranslation(englishText, "en|zh"),
          ])
          setArabicText(ar)
          setLatinText(transcribeArabic(ar))
          setChineseText(zh)
        } else if (source === "chinese") {
          const [ar, en] = await Promise.all([
            fetchTranslation(chineseText, "zh|ar"),
            fetchTranslation(chineseText, "zh|en"),
          ])
          setArabicText(ar)
          setLatinText(transcribeArabic(ar))
          setEnglishText(en)
        }
      } finally {
        setIsTranslating(false)
      }
    }

    const debounceTimer = setTimeout(run, 600)
    return () => clearTimeout(debounceTimer)
  }, [source, arabicText, englishText, chineseText])

  const handleLatinChange = (value: string) => {
    setSource("latin")
    setLatinText(value)
    setArabicText(transcribeLatin(value))
  }

  const handleArabicChange = (value: string) => {
    setSource("arabic")
    setArabicText(value)
    setLatinText(transcribeArabic(value))
  }

  const handleEnglishChange = (value: string) => {
    setSource("english")
    setEnglishText(value)
  }

  const handleChineseChange = (value: string) => {
    setSource("chinese")
    setChineseText(value)
  }

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
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
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setArabicText("")
    setLatinText("")
    setEnglishText("")
    setChineseText("")
    setSource(null)
    lastProcessedRef.current = ""
  }

  const handleKeyPress = (arabic: string, latin: string) => {
    setSource("arabic")
    setArabicText((prev) => prev + arabic)
    setLatinText((prev) => prev + latin)
  }

  const handleBackspace = () => {
    setSource("arabic")
    setArabicText((prev) => [...prev].slice(0, -1).join(""))
    // For latin, we need to handle multi-char sequences
    setLatinText((prev) => {
      // Simple approach: remove last character
      return prev.slice(0, -1)
    })
  }

  const handleSpace = () => {
    setSource("arabic")
    setArabicText((prev) => prev + " ")
    setLatinText((prev) => prev + " ")
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Reversible conversion note */}
          <p className="text-sm text-muted-foreground rounded-lg border bg-muted/30 p-3">
            The conversion between Latin Text and Arabic Text is fully reversible. You can type in
            either Latin Text or Arabic Text, and the other updates automatically.
          </p>

          {/* Side by side: Latin on left, Arabic on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Latin Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="latin-input" className="text-sm font-medium">
                  Latin Text
                </label>
                {latinText && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(latinText, setCopiedLatin)}>
                    {copiedLatin ? (
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
                )}
              </div>
              <Textarea
                id="latin-input"
                placeholder="Type Latin transliteration here..."
                className="min-h-32 !text-[20px] font-mono !leading-normal"
                value={latinText}
                onChange={(e) => handleLatinChange(e.target.value)}
              />
            </div>

            {/* Right: Arabic Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="arabic-input" className="text-sm font-medium">
                  Arabic Text
                </label>
                {arabicText && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(arabicText, setCopiedArabic)}>
                    {copiedArabic ? (
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
                )}
              </div>
              <Textarea
                id="arabic-input"
                placeholder="اكتب النص العربي هنا..."
                className="min-h-32 !text-[30px] text-right font-arabic !leading-normal"
                dir="rtl"
                value={arabicText}
                onChange={(e) => handleArabicChange(e.target.value)}
              />
            </div>
          </div>

          {/* Common Phrases Bookmarks */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5" />
              Try:
            </span>
            {commonPhrases.map((phrase, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setSource("arabic")
                  setArabicText(phrase.arabic)
                  setLatinText(phrase.latin)
                }}
                title={`${phrase.english}: ${phrase.arabic}`}
              >
                {phrase.english}
              </Button>
            ))}
            {(arabicText || latinText) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground ml-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Translation textboxes - editable and copiable */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Translations</span>
              {isTranslating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* English */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="english-input" className="text-sm font-medium">
                    English
                  </label>
                  {englishText && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(englishText, setCopiedEnglish)}>
                      {copiedEnglish ? (
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
                  )}
                </div>
                <Textarea
                  id="english-input"
                  placeholder="Type English here..."
                  className="min-h-24 !text-[18px] !leading-normal"
                  value={englishText}
                  onChange={(e) => handleEnglishChange(e.target.value)}
                />
              </div>

              {/* Chinese */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="chinese-input" className="text-sm font-medium">
                    Chinese
                  </label>
                  {chineseText && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(chineseText, setCopiedChinese)}>
                      {copiedChinese ? (
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
                  )}
                </div>
                <Textarea
                  id="chinese-input"
                  placeholder="在此输入中文..."
                  className="min-h-24 !text-[18px] !leading-normal"
                  value={chineseText}
                  onChange={(e) => handleChineseChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Virtual Keyboard */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Latin Keyboard
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboard(!showKeyboard)}
              >
                {showKeyboard ? "Hide" : "Show"}
              </Button>
            </div>
            {showKeyboard && (
              <div className="p-2 sm:p-4 border rounded-lg bg-muted/30 space-y-1.5 sm:space-y-2">
                {keyboardRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
                    {row.map((key) => (
                      <Button
                        key={key.latin}
                        variant="outline"
                        size="sm"
                        className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                        onClick={() => handleKeyPress(key.arabic, key.latin)}
                      >
                        <span className="font-mono text-xs sm:text-sm font-semibold">{key.label}</span>
                        <span className="text-base sm:text-xl font-arabic">{key.arabic}</span>
                      </Button>
                    ))}
                  </div>
                ))}
                {/* Bottom row with diacritics, c, space, and delete */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center mt-2 sm:mt-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                    onClick={() => handleKeyPress('َ', 'a')}
                  >
                    <span className="font-mono text-xs sm:text-sm font-semibold">a</span>
                    <span className="text-base sm:text-xl font-arabic">َ</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                    onClick={() => handleKeyPress('ِ', 'i')}
                  >
                    <span className="font-mono text-xs sm:text-sm font-semibold">i</span>
                    <span className="text-base sm:text-xl font-arabic">ِ</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                    onClick={() => handleKeyPress('ُ', 'u')}
                  >
                    <span className="font-mono text-xs sm:text-sm font-semibold">u</span>
                    <span className="text-base sm:text-xl font-arabic">ُ</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                    onClick={() => handleKeyPress('ً', 'av')}
                  >
                    <span className="font-mono text-xs sm:text-sm font-semibold">av</span>
                    <span className="text-base sm:text-xl font-arabic">ً</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                    onClick={() => handleKeyPress('ٍ', 'iv')}
                  >
                    <span className="font-mono text-xs sm:text-sm font-semibold">iv</span>
                    <span className="text-base sm:text-xl font-arabic">ٍ</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                    onClick={() => handleKeyPress('ٌ', 'uv')}
                  >
                    <span className="font-mono text-xs sm:text-sm font-semibold">uv</span>
                    <span className="text-base sm:text-xl font-arabic">ٌ</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                    onClick={() => handleKeyPress('ّ', 'p')}
                  >
                    <span className="font-mono text-xs sm:text-sm font-semibold">p</span>
                    <span className="text-base sm:text-xl font-arabic">ّ</span>
                  </Button>
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

      {/* About This Tool */}
      <Card>
        <CardHeader>
          <CardTitle>About This Tool</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            This transcription tool converts Arabic script to Latin text using the
            <strong> Wanji transliteration system</strong>. This system is designed to be
            readable for novice learners while preserving important phonetic distinctions.
          </p>
          <h4>Key Features:</h4>
          <ul>
            <li>
              <strong>Capital letters</strong> represent emphatic/heavy
              consonants pronounced further back in the mouth
            </li>
            <li>
              <strong>Digraphs </strong> like &quot;tv&quot;, &quot;dv&quot;, &quot;sv&quot;, &quot;gv&quot;, &quot;sc&quot;, &quot;dc&quot;, &quot;tc&quot;, &quot;zc&quot; represent specific Arabic sounds
            </li>
            <li>
              <strong>Tanwin </strong> (nunation) is represented as &quot;av&quot;, &quot;iv&quot;, &quot;uv&quot;
            </li>
            <li>
              <strong>Shadda</strong> (consonant doubling) doubles the previous consonant
            </li>
          </ul>
          <h4>Pronunciation Tips:</h4>
          <ul>
            <li><strong>g</strong> (ع) - like a surprised &quot;a&quot;</li>
            <li><strong>gv</strong> (غ) - gargling sound</li>
            <li><strong>x</strong> (ح) - like fogging up a window</li>
            <li><strong>xv</strong> (خ) - whispered gargle</li>
            <li><strong>q</strong> (ق) - deep in the throat</li>
            <li><strong>r</strong> (ر) - like the &quot;t&quot; in American &quot;water&quot;</li>
          </ul>
          <p className="mt-4">
            Learn more at{" "}
            <a
              href="https://www.hydrawe.org/pathways/Wanji/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              hydrawe.org/pathways/Wanji
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Arabic Letter Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Arabic Letter Reference</CardTitle>
          <CardDescription>
            Complete mapping of Arabic letters to their Latin transliteration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(arabicDescriptions).map(([arabic, description]) => (
              <div
                key={arabic}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setArabicText((prev) => prev + arabic)}
              >
                <span className="text-3xl font-arabic w-10 text-center">{arabic}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-semibold text-primary">
                    {arabicMapping[arabic] || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {description.split(" - ")[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
