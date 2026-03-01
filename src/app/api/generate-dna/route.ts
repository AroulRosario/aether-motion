import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export const maxDuration = 60; // 60 seconds max duration (works on pro)
export const runtime = 'edge'; // Edge function (provides better stream/execution profiles on Hobby limit)

export async function POST(req: Request) {
    try {
        const { apiKey, model, prompt } = await req.json();

        if (!apiKey || !model || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const responseSchema: Schema = {
            type: Type.ARRAY,
            description: "List of DNA elements for the video",
            items: {
                type: Type.OBJECT,
                properties: {
                    sentence: { type: Type.STRING, description: "The sentence to be spoken." },
                    animation_type: {
                        type: Type.STRING,
                        description: "The animation style. Must pick one.",
                        enum: ["dynamic", "slide", "fade", "zoom", "spring"]
                    },
                    visual_tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Visual thematic tags like 'blue-neon', 'abstract', etc."
                    }
                },
                required: ["sentence", "animation_type", "visual_tags"]
            }
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt + "\n\nBreak this down into sentences for a video. For each sentence give a visual animation type and visual tags.",
            config: {
                responseMimeType: "application/json",
                responseSchema
            }
        });

        if (response.text) {
            const dna = JSON.parse(response.text);
            return NextResponse.json({ dna });
        } else {
            throw new Error('No text generated');
        }

    } catch (error: any) {
        console.error('Error in generate-dna:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
