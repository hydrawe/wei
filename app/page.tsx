"use client"

import { ArabicTranscriber } from "@/components/arabic-transcriber"
import { AccentTranscriber } from "@/components/accent-transcriber"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { spanishForward, frenchForward } from "@/lib/accent-mapping"

const spanishPhrases = [
  { english: "Hello (Hola)", plain: "Hola" },
  { english: "Thank you (Gracias)", plain: "Gracias" },
  { english: "How are you? (¿Cómo estás?)", plain: "¿Cokmo estaks?" },
  { english: "Spanish (Español)", plain: "Espanhol" },
  { english: "Goodbye (Adiós)", plain: "Adioks" },
]

const frenchPhrases = [
  { english: "Hello (Bonjour)", plain: "Bonjour" },
  { english: "Thank you (Merci)", plain: "Merci" },
  { english: "Where? (Où)", plain: "Ouy" },
  { english: "Summer (Été)", plain: "Ektek" },
  { english: "Hospital (Hôpital)", plain: "Hohpital" },
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
              forward={frenchForward}
              placeholder="Tapez le texte français ici..."
              phrases={frenchPhrases}
            />
          </TabsContent>

          <TabsContent value="spanish">
            <AccentTranscriber
              language="Spanish"
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
