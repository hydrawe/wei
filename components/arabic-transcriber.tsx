"use client"

import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { transcribeArabic, arabicMapping, arabicDescriptions } from "@/lib/arabic-mapping"
import { Copy, Check, Trash2 } from "lucide-react"

export function ArabicTranscriber() {
  const [arabicText, setArabicText] = useState("")
  const [copied, setCopied] = useState(false)

  const transcription = useMemo(() => {
    return transcribeArabic(arabicText)
  }, [arabicText])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcription)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setArabicText("")
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
          <div className="space-y-2">
            <label htmlFor="arabic-input" className="text-sm font-medium">
              Arabic Text
            </label>
            <Textarea
              id="arabic-input"
              placeholder="اكتب النص العربي هنا..."
              className="min-h-32 text-xl text-right font-arabic leading-relaxed"
              dir="rtl"
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              {sampleTexts.map((sample) => (
                <Button
                  key={sample.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setArabicText(sample.arabic)}
                >
                  {sample.label}
                </Button>
              ))}
              {arabicText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="transcription-output" className="text-sm font-medium">
                Transliteration
              </label>
              {transcription && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
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
            <div
              id="transcription-output"
              className="min-h-32 p-3 border rounded-md bg-muted/50 text-xl font-mono leading-relaxed"
            >
              {transcription || (
                <span className="text-muted-foreground">
                  Transliteration will appear here...
                </span>
              )}
            </div>
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
