"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { transcribeArabic, arabicMapping, arabicDescriptions } from "@/lib/arabic-mapping"
import { Copy, Check, Trash2, Keyboard } from "lucide-react"

// Reverse mapping: Latin transliteration -> Arabic character
const latinToArabic: Record<string, string> = {
  // Multi-character mappings (digraphs) - order matters for matching
  'eaa': 'آ',
  'yee': 'ئ',
  'wee': 'ؤ',
  'aee': 'إ',
  'ea': 'أ',
  'dh': 'ذ',
  'th': 'ث',
  'sh': 'ش',
  'gh': 'غ',
  'an': 'ً',
  'un': 'ٌ',
  'in': 'ٍ',
  // Single character mappings
  'e': 'ء',
  'a': 'ا',
  'I': 'ى',
  'y': 'ي',
  'w': 'و',
  'r': 'ر',
  'z': 'ز',
  'd': 'د',
  't': 'ت',
  's': 'س',
  'l': 'ل',
  'n': 'ن',
  'S': 'ص',
  'D': 'ض',
  'T': 'ط',
  'Z': 'ظ',
  'b': 'ب',
  'f': 'ف',
  'k': 'ك',
  'q': 'ق',
  'g': 'ع',
  'h': 'ه',
  'j': 'ج',
  'H': 'ح',
  'K': 'خ',
  'm': 'م',
  // Vowel diacritics as standalone keys
  'i': 'ِ',
  'u': 'ُ',
}

// Keyboard layout with Latin keys grouped logically
const keyboardRows = [
  // Row 1: Digraphs
  [
    { latin: 'th', arabic: 'ث', label: 'th' },
    { latin: 'dh', arabic: 'ذ', label: 'dh' },
    { latin: 'sh', arabic: 'ش', label: 'sh' },
    { latin: 'gh', arabic: 'غ', label: 'gh' },
    { latin: 'eaa', arabic: 'آ', label: 'eaa' },
    { latin: 'ea', arabic: 'أ', label: 'ea' },
    { latin: 'aee', arabic: 'إ', label: 'aee' },
  ],
  // Row 2: Basic consonants
  [
    { latin: 'b', arabic: 'ب', label: 'b' },
    { latin: 't', arabic: 'ت', label: 't' },
    { latin: 'j', arabic: 'ج', label: 'j' },
    { latin: 'd', arabic: 'د', label: 'd' },
    { latin: 'r', arabic: 'ر', label: 'r' },
    { latin: 'z', arabic: 'ز', label: 'z' },
    { latin: 's', arabic: 'س', label: 's' },
  ],
  // Row 3: More consonants
  [
    { latin: 'f', arabic: 'ف', label: 'f' },
    { latin: 'k', arabic: 'ك', label: 'k' },
    { latin: 'l', arabic: 'ل', label: 'l' },
    { latin: 'm', arabic: 'م', label: 'm' },
    { latin: 'n', arabic: 'ن', label: 'n' },
    { latin: 'h', arabic: 'ه', label: 'h' },
    { latin: 'y', arabic: 'ي', label: 'y' },
    { latin: 'w', arabic: 'و', label: 'w' },
  ],
  // Row 4: Emphatic consonants (capitals)
  [
    { latin: 'S', arabic: 'ص', label: 'S' },
    { latin: 'D', arabic: 'ض', label: 'D' },
    { latin: 'T', arabic: 'ط', label: 'T' },
    { latin: 'Z', arabic: 'ظ', label: 'Z' },
    { latin: 'H', arabic: 'ح', label: 'H' },
    { latin: 'K', arabic: 'خ', label: 'K' },
    { latin: 'q', arabic: 'ق', label: 'q' },
    { latin: 'g', arabic: 'ع', label: 'g' },
  ],
  // Row 5: Vowels, hamza, special
  [
    { latin: 'a', arabic: 'ا', label: 'a' },
    { latin: 'i', arabic: 'ِ', label: 'i' },
    { latin: 'u', arabic: 'ُ', label: 'u' },
    { latin: 'e', arabic: 'ء', label: 'e' },
    { latin: 'I', arabic: 'ى', label: 'I' },
    { latin: 'an', arabic: 'ً', label: 'an' },
    { latin: 'un', arabic: 'ٌ', label: 'un' },
    { latin: 'in', arabic: 'ٍ', label: 'in' },
  ],
]

