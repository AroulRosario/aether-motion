# Aether-Motion

An intelligent, production-grade Video Generation SaaS using Next.js, Remotion, and Gemini. Aether-Motion generates "Video-DNA" (JSON mappings of narrative sequences to mathematical animations) from text and renders them on demand.

## Core Stack
- **Framework**: Next.js (App Router)
- **Video Generation**: Remotion & `@remotion/player`
- **AI Integration**: Google Gemini API (`@google/genai`) 
- **Voice System**: Google Cloud Text-to-Speech with word-sync tracking
- **Deployment Strategy**: Vercel (Frontend & Blob) + Sandbox Node Rendering
- **Styling**: TailwindCSS & React Inline Overrides (Midnight Blue & Cyan Core)

## Environment Variables
Create a `.env.local` file at the root of your project:

```env
# Required if you want the backend to default to server-side Gemini generation.
# Alternatively, users can enter keys in the Dashboard securely.
GEMINI_API_KEY=AIzaSy_YOUR_API_KEY

# Required for Google Cloud TTS (Must point to your GCP service account JSON file)
# In Vercel prod, you can use GOOGLE_CREDENTIALS containing the actual stringified JSON.
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/your/service-account.json

# Required to store rendered videos
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## Running Locally

1. Initialize project dependencies: `npm install`
2. Start development server: `npm run dev`
3. **Usage Flow**:
    - Input API Key (if not relying on env) & Load available models.
    - Write a prompt describing the topic to synthesize.
    - Start the `Generate Video DNA` pipeline. The backend will interface with Gemini to produce structured `Video-DNA` and TTS arrays.
    - Preview real-time rendering in `@remotion/player` natively in the cloud dashboard.
    - Click Render to execute background task.

## Future Production Rendering
For native continuous Vercel integration, `@remotion/lambda` deployed on AWS is highly recommended. Native `npx remotion render` within a typical Vercel Edge/Serverless function can sometimes hit limits on the Chromium footprint. The application code serves as an extendable foundation pointing directly toward Blob storage routing over AWS/Vercel boundaries.
