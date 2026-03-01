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
            contents: prompt + `\n\nBreak this down into sentences for a highly polished educational animated video. 
            For each sentence, provide a highly detailed set of 'visual_tags' that describe exactly what should happen on screen.
            
            CRITICAL: If the prompt is about chemistry (like SN1, SN2, Markovnikov), you MUST break the reaction down mechanically step-by-step and use these exact mechanical tags to trigger the engine animations:
            - 'sn1_leaving_group' (to trigger a bond breaking and an atom detaching)
            - 'sn1_nucleophile_attack' (to trigger a nucleophile atom attacking a carbocation)
            - 'electron_flow' (to trigger glowing arrows moving between atoms)
            - 'carbocation' (to trigger a glowing positive molecule state)
            - 'markovnikov_addition' (to trigger two separate atoms colliding and bonding)
            
            Ensure the script is detailed, paced well, and explains the concept thoroughly with corresponding tags.`,
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
