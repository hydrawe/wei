"use client"

import { ArabicTranscriber } from "@/components/arabic-transcriber"
import { AccentTranscriber } from "@/components/accent-transcriber"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { spanishForward, frenchForward } from "@/lib/accent-mapping"

const spanishPhrases = [
  { english: "Spanish (Español)", plain: "Espanhol" },
  { english: "Goodbye (Adiós)", plain: "Adioks" },
  { english: "How (Cómo)", plain: "Cokmo" },
]

const frenchPhrases = [
  { english: "Summer (Été)", plain: "Ektek" },
  { english: "Hospital (Hôpital)", plain: "Hojpital" },
  { english: "Boy (Garçon)", plain: "Garcson" },
]

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Transliteration Tool</h1>
        </div>

        <Tabs defaultValue="arabic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="arabic">Arabic</TabsTrigger>
            <TabsTrigger value="french">French</TabsTrigger>
            <TabsTrigger value="spanish">Spanish</TabsTrigger>
          </TabsList>

          <TabsContent value="arabic">
            <ArabicTranscriber />
          </TabsContent>

          <TabsContent value="french">
            <AccentTranscriber
              language="French"
              langCode="fr"
              forward={frenchForward}
              placeholder="Tapez le texte français ici..."
              phrases={frenchPhrases}
            />
          </TabsContent>

          <TabsContent value="spanish">
            <AccentTranscriber
              language="Spanish"
              langCode="es"
              forward={spanishForward}
              placeholder="Escribe el texto en español aquí..."
              phrases={spanishPhrases}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
