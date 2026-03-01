import { NextResponse } from 'next/server';


export const maxDuration = 60; // 60 seconds max duration (works on pro)
export const runtime = 'edge'; // Edge function (provides better stream/execution profiles on Hobby limit)

export async function POST(req: Request) {
    try {
        const { apiKey, model, prompt } = await req.json();

        if (!apiKey || !model || !prompt) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const responseSchema = {
            type: "ARRAY",
            description: "List of DNA elements for the video",
            items: {
                type: "OBJECT",
                properties: {
                    sentence: { type: "STRING", description: "The sentence to be spoken." },
                    animation_type: {
                        type: "STRING",
                        description: "The animation style. Must pick one.",
                        enum: ["dynamic", "slide", "fade", "zoom", "spring"]
                    },
                    visual_tags: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "Visual thematic tags like 'blue-neon', 'abstract', etc."
                    }
                },
                required: ["sentence", "animation_type", "visual_tags"]
            }
        };

        const fetchBody = {
            contents: [{
                parts: [{
                    text: prompt + `\n\nACT AS A MASTER LEVEL CREATIVE DIRECTOR AND SCIENTIFIC EXPLAINER.
Break this down into sentences for a highly polished, educational animated video. 
For each sentence, write in EXTREME detail what the exact visual on screen should be. The script should be lengthy, accurate, and scene-by-scene perfectly aligned with the visuals.

CRITICAL: If the prompt is about chemistry (like SN1, SN2, Markovnikov, Aldol Condensation), you MUST break the reaction down mechanically step-by-step and use these exact mechanical tags in the 'visual_tags' array to trigger the engine animations:
- 'sn1_leaving_group' (to trigger a bond breaking and an atom/group detaching)
- 'sn1_nucleophile_attack' (to trigger a nucleophile atom attacking a carbocation or electrophile)
- 'electron_flow' (to trigger glowing arrows moving between atoms)
- 'carbocation' (to trigger a glowing positive molecule state)
- 'markovnikov_addition' (to trigger two separate atoms colliding and bonding)
- 'chemistry' (ALWAYS include this tag if the topic is chemistry so the engine knows to route it correctly)

Ensure the script is very detailed, scene-by-scene accurate, paced well, and explains the concept flawlessly. The visual_tags must be accurate and specifically chosen from the exact list above to trigger the 2D physics engine. Do not hallucinate non-existent chemistry tags. Make the visual description as vivid as possible.`
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema
            }
        };

        const modelName = model.startsWith('models/') ? model : `models/${model}`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fetchBody)
        });

        const data = await res.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedText) {
            const dna = JSON.parse(generatedText);
            return NextResponse.json({ dna });
        } else {
            throw new Error('No valid text returned from Gemini API');
        }

    } catch (error: any) {
        console.error('Error in generate-dna:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
