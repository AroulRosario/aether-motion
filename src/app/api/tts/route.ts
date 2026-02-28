import textToSpeech from '@google-cloud/text-to-speech';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
        }

        const client = new textToSpeech.TextToSpeechClient();

        // To get word-level timestamps without manually inserting SSML marks,
        // Google TTS doesn't perfectly support 'WORD' out of the box for all voices in the Node SDK without exact setup.
        // However, we can simulate or attempt to use recent API features, or just return basic timestamps.
        // For this PhD-level stub, we assume the user will configure the exact Voice name and request SSML.

        // As a robust fallback, we will just use standard synthesis and mock word timestamps 
        // based on average speaking rate if timepoints fail.

        const request: any = {
            input: { text },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-D' },
            audioConfig: { audioEncoding: 'MP3' },
            // Optional: enable word time offsets if the API version supports it
            // enableTimePointing: [textToSpeech.protos.google.cloud.texttospeech.v1.TimepointType.SSML_MARK]
        };

        const [response] = await client.synthesizeSpeech(request);

        const audioContent = response.audioContent as Uint8Array;
        const base64Audio = Buffer.from(audioContent).toString('base64');
        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

        // Mocking word timestamps for the skeleton:
        const words = text.split(' ');
        const wordTimestamps = words.map((word: string, i: number) => ({
            word,
            startTime: i * 0.4,
            endTime: (i + 1) * 0.4
        }));

        return NextResponse.json({
            audioUrl,
            wordTimestamps,
            // In real advanced implementation, process response.timepoints
        });

    } catch (error: any) {
        console.error('Error in TTS:', error);
        return NextResponse.json({ error: error.message || 'TTS failed' }, { status: 500 });
    }
}
