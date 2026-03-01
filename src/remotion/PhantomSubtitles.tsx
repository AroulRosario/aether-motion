import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WordTimestamp } from '../types';

interface PhantomSubtitlesProps {
    sentence: string;
    wordTimestamps: WordTimestamp[];
    animationType: string;
    startSeconds: number;
    endSeconds: number;
    visualTags?: string[];
}

export const PhantomSubtitles: React.FC<PhantomSubtitlesProps> = ({
    sentence,
    wordTimestamps,
    animationType,
    startSeconds,
    endSeconds,
    visualTags
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Find exact word timings or fallback to even splitting for mock
    const sentenceWords = wordTimestamps.filter(
        (w) => w.startTime >= startSeconds && w.startTime < endSeconds
    );

    const words = sentenceWords.length > 0
        ? sentenceWords
        : sentence.split(' ').map((word, i, arr) => {
            const duration = endSeconds - startSeconds;
            const timePerWord = duration / arr.length;
            return {
                word,
                startTime: startSeconds + i * timePerWord,
                endTime: startSeconds + (i + 1) * timePerWord
            };
        });

    const baseAnimStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        textAlign: 'center',
        gap: '12px',
        fontSize: '44px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
    };

    // Entrance animations based on VideoDNA
    let entryTransform = 'none';
    let opacity = 1;

    if (animationType === 'slide') {
        const translateY = interpolate(frame, [0, 15], [50, 0], { extrapolateRight: 'clamp' });
        opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
        entryTransform = `translateY(${translateY}px)`;
    } else if (animationType === 'fade') {
        opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    } else if (animationType === 'zoom' || animationType === 'dynamic' || animationType === 'spring') {
        const scale = spring({ fps, frame, config: { damping: 12 } });
        entryTransform = `scale(${scale})`;
        opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
    }

    // Make tagString available as a comma-separated format for debugging
    const tagString = (words as any).visual_tags?.join(', ') || '';


    return (
        <div style={{ ...baseAnimStyle, transform: entryTransform, opacity, flexDirection: 'column', gap: '0px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                {words.map((w, i) => {
                    const currentTime = (frame / fps) + startSeconds;
                    const isSpeaking = currentTime >= w.startTime && currentTime <= w.endTime;

                    return (
                        <span
                            key={i}
                            style={{
                                color: isSpeaking ? '#00FFFF' : '#FFFFFF',
                                textShadow: isSpeaking ? '0 0 20px rgba(0, 255, 255, 0.8)' : 'none',
                                transform: isSpeaking ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.1s ease-out',
                                opacity: isSpeaking ? 1 : 0.7
                            }}
                        >
                            {w.word}
                        </span>
                    );
                })}
            </div>

            {/* Tag Debugging Subtitle */}
            {visualTags && visualTags.length > 0 && (
                <div style={{
                    marginTop: '15px',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(5, 8, 18, 0.7)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    borderRadius: '20px',
                    fontSize: '16px',
                    color: 'rgba(0, 255, 255, 0.8)',
                    fontFamily: 'monospace',
                    letterSpacing: '1px'
                }}>
                    TAGS: [{visualTags.join(', ')}]
                </div>
            )}
        </div>
    );
};
