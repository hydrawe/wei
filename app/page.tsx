"use client"

import { ArabicTranscriber } from "@/components/arabic-transcriber"
import { AccentTranscriber } from "@/components/accent-transcriber"
import { CjkTranscriber } from "@/components/cjk-transcriber"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { spanishForward, frenchForward, portugueseForward } from "@/lib/accent-mapping"
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
import {
  spanishToIpa,
  spanishCharIpa,
  frenchToIpa,
  frenchCharIpa,
  portugueseToIpa,
  portugueseCharIpa,
} from "@/lib/latin-ipa"

const spanishPhrases = [
  { english: "Spanish (Español)", plain: "Espan0ol" },
  { english: "Goodbye (Adiós)", plain: "Adio2s" },
  { english: "How (Cómo)", plain: "Co2mo" },
]

const frenchPhrases = [
  { english: "Summer (Été)", plain: "E2te2" },
  { english: "Hospital (Hôpital)", plain: "Ho3pital" },
  { english: "Boy (Garçon)", plain: "Garc5on" },
]

const portuguesePhrases = [
  { english: "Bread (Pão)", plain: "Pa0o" },
  { english: "Coffee (Café)", plain: "Cafe2" },
  { english: "Heart (Coração)", plain: "Corac5a0o" },
]

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Transliteration Tool</h1>
        </div>

        <Tabs defaultValue="arabic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 h-auto">
            <TabsTrigger value="arabic">Arabic</TabsTrigger>
            <TabsTrigger value="japanese">Japanese</TabsTrigger>
            <TabsTrigger value="french">French</TabsTrigger>
            <TabsTrigger value="spanish">Spanish</TabsTrigger>
            <TabsTrigger value="portuguese">Portuguese</TabsTrigger>
          </TabsList>

          <TabsContent value="arabic">
            <ArabicTranscriber />
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
              phrases={japanesePhrases}
              reference={japaneseReference}
              referenceRows={japaneseReferenceRows}
              referenceTitle="Japanese Kana Reference"
              scriptPlaceholder="ここに日本語を入力してください..."
            />
          </TabsContent>

          <TabsContent value="french">
            <AccentTranscriber
              language="French"
              langCode="fr"
              forward={frenchForward}
              placeholder="Tapez le texte français ici..."
              phrases={frenchPhrases}
              toIpa={frenchToIpa}
              charIpa={frenchCharIpa}
            />
          </TabsContent>

          <TabsContent value="spanish">
            <AccentTranscriber
              language="Spanish"
              langCode="es"
              forward={spanishForward}
              placeholder="Escribe el texto en español aquí..."
              phrases={spanishPhrases}
              toIpa={spanishToIpa}
              charIpa={spanishCharIpa}
            />
          </TabsContent>

          <TabsContent value="portuguese">
            <AccentTranscriber
              language="Portuguese"
              langCode="pt"
              forward={portugueseForward}
              placeholder="Digite o texto em português aqui..."
              phrases={portuguesePhrases}
              toIpa={portugueseToIpa}
              charIpa={portugueseCharIpa}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
