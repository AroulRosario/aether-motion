import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';
import { PhantomSubtitles } from './PhantomSubtitles';
import { DynamicBackground } from './DynamicBackground';
import { ExplainerVisuals } from './ExplainerVisuals';
import { VideoDNA, WordTimestamp } from '../types';

export interface MainCompositionProps {
    dna: VideoDNA;
    audioUrl: string;
    wordTimestamps: WordTimestamp[];
    aspectRatio: '16:9' | '9:16';
}

export const MainComposition: React.FC<MainCompositionProps> = ({ dna, audioUrl, wordTimestamps, aspectRatio }) => {
    const { fps, width, height } = useVideoConfig();

    // We need to calculate start and end times for each DNA sentence based on word timestamps
    const dnaWithTimestamps = useMemo(() => {
        if (!dna || !wordTimestamps || wordTimestamps.length === 0) return [];

        let currentWordIndex = 0;

        return dna.map(element => {
            const sentenceWords = element.sentence.split(/\s+/).filter(w => w.trim().length > 0);
            const numWords = sentenceWords.length;

            const startWord = wordTimestamps[currentWordIndex];
            const endWordIndex = Math.min(currentWordIndex + numWords - 1, wordTimestamps.length - 1);
            const endWord = wordTimestamps[endWordIndex];

            const startTime = startWord ? startWord.startTime : 0;
            const endTime = endWord ? endWord.endTime : startTime + (numWords * 0.4); // fallback

            currentWordIndex += numWords;

            const timestampTuple: [number, number] = [startTime, endTime];

            return {
                ...element,
                timestamp: timestampTuple
            };
        });
    }, [dna, wordTimestamps]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0A0F1D' }}> {/* Midnight Blue base */}
            {/* Dynamic Background generated per-DNA segment */}
            <DynamicBackground dna={dna} width={width} height={height} />

            {/* Main DNA Elements Sequence - Mapping Sentences to Subtitles & Animations */}
            {dnaWithTimestamps.map((element, index) => {
                const startFrame = Math.max(0, Math.floor(element.timestamp[0] * fps));
                const endFrame = Math.max(1, Math.floor(element.timestamp[1] * fps));
                const duration = Math.max(1, endFrame - startFrame);

                return (
                    <Sequence key={index} from={startFrame} durationInFrames={duration}>
                        <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <ExplainerVisuals element={element} />

                            {/* Move subtitles to the lower third to accommodate the explosion visual */}
                            <div style={{ position: 'absolute', bottom: '15%', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <PhantomSubtitles
                                    sentence={element.sentence}
                                    wordTimestamps={wordTimestamps}
                                    animationType={element.animation_type}
                                    startSeconds={element.timestamp[0]}
                                    endSeconds={element.timestamp[1]}
                                    visualTags={element.visual_tags}
                                />
                            </div>
                        </AbsoluteFill>
                    </Sequence>
                );
            })}

            {/* Synchronized Generated Audio */}
            {audioUrl && <Audio src={audioUrl} />}
        </AbsoluteFill>
    );
};
