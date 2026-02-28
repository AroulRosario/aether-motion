import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
        return NextResponse.json({ error: 'TTS API Key is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        const voices = data.voices
            .filter((v: any) => v.languageCodes.includes('en-US'))
            .map((v: any) => ({
                id: v.name,
                name: `${v.name} (${v.ssmlGender})`
            }));

        return NextResponse.json({ voices });
    } catch (error: any) {
        console.error('Error fetching voices:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch voices' }, { status: 500 });
    }
}
