import { NextResponse } from 'next/server';

export const maxDuration = 60; // 60 seconds max duration
export const runtime = 'edge'; // Edge function

export async function POST(req: Request) {
    try {
        const { text, apiKey, voiceName } = await req.json();

        if (!text || !apiKey) {
            return NextResponse.json({ error: 'Missing text or API Key' }, { status: 400 });
        }

        const requestBody = {
            input: { text },
            voice: { languageCode: 'en-US', name: voiceName || 'en-US-Standard-D' },
            audioConfig: { audioEncoding: 'MP3' },
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

        // Mocking word timestamps since standard REST synthesize doesn't naturally return them 
        // without advanced SSML marking enabled
        const words = text.split(' ');
        const wordTimestamps = words.map((word: string, i: number) => ({
            word,
            startTime: i * 0.4,
            endTime: (i + 1) * 0.4
        }));

        return NextResponse.json({
            audioUrl,
            wordTimestamps
        });

    } catch (error: any) {
        console.error('Error in TTS:', error);
        return NextResponse.json({ error: error.message || 'TTS failed' }, { status: 500 });
    }
}
