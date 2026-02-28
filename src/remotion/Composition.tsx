import React from 'react';
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';
import { PhantomSubtitles } from './PhantomSubtitles';
import { DynamicBackground } from './DynamicBackground';
import { VideoDNA, WordTimestamp } from '../types';

export interface MainCompositionProps {
    dna: VideoDNA;
    audioUrl: string;
    wordTimestamps: WordTimestamp[];
    aspectRatio: '16:9' | '9:16';
}

export const MainComposition: React.FC<MainCompositionProps> = ({ dna, audioUrl, wordTimestamps, aspectRatio }) => {
    const { fps, width, height } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: '#0A0F1D' }}> {/* Midnight Blue base */}
            {/* Dynamic Background generated per-DNA segment */}
            <DynamicBackground dna={dna} width={width} height={height} />

            {/* Main DNA Elements Sequence - Mapping Sentences to Subtitles & Animations */}
            {dna && dna.length > 0 && dna.map((element, index) => {
                const startFrame = Math.floor(element.timestamp[0] * fps);
                const endFrame = Math.floor(element.timestamp[1] * fps);
                const duration = Math.max(1, endFrame - startFrame);

                return (
                    <Sequence key={index} from={startFrame} durationInFrames={duration}>
                        <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <PhantomSubtitles
                                sentence={element.sentence}
                                wordTimestamps={wordTimestamps}
                                animationType={element.animation_type}
                                startSeconds={element.timestamp[0]}
                                endSeconds={element.timestamp[1]}
                            />
                        </AbsoluteFill>
                    </Sequence>
                );
            })}

            {/* Synchronized Generated Audio */}
            {audioUrl && <Audio src={audioUrl} />}
        </AbsoluteFill>
    );
};
