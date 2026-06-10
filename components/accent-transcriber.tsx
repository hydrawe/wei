"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  transcribeToAccented,
  transcribeToPlain,
  buildReference,
} from "@/lib/accent-mapping"
import { Copy, Check, Trash2, Keyboard, Languages, Loader2 } from "lucide-react"

interface AccentTranscriberProps {
  language: string
  langCode: string
  forward: Record<string, string>
  placeholder: string
  phrases: { english: string; plain: string }[]
}

export function AccentTranscriber({ language, langCode, forward, placeholder, phrases }: AccentTranscriberProps) {
  const [plainText, setPlainText] = useState("")
  const [accentedText, setAccentedText] = useState("")
  const [copiedPlain, setCopiedPlain] = useState(false)
  const [copiedAccented, setCopiedAccented] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [englishMeaning, setEnglishMeaning] = useState("")
  const [chineseMeaning, setChineseMeaning] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)

  const reference = buildReference(forward)

  // Fetch English and Chinese translations when accented text changes
  useEffect(() => {
    const translateText = async () => {
      if (!accentedText.trim()) {
        setEnglishMeaning("")
        setChineseMeaning("")
        return
      }

      setIsTranslating(true)
      try {
        const [enRes, zhRes] = await Promise.all([
          fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(accentedText)}&langpair=${langCode}|en`),
          fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(accentedText)}&langpair=${langCode}|zh`),
        ])
        const enData = await enRes.json()
        const zhData = await zhRes.json()
        setEnglishMeaning(
          enData.responseStatus === 200 && enData.responseData?.translatedText
            ? enData.responseData.translatedText
            : ""
        )
        setChineseMeaning(
          zhData.responseStatus === 200 && zhData.responseData?.translatedText
            ? zhData.responseData.translatedText
            : ""
        )
      } catch {
        setEnglishMeaning("")
        setChineseMeaning("")
      } finally {
        setIsTranslating(false)
      }
    }

    const debounceTimer = setTimeout(translateText, 500)
    return () => clearTimeout(debounceTimer)
  }, [accentedText, langCode])

  const handlePlainChange = (value: string) => {
    setPlainText(value)
    setAccentedText(transcribeToAccented(value, forward))
  }

  const handleAccentedChange = (value: string) => {
    setAccentedText(value)
    setPlainText(transcribeToPlain(value, forward))
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
    setPlainText("")
    setAccentedText("")
  }

  const handleKeyPress = (code: string, char: string) => {
    setPlainText((prev) => prev + code)
    setAccentedText((prev) => prev + char)
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Reversible conversion note */}
          <p className="text-sm text-muted-foreground rounded-lg border bg-muted/30 p-3">
            The conversion between Latin Text and {language} Text is fully reversible. You can type in
            either Latin Text or {language} Text, and the other updates automatically.
          </p>

          {/* Side by side: Latin on left, Accented on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Latin Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={`${language}-plain-input`} className="text-sm font-medium">
                  Latin Text
                </label>
                {plainText && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(plainText, setCopiedPlain)}>
                    {copiedPlain ? (
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
                id={`${language}-plain-input`}
                placeholder="Type Latin transliteration here..."
                className="min-h-32 !text-[20px] font-mono !leading-normal"
                value={plainText}
                onChange={(e) => handlePlainChange(e.target.value)}
              />
            </div>

            {/* Right: Accented Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={`${language}-accented-input`} className="text-sm font-medium">
                  {language} Text
                </label>
                {accentedText && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(accentedText, setCopiedAccented)}>
                    {copiedAccented ? (
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
                id={`${language}-accented-input`}
                placeholder={placeholder}
                className="min-h-32 !text-[20px] !leading-normal"
                value={accentedText}
                onChange={(e) => handleAccentedChange(e.target.value)}
              />
            </div>
          </div>

          {/* Common Phrases */}
          {phrases.length > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-muted-foreground">Try:</span>
              {phrases.map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handlePlainChange(phrase.plain)}
                  title={phrase.english}
                >
                  {phrase.english}
                </Button>
              ))}
              {(plainText || accentedText) && (
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
          )}

          {/* Translation Sections - Always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* English Meaning */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">English Meaning</label>
              </div>
              {!accentedText.trim() ? (
                <p className="text-sm text-muted-foreground italic">Enter {language} text to see translation</p>
              ) : isTranslating ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Translating...</span>
                </div>
              ) : englishMeaning ? (
                <p className="text-base">{englishMeaning}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Translation not available</p>
              )}
            </div>

            {/* Chinese Meaning */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Chinese Meaning</label>
              </div>
              {!accentedText.trim() ? (
                <p className="text-sm text-muted-foreground italic">Enter {language} text to see translation</p>
              ) : isTranslating ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Translating...</span>
                </div>
              ) : chineseMeaning ? (
                <p className="text-base">{chineseMeaning}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Translation not available</p>
              )}
            </div>
          </div>

          {/* Virtual Keyboard */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                {language} Keyboard
              </label>
              <Button variant="ghost" size="sm" onClick={() => setShowKeyboard(!showKeyboard)}>
                {showKeyboard ? "Hide" : "Show"}
              </Button>
            </div>
            {showKeyboard && (
              <div className="p-2 sm:p-4 border rounded-lg bg-muted/30">
                <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
                  {reference.map((key) => (
                    <Button
                      key={key.code}
                      variant="outline"
                      size="sm"
                      className="min-w-10 sm:min-w-11 h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2.5"
                      onClick={() => handleKeyPress(key.code, key.char)}
                    >
                      <span className="font-mono text-xs sm:text-sm font-semibold">{key.code}</span>
                      <span className="text-base sm:text-xl">{key.char}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reference Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{language} Character Reference</CardTitle>
          <CardDescription>
            Mapping of Latin codes to {language} accented characters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {reference.map((key) => (
              <div
                key={key.code}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleAccentedChange(accentedText + key.char)}
              >
                <span className="text-2xl w-8 text-center">{key.char}</span>
                <div className="font-mono text-sm font-semibold text-primary">{key.code}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
