'use client';

import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { MainComposition } from '@/remotion/Composition';
import { VideoDNA, WordTimestamp, GenerationState } from '@/types';
import { Settings, Play, Download, Loader2, Sparkles, Video, CheckCircle2 } from 'lucide-react';

export default function AetherDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [geminiVerified, setGeminiVerified] = useState(false);

  const [ttsApiKey, setTtsApiKey] = useState('');
  const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [ttsVerified, setTtsVerified] = useState(false);

  const [prompt, setPrompt] = useState('Explain string theory simply...');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const [state, setState] = useState<GenerationState>({
    progress: 0,
    status: 'idle',
    dna: null,
    audioUrl: null,
    videoUrl: null,
  });

  const fetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Server Error: ${res.status} - ${text.slice(0, 100)}`);
    }
    if (!res.ok) {
      throw new Error(data.error || `API Request failed with status ${res.status}`);
    }
    return data;
  };

  const verifyGemini = async () => {
    if (!apiKey) return;
    try {
      const data = await fetchJson(`/api/models?apiKey=${apiKey}`);
      if (data.models && data.models.length > 0) {
        setModels(data.models);
        setSelectedModel(data.models[0].id);
        setGeminiVerified(true);
      } else {
        alert("Error: " + (data.error || "No models found"));
        setGeminiVerified(false);
      }
    } catch (err) {
      alert("Verification failed");
      setGeminiVerified(false);
    }
  };

  const verifyTTS = async () => {
    if (!ttsApiKey) return;
    try {
      const data = await fetchJson(`/api/voices?apiKey=${ttsApiKey}`);
      if (data.voices && data.voices.length > 0) {
        setVoices(data.voices);
        setSelectedVoice(data.voices[0].id);
        setTtsVerified(true);
      } else {
        alert("Error: " + (data.error || "No voices found"));
        setTtsVerified(false);
      }
    } catch (err) {
      alert("TTS Verification failed");
      setTtsVerified(false);
    }
  }

  const startGeneration = async () => {
    try {
      if (!geminiVerified || !ttsVerified || !selectedModel || !selectedVoice) return alert("Verify all API keys first");

      setState({ ...state, status: 'generating_dna', progress: 10, error: undefined });

      const dnaData = await fetchJson('/api/generate-dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, model: selectedModel, prompt }),
      });
      const dna = dnaData.dna;

      setState(prev => ({ ...prev, status: 'generating_tts', progress: 50, dna }));

      const script = dna.map((d: any) => d.sentence).join(' ');

      const ttsData = await fetchJson('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script, apiKey: ttsApiKey, voiceName: selectedVoice })
      });

      setState(prev => ({
        ...prev,
        status: 'done',
        progress: 100,
        audioUrl: ttsData.audioUrl,
        wordTimestamps: ttsData.wordTimestamps
      }));

    } catch (err: any) {
      setState(prev => ({ ...prev, status: 'error', error: err.message, progress: 0 }));
    }
  };

  const renderVideo = async () => {
    setState(prev => ({ ...prev, status: 'rendering', progress: 50 }));
    try {
      const data = await fetchJson('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compositionId: `AetherVideo-${aspectRatio.replace(':', 'x')}`,
          inputProps: {
            dna: state.dna,
            audioUrl: state.audioUrl,
            wordTimestamps: state.wordTimestamps,
            aspectRatio
          }
        })
      });
      setState(prev => ({ ...prev, status: 'done', progress: 100, videoUrl: data.videoUrl }));
      alert(data.message || 'Render initiated');
    } catch (err: any) {
      setState(prev => ({ ...prev, status: 'error', progress: 100 }));
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050812] text-white selection:bg-cyan-500/30 font-sans">
      <nav className="border-b border-cyan-900/50 bg-[#0A0F1D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-cyan-400" />
            <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Aether-Motion
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          {/* Step 1: Gemini Keys */}
          <div className={`bg-[#0A0F1D] p-6 rounded-2xl border ${geminiVerified ? 'border-green-900/40' : 'border-cyan-900/40'} shadow-[0_0_30px_rgba(0,255,255,0.02)] transition-all`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Settings className={geminiVerified ? "w-5 h-5 text-green-400" : "w-5 h-5 text-cyan-400"} />
                1. Gemini API Key
              </div>
              {geminiVerified && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setGeminiVerified(false); }}
                  className="w-full bg-[#050812] border border-cyan-900/50 rounded-lg px-4 py-2 pr-20 focus:outline-none focus:border-cyan-400 transition-colors placeholder-cyan-900/50"
                  placeholder="AIzaSy..."
                />
                {!geminiVerified && (
                  <button onClick={verifyGemini} className="absolute right-1 top-1 text-xs px-3 py-1 bg-cyan-900/40 text-cyan-300 rounded hover:bg-cyan-900/60 transition-colors">
                    Verify
                  </button>
                )}
              </div>
              {geminiVerified && models.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs text-cyan-200/60 mb-1">Model Selection</label>
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="w-full bg-[#050812] text-sm border border-cyan-900/50 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
                  >
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: TTS Keys */}
          <div className={`bg-[#0A0F1D] p-6 rounded-2xl border ${!geminiVerified ? 'border-gray-900/40 opacity-50 pointer-events-none' : ttsVerified ? 'border-green-900/40' : 'border-cyan-900/40'} shadow-[0_0_30px_rgba(0,255,255,0.02)] transition-all`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Settings className={ttsVerified ? "w-5 h-5 text-green-400" : "w-5 h-5 text-cyan-400"} />
                2. Google Cloud TTS Key
              </div>
              {ttsVerified && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={ttsApiKey}
                  onChange={e => { setTtsApiKey(e.target.value); setTtsVerified(false); }}
                  className="w-full bg-[#050812] border border-cyan-900/50 rounded-lg px-4 py-2 pr-20 focus:outline-none focus:border-cyan-400 transition-colors placeholder-cyan-900/50"
                  placeholder="Google Cloud API Key..."
                />
                {!ttsVerified && (
                  <button onClick={verifyTTS} className="absolute right-1 top-1 text-xs px-3 py-1 bg-cyan-900/40 text-cyan-300 rounded hover:bg-cyan-900/60 transition-colors">
                    Verify
                  </button>
                )}
              </div>
              {ttsVerified && voices.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs text-cyan-200/60 mb-1">Voice Selection (US English)</label>
                  <select
                    value={selectedVoice}
                    onChange={e => setSelectedVoice(e.target.value)}
                    className="w-full bg-[#050812] text-sm border border-cyan-900/50 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
                  >
                    {voices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Generation (Protected) */}
          <div className={`bg-[#0A0F1D] p-6 rounded-2xl border border-cyan-900/40 shadow-[0_0_30px_rgba(0,255,255,0.02)] transition-all ${(!geminiVerified || !ttsVerified) ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              3. Generation Prompt
            </h2>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={4}
              className="w-full bg-[#050812] border border-cyan-900/50 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors resize-none mb-4"
            />

            <div className="flex gap-2">
              <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${aspectRatio === '16:9' ? 'border-cyan-400 bg-cyan-900/40 text-cyan-300' : 'border-cyan-900/50 text-cyan-500/50 hover:border-cyan-700'}`}>
                16:9 YouTube
              </button>
              <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${aspectRatio === '9:16' ? 'border-cyan-400 bg-cyan-900/40 text-cyan-300' : 'border-cyan-900/50 text-cyan-500/50 hover:border-cyan-700'}`}>
                9:16 Shorts/TikTok
              </button>
            </div>

            <button
              onClick={startGeneration}
              disabled={state.status.includes('generating') || !geminiVerified || !ttsVerified}
              className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-3 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {state.status.includes('generating') ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {state.status === 'idle' || state.status === 'done' || state.status === 'error' ? 'Generate Video DNA' : 'Generating Pipeline...'}
            </button>

            {state.status !== 'idle' && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-medium text-cyan-300 text-opacity-80">
                  <span className="capitalize">{state.status.replace('_', ' ')}</span>
                  <span>{state.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#050812] rounded-full overflow-hidden border border-cyan-900/30">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" style={{ width: `${state.progress}%` }}></div>
                </div>
              </div>
            )}
            {state.error && <p className="mt-4 text-sm text-red-400 text-center">{state.error}</p>}
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[600px] bg-[#0A0F1D] rounded-3xl border border-cyan-900/30 p-8 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
          {state.dna && state.audioUrl ? (
            <div className="w-full flex justify-center flex-col items-center">
              <Player
                component={MainComposition}
                inputProps={{
                  dna: state.dna,
                  audioUrl: state.audioUrl,
                  wordTimestamps: state.wordTimestamps || [],
                  aspectRatio
                }}
                durationInFrames={Math.ceil((state.wordTimestamps?.[state.wordTimestamps.length - 1]?.endTime || 20) * 30)}
                fps={30}
                compositionWidth={aspectRatio === '16:9' ? 1920 : 1080}
                compositionHeight={aspectRatio === '16:9' ? 1080 : 1920}
                style={{
                  width: '100%',
                  maxWidth: aspectRatio === '16:9' ? '100%' : '350px',
                  aspectRatio: aspectRatio.replace(':', '/'),
                  borderRadius: '0.75rem',
                  boxShadow: '0 0 50px rgba(0,255,255,0.1)'
                }}
                controls
                autoPlay
              />

              <button
                onClick={renderVideo}
                disabled={state.status === 'rendering'}
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-[#050812] border border-cyan-500/50 hover:bg-cyan-900/50 text-cyan-300 hover:text-white rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)]"
              >
                {state.status === 'rendering' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {state.status === 'rendering' ? 'Vercel Sandbox Rendering...' : 'Render Node & Export MP4'}
              </button>
              {state.videoUrl && (
                <a href={state.videoUrl} target="_blank" className="mt-4 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  <Download className="w-4 h-4" /> Download Final Output
                </a>
              )}
            </div>
          ) : (
            <div className="text-cyan-600/50 flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full border border-cyan-900/50 flex items-center justify-center bg-[#050812] shadow-[0_0_30px_rgba(0,255,255,0.05)]">
                <Play className="w-8 h-8 opacity-50 ml-1" />
              </div>
              <p className="text-lg font-medium opacity-80 tracking-wide mt-2">Aether Engine Ready</p>
              {(!geminiVerified || !ttsVerified) ? (
                <p className="text-sm opacity-50 max-w-xs text-center">Verify your API keys to unlock the generation sandbox.</p>
              ) : (
                <p className="text-sm opacity-50 max-w-xs text-center">Keys verified. Enter a prompt to synthesize Video DNA.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
