import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { DNAElement } from '../types';

interface ExplainerVisualsProps {
    element: DNAElement;
}

export const ExplainerVisuals: React.FC<ExplainerVisualsProps> = ({ element }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const tags = element.visual_tags.map(t => t.toLowerCase());
    const isChemistry = tags.some(t => t.includes('chem') || t.includes('atom') || t.includes('reaction') || t.includes('molecule'));
    const isNetwork = tags.some(t => t.includes('net') || t.includes('data') || t.includes('node') || t.includes('connect'));
    const isFinance = tags.some(t => t.includes('finance') || t.includes('money') || t.includes('graph') || t.includes('growth'));

    if (isChemistry) {
        return <ChemistryScene frame={frame} fps={fps} element={element} />;
    }

    if (isNetwork) {
        return <NetworkScene frame={frame} fps={fps} element={element} />;
    }

    if (isFinance) {
        return <GrowthScene frame={frame} fps={fps} element={element} />
    }

    // Default Abstract Scene
    return <AbstractScene frame={frame} fps={fps} element={element} />;
};

const ChemistryScene: React.FC<{ frame: number; fps: number; element: DNAElement }> = ({ frame, fps, element }) => {
    // Simulate two atoms coming together to form a bond (Markovnikov style reaction)
    const duration = (element.timestamp[1] - element.timestamp[0]) * fps;

    // Atom A floats in from left
    const atomAX = interpolate(frame, [0, 30], [-200, -50], { extrapolateRight: 'clamp' });
    const atomAY = Math.sin(frame / 10) * 20;

    // Atom B floats in from right
    const atomBX = interpolate(frame, [0, 30], [200, 50], { extrapolateRight: 'clamp' });
    const atomBY = Math.cos(frame / 10) * 20;

    // Bond forms between them
    const bondOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: 'clamp' });
    const bondWidth = interpolate(frame, [25, 40], [0, 100], { extrapolateRight: 'clamp' });

    // Reaction spark
    const sparkScale = spring({ fps, frame: frame - 28, config: { damping: 10 } });
    const sparkOpacity = interpolate(frame, [28, 40], [1, 0], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', bottom: '150px' }}>
                {/* Bond */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', height: '8px',
                    width: `${bondWidth}px`, backgroundColor: '#00FFFF',
                    transform: 'translate(-50%, -50%)', opacity: bondOpacity,
                    boxShadow: '0 0 15px #00FFFF', borderRadius: '4px'
                }} />

                {/* Atom A */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', width: '60px', height: '60px',
                    backgroundColor: '#FF3366', borderRadius: '50%',
                    transform: `translate(calc(-50% + ${atomAX}px), calc(-50% + ${atomAY}px))`,
                    boxShadow: 'inset -5px -5px 20px rgba(0,0,0,0.5), 0 0 20px rgba(255, 51, 102, 0.6)'
                }} />

                {/* Atom B */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', width: '80px', height: '80px',
                    backgroundColor: '#3366FF', borderRadius: '50%',
                    transform: `translate(calc(-50% + ${atomBX}px), calc(-50% + ${atomBY}px))`,
                    boxShadow: 'inset -5px -5px 20px rgba(0,0,0,0.5), 0 0 20px rgba(51, 102, 255, 0.6)'
                }} />

                {/* Spark */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', width: '120px', height: '120px',
                    border: '4px solid #FFFF00', borderRadius: '50%',
                    transform: `translate(-50%, -50%) scale(${sparkScale})`,
                    opacity: sparkOpacity, boxShadow: '0 0 30px #FFFF00'
                }} />
            </div>
        </AbsoluteFill>
    );
};

const NetworkScene: React.FC<{ frame: number; fps: number; element: DNAElement }> = ({ frame, fps }) => {
    // Draw connecting nodes
    const nodes = [{ x: -100, y: -50 }, { x: 100, y: -80 }, { x: 0, y: 50 }, { x: -80, y: 100 }, { x: 120, y: 80 }];

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '300px', height: '300px', bottom: '150px' }}>
                <svg width="300" height="300" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
                    {nodes.map((n, i) => {
                        const next = nodes[(i + 1) % nodes.length];
                        const progress = spring({ fps, frame: frame - (i * 10), config: { damping: 12 } });
                        return (
                            <line key={`line-${i}`} x1={n.x + 150} y1={n.y + 150} x2={n.x + 150 + ((next.x - n.x) * progress)} y2={n.y + 150 + ((next.y - n.y) * progress)}
                                stroke="#00FFFF" strokeWidth="2" strokeDasharray="5,5" opacity={0.6} />
                        )
                    })}
                </svg>
                {nodes.map((n, i) => {
                    const scale = spring({ fps, frame: frame - (i * 5), config: { damping: 10 } });
                    return (
                        <div key={`node-${i}`} style={{
                            position: 'absolute', top: '50%', left: '50%', width: '20px', height: '20px',
                            backgroundColor: '#00FFFF', borderRadius: '50%',
                            transform: `translate(calc(-50% + ${n.x}px), calc(-50% + ${n.y}px)) scale(${scale})`,
                            boxShadow: '0 0 15px #00FFFF'
                        }} />
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};

const GrowthScene: React.FC<{ frame: number; fps: number; element: DNAElement }> = ({ frame, fps }) => {
    const width = spring({ fps, frame, config: { damping: 15 } }) * 200;
    const height = spring({ fps, frame: frame - 15, config: { damping: 15 } }) * 150;

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '300px', height: '200px', bottom: '150px', borderBottom: '2px solid #00FFFF', borderLeft: '2px solid #00FFFF' }}>
                <div style={{
                    position: 'absolute', bottom: 0, left: '20px', width: '60px', height: `${height * 0.4}px`,
                    backgroundColor: 'rgba(0, 255, 255, 0.4)', border: '1px solid #00FFFF'
                }} />
                <div style={{
                    position: 'absolute', bottom: 0, left: '100px', width: '60px', height: `${height * 0.7}px`,
                    backgroundColor: 'rgba(0, 255, 255, 0.7)', border: '1px solid #00FFFF'
                }} />
                <div style={{
                    position: 'absolute', bottom: 0, left: '180px', width: '60px', height: `${height}px`,
                    backgroundColor: '#00FFFF', boxShadow: '0 0 20px rgba(0,255,255,0.8)'
                }} />
            </div>
        </AbsoluteFill>
    );
};

const AbstractScene: React.FC<{ frame: number; fps: number; element: DNAElement }> = ({ frame, fps }) => {
    const rotation = frame * 2;
    const scale = spring({ fps, frame, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{
                width: '150px', height: '150px', border: '4px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '20%', transform: `rotate(${rotation}deg) scale(${scale})`, bottom: '150px', position: 'relative'
            }}>
                <div style={{
                    width: '100%', height: '100%', border: '4px solid rgba(0, 255, 255, 0.6)',
                    borderRadius: '50%', transform: `rotate(-${rotation * 2}deg) scale(0.6)`
                }} />
            </div>
        </AbsoluteFill>
    );
}
