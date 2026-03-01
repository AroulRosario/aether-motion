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
    // Expanded chemistry terms to catch mechanical tags that Gemini spits out instead of generic 'chem'
    const isChemistry = tags.some(t => t.includes('chem') || t.includes('atom') || t.includes('reaction') || t.includes('molecule') || t.includes('sn1') || t.includes('sn2') || t.includes('nucleophil') || t.includes('carboca') || t.includes('electron') || t.includes('bond') || t.includes('leaving'));
    const isNetwork = tags.some(t => t.includes('net') || t.includes('data') || t.includes('node') || t.includes('connect'));
    const isFinance = tags.some(t => t.includes('finance') || t.includes('money') || t.includes('graph') || t.includes('growth'));

    if (isChemistry) {
        if (tags.some(t => t.includes('leaving_group'))) return <SN1LeavingGroupScene frame={frame} fps={fps} />;
        if (tags.some(t => t.includes('nucleophile_attack') || t.includes('attack'))) return <SN1AttackScene frame={frame} fps={fps} />;
        if (tags.some(t => t.includes('carbocation'))) return <CarbocationScene frame={frame} fps={fps} />;
        if (tags.some(t => t.includes('electron_flow') || t.includes('arrow'))) return <ElectronFlowScene frame={frame} fps={fps} />;

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
            <div style={{ position: 'relative', width: '200px', height: '200px', bottom: '150px', transform: 'scale(1.8)' }}>
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

const SN1LeavingGroupScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
    // Atom starts bonded, then bond stretches and breaks, atom floats away
    const leavingX = interpolate(frame, [15, 45], [50, 250], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const leavingY = interpolate(frame, [15, 45], [0, 50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const bondOpacity = interpolate(frame, [15, 30], [1, 0], { extrapolateRight: 'clamp' });
    const bondWidth = interpolate(frame, [0, 15], [50, 100], { extrapolateRight: 'clamp' });

    const carbocationGlow = interpolate(frame, [30, 45], [0.3, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '300px', height: '200px', bottom: '150px', transform: 'scale(1.8)' }}>
                {/* Central Carbocation */}
                <div style={{
                    position: 'absolute', top: '50%', left: '30%', width: '90px', height: '90px',
                    backgroundColor: '#3366FF', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 ${40 * carbocationGlow}px rgba(51, 102, 255, ${carbocationGlow})`,
                    border: '3px solid rgba(255,255,255,0.5)'
                }}>
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontWeight: 'bold', fontSize: '24px', opacity: carbocationGlow }}>+</span>
                </div>

                {/* Stretching/Breaking Bond */}
                <div style={{
                    position: 'absolute', top: '50%', left: `calc(30% + 45px)`, height: '8px',
                    width: `${bondWidth}px`, backgroundColor: '#FF3366',
                    transform: 'translateY(-50%)', opacity: bondOpacity,
                    boxShadow: '0 0 15px #FF3366'
                }} />

                {/* Leaving Group Atom */}
                <div style={{
                    position: 'absolute', top: '50%', left: '30%', width: '60px', height: '60px',
                    backgroundColor: '#FF3366', borderRadius: '50%',
                    transform: `translate(calc(-50% + ${leavingX}px), calc(-50% + ${leavingY}px))`,
                    boxShadow: 'inset -5px -5px 20px rgba(0,0,0,0.5), 0 0 20px rgba(255, 51, 102, 0.6)'
                }}>
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>-</span>
                </div>
            </div>
        </AbsoluteFill>
    );
};

const SN1AttackScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
    // Carbocation waiting, Nucleophile attacks from bottom left
    const attackX = interpolate(frame, [10, 30], [-200, -60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const attackY = interpolate(frame, [10, 30], [200, 40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const bondOpacity = interpolate(frame, [28, 35], [0, 1], { extrapolateRight: 'clamp' });
    const flashOpacity = interpolate(frame, [30, 45], [1, 0], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '300px', height: '300px', bottom: '150px', transform: 'scale(1.8)' }}>
                {/* Central Carbocation */}
                <div style={{
                    position: 'absolute', top: '40%', left: '50%', width: '90px', height: '90px',
                    backgroundColor: '#3366FF', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 30px rgba(51, 102, 255, 0.8)`, border: '3px solid rgba(255,255,255,0.5)'
                }} />

                {/* Formed Bond */}
                <div style={{
                    position: 'absolute', top: '40%', left: '50%', height: '80px', width: '10px',
                    backgroundColor: '#00FF99', transform: 'translate(-50%, 45px) rotate(-35deg)', transformOrigin: 'top center',
                    opacity: bondOpacity, boxShadow: '0 0 20px #00FF99', borderRadius: '5px'
                }} />

                {/* Nucleophile Atom */}
                <div style={{
                    position: 'absolute', top: '40%', left: '50%', width: '70px', height: '70px',
                    backgroundColor: '#00FF99', borderRadius: '50%',
                    transform: `translate(calc(-50% + ${attackX}px), calc(-50% + ${attackY}px))`,
                    boxShadow: 'inset -5px -5px 20px rgba(0,0,0,0.5), 0 0 30px rgba(0, 255, 153, 0.6)'
                }} />

                {/* Collision Flash */}
                <div style={{
                    position: 'absolute', top: '40%', left: '50%', width: '150px', height: '150px',
                    backgroundColor: 'rgba(0, 255, 153, 0.3)', borderRadius: '50%',
                    transform: `translate(calc(-50% - 30px), calc(-50% + 30px)) scale(${spring({ fps, frame: frame - 25, config: { damping: 10 } })})`,
                    opacity: flashOpacity, filter: 'blur(10px)'
                }} />
            </div>
        </AbsoluteFill>
    );
};

const CarbocationScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
    // Pulsating positive charge showing stability
    const pulse = Math.sin(frame / 5) * 10;
    const rotate = frame * 2;

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', bottom: '150px', transform: 'scale(1.8)' }}>
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', width: `calc(100px + ${pulse}px)`, height: `calc(100px + ${pulse}px)`,
                    backgroundColor: '#3366FF', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 ${40 + pulse * 2}px rgba(51, 102, 255, 1)`, border: '4px solid rgba(255,255,255,0.8)'
                }}>
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontWeight: 'bold', fontSize: '36px' }}>+</span>
                </div>
                {/* Empty P-Orbital representation */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', width: '40px', height: '180px',
                    border: '2px dashed rgba(255,255,255,0.4)', borderRadius: '50%',
                    transform: `translate(-50%, -50%) rotate(45deg)`
                }} />
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', width: '40px', height: '180px',
                    border: '2px dashed rgba(255,255,255,0.4)', borderRadius: '50%',
                    transform: `translate(-50%, -50%) rotate(-45deg)`
                }} />
            </div>
        </AbsoluteFill>
    );
};

const ElectronFlowScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
    // A glowing electron dot moving along a curved path to signify arrow pushing
    const moveProgress = spring({ fps, frame: frame - 5, config: { damping: 15, mass: 2 } });
    const x = interpolate(moveProgress, [0, 1], [-100, 100]);
    const y = Math.sin(moveProgress * Math.PI) * -80; // arc up and over

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '300px', height: '200px', bottom: '150px', transform: 'scale(1.8)' }}>
                {/* Atom 1 */}
                <div style={{ position: 'absolute', top: '50%', left: '25%', width: '60px', height: '60px', backgroundColor: '#555', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
                {/* Atom 2 */}
                <div style={{ position: 'absolute', top: '50%', left: '75%', width: '60px', height: '60px', backgroundColor: '#555', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />

                {/* Flowing Electron */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', width: '15px', height: '15px',
                    backgroundColor: '#FFFF00', borderRadius: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    boxShadow: '0 0 20px 5px #FFFF00'
                }} />

                {/* Ghost trail text */}
                <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', color: '#FFFF00', opacity: 0.6, fontSize: '14px', letterSpacing: '2px' }}>
                    ELECTRON FLOW
                </div>
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
    // A Staggered Professional 3D-ish Bar Chart
    const columns = 6;

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: '400px', height: '250px', bottom: '150px', borderBottom: '3px solid rgba(0, 255, 255, 0.8)', borderLeft: '3px solid rgba(0, 255, 255, 0.8)' }}>
                {Array.from({ length: columns }).map((_, i) => {
                    const targetHeight = 50 + (i * 35); // Escalating pattern
                    const height = spring({ fps, frame: frame - (i * 5), config: { damping: 15 } }) * targetHeight;

                    return (
                        <div key={`col-${i}`} style={{
                            position: 'absolute',
                            bottom: 0,
                            left: `${20 + (i * 60)}px`,
                            width: '45px',
                            height: `${height}px`,
                            background: `linear-gradient(to top, rgba(0, 150, 255, 0.4), rgba(0, 255, 255, ${0.4 + (i * 0.1)}))`,
                            border: '1px solid #00FFFF',
                            borderBottom: 'none',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                            boxShadow: i === columns - 1 ? '0 0 30px rgba(0,255,255,0.6)' : 'none'
                        }}>
                            {/* Faux 3D Top face */}
                            <div style={{
                                position: 'absolute', top: '-10px', left: '-1px', width: '45px', height: '10px',
                                backgroundColor: `rgba(0, 255, 255, ${0.6 + (i * 0.1)})`,
                                borderTopLeftRadius: '2px', borderTopRightRadius: '2px',
                                transform: 'skewX(45deg)', transformOrigin: 'bottom left'
                            }} />
                            {/* Faux 3D Side face */}
                            <div style={{
                                position: 'absolute', top: '-10px', left: '44px', width: '10px', height: `${height}px`,
                                backgroundColor: `rgba(0, 150, 255, ${0.3 + (i * 0.1)})`,
                                transform: 'skewY(45deg)', transformOrigin: 'top left'
                            }} />
                        </div>
                    );
                })}
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
