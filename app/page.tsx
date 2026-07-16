"use client"

import { ArabicTranscriber } from "@/components/arabic-transcriber"
import { ArabicPersianComparison } from "@/components/arabic-persian-comparison"
import { CjkTranscriber } from "@/components/cjk-transcriber"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  transcribeRussian,
  transcribeRussianLatin,
  transcribeRussianIpa,
  russianIpa,
  russianMapping,
  russianDescriptions,
  russianKeyboardRows,
  russianPhrases,
} from "@/lib/russian-mapping"
import {
  transcribeKorean,
  transcribeKoreanLatin,
  transcribeKoreanIpa,
  koreanKeyboardRows,
  koreanReference,
  koreanPhrases,
} from "@/lib/korean-mapping"
export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Wei Transliteration</h1>
        </div>

        <Tabs defaultValue="arabic-persian" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
            <TabsTrigger value="arabic-persian">Arabic &amp; Persian</TabsTrigger>
            <TabsTrigger value="russian">Russian</TabsTrigger>
            <TabsTrigger value="korean">Korean</TabsTrigger>
          </TabsList>

          <TabsContent value="arabic-persian">
            <ArabicPersianComparison />
          </TabsContent>

          <TabsContent value="russian">
            <ArabicTranscriber
              scriptName="Russian"
              langCode="ru"
              scriptDir="ltr"
              showDiacritics={false}
              toLatin={transcribeRussian}
              toScript={transcribeRussianLatin}
              toIpa={transcribeRussianIpa}
              ipaMap={russianIpa}
              mapping={russianMapping}
              descriptions={russianDescriptions}
              keyboardRows={russianKeyboardRows}
              phrases={russianPhrases}
              scriptPlaceholder="Введите русский текст здесь..."
              keyFeatures={[
                {
                  term: "Digraphs",
                  description: '"zh" (ж), "ch" (ч), "xh" (ш) and "sh" (щ) each represent a single Cyrillic letter',
                },
                {
                  term: "Yotated vowels",
                  description: '"yu" (ю), "ya" (я) and "ye" (ё) start with a "y" glide',
                },
                {
                  term: "Soft & hard signs",
                  description: '"q" (ь) softens the previous consonant; "qh" (ъ) is a silent hard separator',
                },
                { term: "One-to-one", description: "most Latin codes map directly to a single Cyrillic letter" },
              ]}
              pronunciationTips={[
                { code: "x", char: "х", description: 'like the "ch" in Scottish "loch"' },
                { code: "zh", char: "ж", description: 'like the "s" in "measure"' },
                { code: "xh", char: "ш", description: 'a hard "sh" as in "shoe"' },
                { code: "sh", char: "щ", description: 'a softer, longer "sh"' },
                { code: "c", char: "ц", description: 'like "ts" in "cats"' },
                { code: "r", char: "р", description: "a rolled or trilled r" },
              ]}
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

        </Tabs>
      </div>
    </main>
  )
}
