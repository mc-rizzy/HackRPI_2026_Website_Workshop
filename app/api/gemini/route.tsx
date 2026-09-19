import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { NextResponse } from 'next/server';

// Ensure your environment variable exists
const apiKey = process.env.DookieDookieGeminiKey;

// Initialize SDK
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server environment variable DookieDookieGeminiKey is missing.' },
        { status: 500 }
      );
    }

    // Make the non-streaming generation call
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
            temperature: Math.random()*0.5, // Maximum randomness so word count varies wildy
            topP: 0.95,
        },
      contents: prompt,
    });

    // Return the generated text back to your page frontend
    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Error generating content:', error);
    
    // Returning error.message ensures your frontend displays the real error reason
    return NextResponse.json(
      { error: error?.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}