import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Composition';
import { VideoDNA } from '../types';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="AetherVideo-16x9"
                component={MainComposition as React.FC<any>}
                durationInFrames={600}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    dna: [] as VideoDNA,
                    audioUrl: '',
                    wordTimestamps: [],
                    aspectRatio: '16:9' as const,
                }}
            />

            <Composition
                id="AetherVideo-9x16"
                component={MainComposition as React.FC<any>}
                durationInFrames={600}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    dna: [] as VideoDNA,
                    audioUrl: '',
                    wordTimestamps: [],
                    aspectRatio: '9:16' as const,
                }}
            />
        </>
    );
};
