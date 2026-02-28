import React from 'react';
import { interpolate, useCurrentFrame, AbsoluteFill } from 'remotion';
import { VideoDNA } from '../types';

interface DynamicBackgroundProps {
    dna: VideoDNA;
    width: number;
    height: number;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ dna, width, height }) => {
    const frame = useCurrentFrame();

    // Color shifting and pulsing based on frame index
    // A true high-end CSS shader equivalent
    const r1 = interpolate(frame % 200, [0, 100, 200], [10, 20, 10], { extrapolateRight: 'clamp' });
    const g1 = interpolate(frame % 200, [0, 100, 200], [15, 30, 15], { extrapolateRight: 'clamp' });
    const b1 = interpolate(frame % 200, [0, 100, 200], [29, 60, 29], { extrapolateRight: 'clamp' });

    // Breathing cyan glow
    const cyanAlpha = interpolate(frame % 60, [0, 30, 60], [0.1, 0.3, 0.1], { extrapolateRight: 'clamp' });

    const gradient = `radial-gradient(circle at center, rgba(0, 255, 255, ${cyanAlpha}) 0%, rgb(${r1}, ${g1}, ${b1}) 60%, #050812 100%)`;

    return (
        <AbsoluteFill style={{ background: gradient }}>
            {/* Abstract Grid Overlay for depth and pseudo-3D parallax effect */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                opacity: 0.5,
                transform: `translateY(${(frame * 0.5) % 40}px)`
            }} />

            {/* Light sweep effect */}
            <div style={{
                position: 'absolute',
                width: '200%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.02) 50%, transparent 100%)',
                transform: `translateX(${interpolate(frame % 120, [0, 120], [-50, 0])}%)`,
            }} />
        </AbsoluteFill>
    );
};
