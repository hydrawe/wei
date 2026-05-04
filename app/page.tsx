import { ArabicTranscriber } from "@/components/arabic-transcriber"

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Arabic Transliteration Tool
          </h1>
          <p className="text-muted-foreground text-lg">
            Convert Arabic script to readable romanized text using the Wanji system
          </p>
        </div>
        <ArabicTranscriber />
      </div>
    </main>
  )
}
