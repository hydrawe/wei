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
  transcribeRussian,
  transcribeRussianLatin,
  transcribeRussianIpa,
  russianKeyboardRows,
  russianPhrases,
  russianReference,
} from "@/lib/russian-mapping"

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Wei Transliteration</h1>
        </div>

        <Tabs defaultValue="arabic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
            <TabsTrigger value="arabic">Arabic</TabsTrigger>
            <TabsTrigger value="japanese">Japanese</TabsTrigger>
            <TabsTrigger value="russian">Russian</TabsTrigger>
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

          <TabsContent value="russian">
            <CjkTranscriber
              scriptName="Russian"
              langCode="ru"
              toLatin={transcribeRussian}
              toScript={transcribeRussianLatin}
              toIpa={transcribeRussianIpa}
              keyboardRows={russianKeyboardRows}
              phrases={russianPhrases}
              reference={russianReference}
              referenceTitle="Russian Cyrillic Reference"
              scriptPlaceholder="Введите русский текст здесь..."
            />
          </TabsContent>

        </Tabs>
      </div>
    </main>
  )
}
