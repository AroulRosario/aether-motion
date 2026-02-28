import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
        return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }

    try {
        // We use standard fetch to models endpoint since it's robust and works with any API key
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        const models = data.models
            .filter((m: any) => m.name.includes('gemini'))
            .map((m: any) => ({
                id: m.name,
                name: m.displayName || m.name,
                description: m.description
            }));

        return NextResponse.json({ models });
    } catch (error: any) {
        console.error('Error fetching models:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch models' }, { status: 500 });
    }
}
