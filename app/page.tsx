"use client"

import { ArabicTranscriber } from "@/components/arabic-transcriber"
import { CjkTranscriber } from "@/components/cjk-transcriber"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  transcribeJapanese,
  transcribeJapaneseLatin,
  transcribeJapaneseIpa,
  japaneseIpa,
  japaneseKeyboardRows,
  japanesePhrases,
  japaneseReference,
  japaneseReferenceRows,
} from "@/lib/japanese-mapping"
import { transcribeJapaneseWithKanji, toKanaReading } from "@/lib/japanese-kanji"
import {
  transcribeKorean,
  transcribeKoreanLatin,
  transcribeKoreanIpa,
  koreanKeyboardRows,
  koreanPhrases,
  koreanReference,
} from "@/lib/korean-mapping"
import {
  transcribeGerman, transcribeGermanLatin, transcribeGermanIpa, germanKeyboardRows, germanPhrases, germanReference,
  transcribeFrench, transcribeFrenchLatin, transcribeFrenchIpa, frenchKeyboardRows, frenchPhrases, frenchReference,
  transcribeSpanish, transcribeSpanishLatin, transcribeSpanishIpa, spanishKeyboardRows, spanishPhrases, spanishReference,
  transcribePortuguese, transcribePortugueseLatin, transcribePortugueseIpa, portugueseKeyboardRows, portuguesePhrases, portugueseReference,
} from "@/lib/european-mapping"

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Wei Transliteration</h1>
        </div>

        <Tabs defaultValue="arabic" className="w-full">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger className="min-h-9 px-2 text-xs sm:text-sm" value="arabic">Arabic</TabsTrigger>
            <TabsTrigger className="min-h-9 px-2 text-xs sm:text-sm" value="japanese">Japanese</TabsTrigger>
            <TabsTrigger className="min-h-9 px-2 text-xs sm:text-sm" value="korean">Korean</TabsTrigger>
            <TabsTrigger className="min-h-9 px-2 text-xs sm:text-sm" value="portuguese">Portuguese</TabsTrigger>
            <TabsTrigger className="min-h-9 px-2 text-xs sm:text-sm" value="german">German</TabsTrigger>
            <TabsTrigger className="min-h-9 px-2 text-xs sm:text-sm" value="french">French</TabsTrigger>
            <TabsTrigger className="min-h-9 px-2 text-xs sm:text-sm" value="spanish">Spanish</TabsTrigger>
          </TabsList>

          <TabsContent value="arabic">
            <ArabicTranscriber />
          </TabsContent>

          <TabsContent value="japanese">
            <CjkTranscriber
              scriptName="Japanese"
              langCode="ja"
              toLatin={transcribeJapanese}
              toLatinAsync={transcribeJapaneseWithKanji}
              toScript={transcribeJapaneseLatin}
              toIpa={transcribeJapaneseIpa}
              toPhoneticScriptAsync={toKanaReading}
              ipaMap={japaneseIpa}
              keyboardRows={japaneseKeyboardRows}
              keyboardColumns={5}
              keyboardCase={{
                lowerCount: 6,
                lowerLabel: "Hiragana (lowercase)",
                upperLabel: "Katakana (uppercase)",
                note: "The keyboard shows hiragana by default. Tap Caps to switch to katakana — uppercase codes produce katakana, lowercase codes produce hiragana.",
              }}
              phrases={japanesePhrases}
              reference={japaneseReference}
              referenceRows={japaneseReferenceRows}
              referenceTitle="Japanese Kana Reference"
              scriptPlaceholder="ここに日本語を入力してください..."
            />
          </TabsContent>

          <TabsContent value="korean">
            <CjkTranscriber
              scriptName="Korean"
              langCode="ko"
              toLatin={transcribeKorean}
              toScript={transcribeKoreanLatin}
              toIpa={transcribeKoreanIpa}
              keyboardRows={koreanKeyboardRows}
              phrases={koreanPhrases}
              reference={koreanReference}
              referenceTitle="Korean Jamo Reference"
              scriptPlaceholder="여기에 한국어를 입력하세요..."
            />
          </TabsContent>

          <TabsContent value="portuguese">
            <CjkTranscriber
              scriptName="Portuguese" langCode="pt" toLatin={transcribePortuguese} toScript={transcribePortugueseLatin}
              toIpa={transcribePortugueseIpa} keyboardRows={portugueseKeyboardRows} phrases={portuguesePhrases}
              reference={portugueseReference} referenceTitle="Portuguese Alphabet Reference"
              scriptPlaceholder="Digite texto em português aqui..."
            />
          </TabsContent>

          <TabsContent value="german"><CjkTranscriber scriptName="German" langCode="de" toLatin={transcribeGerman} toScript={transcribeGermanLatin} toIpa={transcribeGermanIpa} keyboardRows={germanKeyboardRows} phrases={germanPhrases} reference={germanReference} referenceTitle="German Alphabet Reference" scriptPlaceholder="Geben Sie hier deutschen Text ein..." /></TabsContent>
          <TabsContent value="french"><CjkTranscriber scriptName="French" langCode="fr" toLatin={transcribeFrench} toScript={transcribeFrenchLatin} toIpa={transcribeFrenchIpa} keyboardRows={frenchKeyboardRows} phrases={frenchPhrases} reference={frenchReference} referenceTitle="French Alphabet Reference" scriptPlaceholder="Saisissez du texte français ici..." /></TabsContent>
          <TabsContent value="spanish"><CjkTranscriber scriptName="Spanish" langCode="es" toLatin={transcribeSpanish} toScript={transcribeSpanishLatin} toIpa={transcribeSpanishIpa} keyboardRows={spanishKeyboardRows} phrases={spanishPhrases} reference={spanishReference} referenceTitle="Spanish Alphabet Reference" scriptPlaceholder="Escriba texto en español aquí..." /></TabsContent>

        </Tabs>
      </div>
    </main>
  )
}
