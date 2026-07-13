"use client"

import { ArabicTranscriber } from "@/components/arabic-transcriber"
import { CjkTranscriber } from "@/components/cjk-transcriber"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  transcribePersian,
  transcribePersianLatin,
  persianMapping,
  persianDescriptions,
  persianKeyboardRows,
  persianPhrases,
} from "@/lib/persian-mapping"
import { transcribePersianIpa, persianIpa } from "@/lib/ipa-mapping"
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
            <TabsTrigger value="persian">Persian</TabsTrigger>
            <TabsTrigger value="japanese">Japanese</TabsTrigger>
          </TabsList>

          <TabsContent value="arabic">
            <ArabicTranscriber />
          </TabsContent>

          <TabsContent value="persian">
            <ArabicTranscriber
              scriptName="Persian"
              langCode="fa"
              pivotChineseThroughEnglish
              toLatin={transcribePersian}
              toScript={transcribePersianLatin}
              toIpa={transcribePersianIpa}
              ipaMap={persianIpa}
              mapping={persianMapping}
              descriptions={persianDescriptions}
              keyboardRows={persianKeyboardRows}
              phrases={persianPhrases}
              scriptPlaceholder="متن فارسی را اینجا بنویسید..."
              keyFeatures={[
                {
                  term: "Persian-only letters",
                  description: 'add "p" (پ), "jv" (چ, "ch"), "zv" (ژ, "zh") and "kv" (گ, hard "g")',
                },
                {
                  term: "Merged sounds",
                  description:
                    "several Arabic letters share one Persian pronunciation (e.g. the letters coded s / z / t); the distinct codes preserve the original spelling",
                },
                {
                  term: "Digraphs",
                  description: "pair a base letter with a second character to mark a distinct Persian letter or sound",
                },
                { term: "Shadda", description: "(consonant doubling) doubles the previous consonant" },
              ]}
              pronunciationTips={[
                { code: "q", char: "ق", description: 'identical to "gv" (غ) in Persian: a voiced "gargled" sound' },
                { code: "gv", char: "غ", description: 'same sound as "q" (ق), deep in the throat' },
                { code: "xv", char: "خ", description: 'a raspy "kh", like clearing your throat' },
                { code: "x", char: "ح", description: 'a plain "h", same as "h" (ه)' },
                { code: "g", char: "ع", description: "a glottal catch in the voice, often silent" },
                { code: "r", char: "ر", description: "a rolled or tapped r" },
              ]}
            />
          </TabsContent>

          <TabsContent value="japanese">
            <CjkTranscriber
              scriptName="Japanese"
              langCode="ja"
              toLatin={transcribeJapanese}
              toScript={transcribeJapaneseLatin}
              toIpa={transcribeJapaneseIpa}
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

        </Tabs>
      </div>
    </main>
  )
}
