"use client"

import { useState, useEffect, useRef } from "react"
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
  const [englishText, setEnglishText] = useState("")
  const [chineseText, setChineseText] = useState("")
  const [copiedPlain, setCopiedPlain] = useState(false)
  const [copiedAccented, setCopiedAccented] = useState(false)
  const [copiedEnglish, setCopiedEnglish] = useState(false)
  const [copiedChinese, setCopiedChinese] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [isTranslating, setIsTranslating] = useState(false)
  // Tracks which field the user last edited so we know the translation direction
  const [source, setSource] = useState<"plain" | "accented" | "english" | "chinese" | null>(null)
  const lastProcessedRef = useRef<string>("")

  const reference = buildReference(forward)

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
      source === "english" ? englishText : source === "chinese" ? chineseText : accentedText
    const key = `${source}:${sourceText}`
    if (key === lastProcessedRef.current) return

    const run = async () => {
      lastProcessedRef.current = key

      if (!sourceText.trim()) {
        if (source !== "accented" && source !== "plain") {
          setAccentedText("")
          setPlainText("")
        }
        if (source !== "english") setEnglishText("")
        if (source !== "chinese") setChineseText("")
        return
      }

      setIsTranslating(true)
      try {
        if (source === "plain" || source === "accented") {
          const [en, zh] = await Promise.all([
            fetchTranslation(accentedText, `${langCode}|en`),
            fetchTranslation(accentedText, `${langCode}|zh`),
          ])
          setEnglishText(en)
          setChineseText(zh)
        } else if (source === "english") {
          const [accented, zh] = await Promise.all([
            fetchTranslation(englishText, `en|${langCode}`),
            fetchTranslation(englishText, "en|zh"),
          ])
          setAccentedText(accented)
          setPlainText(transcribeToPlain(accented, forward))
          setChineseText(zh)
        } else if (source === "chinese") {
          const [accented, en] = await Promise.all([
            fetchTranslation(chineseText, `zh|${langCode}`),
            fetchTranslation(chineseText, "zh|en"),
          ])
          setAccentedText(accented)
          setPlainText(transcribeToPlain(accented, forward))
          setEnglishText(en)
        }
      } finally {
        setIsTranslating(false)
      }
    }

    const debounceTimer = setTimeout(run, 600)
    return () => clearTimeout(debounceTimer)
  }, [source, accentedText, englishText, chineseText, langCode, forward])

  const handlePlainChange = (value: string) => {
    setSource("plain")
    setPlainText(value)
    setAccentedText(transcribeToAccented(value, forward))
  }

  const handleAccentedChange = (value: string) => {
    setSource("accented")
    setAccentedText(value)
    setPlainText(transcribeToPlain(value, forward))
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
    setPlainText("")
    setAccentedText("")
    setEnglishText("")
    setChineseText("")
    setSource(null)
    lastProcessedRef.current = ""
  }

  const handleKeyPress = (code: string, char: string) => {
    setSource("accented")
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
                  <label htmlFor={`${language}-english-input`} className="text-sm font-medium">
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
                  id={`${language}-english-input`}
                  placeholder="Type English here..."
                  className="min-h-24 !text-[18px] !leading-normal"
                  value={englishText}
                  onChange={(e) => handleEnglishChange(e.target.value)}
                />
              </div>

              {/* Chinese */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor={`${language}-chinese-input`} className="text-sm font-medium">
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
                  id={`${language}-chinese-input`}
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