export function ArabicTranscriber() {
  const [arabicText, setArabicText] = useState("")
  const [latinText, setLatinText] = useState("")
  const [copiedLatin, setCopiedLatin] = useState(false)
  const [copiedArabic, setCopiedArabic] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)

  const handleCopyLatin = async () => {
    await navigator.clipboard.writeText(latinText)
    setCopiedLatin(true)
    setTimeout(() => setCopiedLatin(false), 2000)
  }

  const handleCopyArabic = async () => {
    await navigator.clipboard.writeText(arabicText)
    setCopiedArabic(true)
    setTimeout(() => setCopiedArabic(false), 2000)
  }

  const handleClear = () => {
    setArabicText("")
    setLatinText("")
  }

  const handleKeyPress = (arabic: string, latin: string) => {
    setArabicText((prev) => prev + arabic)
    setLatinText((prev) => prev + latin)
  }

  const handleBackspace = () => {
    setArabicText((prev) => [...prev].slice(0, -1).join(""))
    // For latin, we need to handle multi-char sequences
    setLatinText((prev) => {
      // Simple approach: remove last character
      return prev.slice(0, -1)
    })
  }

  const handleSpace = () => {
    setArabicText((prev) => prev + " ")
    setLatinText((prev) => prev + " ")
  }

  // Sample texts for demonstration
  const sampleTexts = [
    { label: "Bismillah", arabic: "بِسْمِ اللَّهِ" },
    { label: "Salam", arabic: "السَّلَامُ عَلَيْكُم" },
    { label: "Thank you", arabic: "شُكْرًا" },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Arabic Transcriber</CardTitle>
          <CardDescription>
            Enter Arabic text below to see its transliteration using the Wanji system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Side by side: Latin on left, Arabic on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Latin Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="latin-input" className="text-sm font-medium">
                  Latin Text
                </label>
                {latinText && (
                  <Button variant="ghost" size="sm" onClick={handleCopyLatin}>
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
                className="min-h-32 text-xl font-mono leading-relaxed"
                value={latinText}
                onChange={(e) => setLatinText(e.target.value)}
              />
            </div>

            {/* Right: Arabic Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="arabic-input" className="text-sm font-medium">
                  Arabic Text
                </label>
                {arabicText && (
                  <Button variant="ghost" size="sm" onClick={handleCopyArabic}>
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
                className="min-h-32 text-xl text-right font-arabic leading-relaxed"
                dir="rtl"
                value={arabicText}
                onChange={(e) => setArabicText(e.target.value)}
              />
            </div>
          </div>

          {/* Sample texts and clear button */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm text-muted-foreground">Try:</span>
            {sampleTexts.map((sample) => (
              <Button
                key={sample.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setArabicText(sample.arabic)
                  setLatinText(transcribeArabic(sample.arabic))
                }}
              >
                {sample.label}
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
                Clear Both
              </Button>
            )}
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
              <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
                {keyboardRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex flex-wrap gap-1 justify-center">
                    {row.map((key) => (
                      <Button
                        key={key.latin}
                        variant="outline"
                        size="sm"
                        className="min-w-10 h-12 flex flex-col items-center justify-center gap-0.5 px-2"
                        onClick={() => handleKeyPress(key.arabic, key.latin)}
                      >
                        <span className="font-mono text-sm font-semibold">{key.label}</span>
                        <span className="text-lg font-arabic">{key.arabic}</span>
                      </Button>
                    ))}
                  </div>
                ))}
                {/* Bottom row with space and backspace */}
                <div className="flex gap-1 justify-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-4"
                    onClick={() => handleKeyPress('ة', 'ta')}
                  >
                    <span className="font-mono text-xs mr-1">ta</span>
                    <span className="font-arabic">ة</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-4"
                    onClick={() => handleKeyPress('ّ', '~')}
                  >
                    <span className="font-mono text-xs mr-1">×2</span>
                    <span className="font-arabic">ّ</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-8"
                    onClick={handleSpace}
                  >
                    Space
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-4"
                    onClick={handleBackspace}
                  >
                    ← Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reference" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reference">Reference Chart</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="reference">
          <Card>
            <CardHeader>
              <CardTitle>Arabic Letter Reference</CardTitle>
              <CardDescription>
                Complete mapping of Arabic letters to their transliteration
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
        </TabsContent>
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About This Tool</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                This transcription tool converts Arabic script to a romanized form using the
                <strong> Wanji transliteration system</strong>. This system is designed to be
                readable for novice learners while preserving important phonetic distinctions.
              </p>
              <h4>Key Features:</h4>
              <ul>
                <li>
                  <strong>Capital letters</strong> (S, D, T, Z, H, K) represent emphatic/heavy
                  consonants pronounced further back in the mouth
                </li>
                <li>
                  <strong>Digraphs</strong> like &quot;th&quot;, &quot;dh&quot;, &quot;sh&quot;, &quot;gh&quot; represent specific Arabic sounds
                </li>
                <li>
                  <strong>Tanwin</strong> (nunation) is represented as &quot;an&quot;, &quot;un&quot;, &quot;in&quot;
                </li>
                <li>
                  <strong>Shadda</strong> (consonant doubling) doubles the previous consonant
                </li>
              </ul>
              <h4>Pronunciation Tips:</h4>
              <ul>
                <li><strong>g</strong> (ع) - like a surprised &quot;a&quot;</li>
                <li><strong>gh</strong> (غ) - gargling sound</li>
                <li><strong>H</strong> (ح) - like fogging up a window</li>
                <li><strong>K</strong> (خ) - whispered gargle</li>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
