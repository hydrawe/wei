"use client"

import { ArabicTranscriber } from "@/components/arabic-transcriber"
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
  transcribeRussian,
  transcribeRussianLatin,
  transcribeRussianIpa,
  russianIpa,
  russianMapping,
  russianDescriptions,
  russianKeyboardRows,
  russianPhrases,
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
            <TabsTrigger value="persian">Persian</TabsTrigger>
            <TabsTrigger value="russian">Russian</TabsTrigger>
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

        </Tabs>
      </div>
    </main>
  )
}
