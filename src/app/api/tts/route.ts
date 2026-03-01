import { NextResponse } from 'next/server';

export const maxDuration = 60; // 60 seconds max duration
export const runtime = 'edge'; // Edge function

export async function POST(req: Request) {
    try {
        const { text, apiKey, voiceName } = await req.json();

        if (!text || !apiKey) {
            return NextResponse.json({ error: 'Missing text or API Key' }, { status: 400 });
        }

        // 1. Wrap each word in an SSML mark for precise timing
        // The REST API timepointing feature requires SSML to reliably extract word boundaries.
        const words = text.split(' ');
        let ssml = '<speak>';
        words.forEach((word: string, i: number) => {
            // Remove punctuation for the mark name to keep it clean, but keep it in the text
            const markName = `w_${i}`;
            ssml += `<mark name="${markName}"/>${word} `;
        });
        ssml += '</speak>';

        const requestBody = {
            input: { ssml },
            voice: { languageCode: 'en-US', name: voiceName || 'en-US-Standard-D' },
            audioConfig: { audioEncoding: 'MP3' },
            enableTimePointing: ['SSML_MARK']
        };

        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;

        // 2. Parse the real timestamps from the response timepoints
        const timepoints = data.timepoints || [];
        const wordTimestamps = words.map((word: string, i: number) => {
            const mark = timepoints.find((t: any) => t.markName === `w_${i}`);
            const nextMark = timepoints.find((t: any) => t.markName === `w_${i + 1}`);

            // Google returns time in seconds
            const startTime = mark ? mark.timeSeconds : (i * 0.4);
            // End time is either the start of the next word, or +0.4s for the last word
            const endTime = nextMark ? nextMark.timeSeconds : (startTime + 0.4);

            return {
                word,
                startTime,
                endTime
            };
        });

        return NextResponse.json({
            audioUrl,
            wordTimestamps
        });

    } catch (error: any) {
        console.error('Error in TTS:', error);
        return NextResponse.json({ error: error.message || 'TTS failed' }, { status: 500 });
    }
}
