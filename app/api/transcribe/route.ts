import { NextResponse } from "next/server"
import { z } from "zod"

const envSchema = z.object({
  GOOGLE_AI_API_KEY: z.string(),
})

const transcribeSchema = z.object({
  audioData: z.string(),
  language: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    // Validate environment variables
    const env = envSchema.parse({
      GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    })

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = (formData.get("language") as string) || "en"

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Call Google Generative Language API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${env.GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Please analyze this audio and extract ONLY words that are names of cities, locations, states, or countries. Return ONLY the location name mentioned in the audio. Do not include any other words or explanations. If audio is empty or you do not find anything said in the audio file return 'AUDIO NOT RECOGNIZED'. Only return the name if its in the audio, otherwise return 'AUDIO NOT RECOGNIZED'"
            }, {
              inline_data: {
                mime_type: audioFile.type,
                data: base64Audio
              }
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          }
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Transcription failed: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()

    console.log("data", JSON.stringify(data, null, 2))
    
    // Extract the transcript from the response
    const transcript:string = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    if(transcript.includes("AUDIO NOT RECOGNIZED")){
      throw new Error(`Transcription failed: Audio blank`)
    }
    
    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("Transcription API error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Transcription failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
