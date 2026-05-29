import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getWords } from '../utils/api';
import gsap from 'gsap';

interface Word {
    id: string;
    text: string;
    value: number;
    color: string;
    left: string;
    top: string;
    fontSize: number;
}

const PREMIUM_COLORS = [
    "#3b82f6", // Blue 500
    "#60a5fa", // Blue 400
    "#93c5fd", // Blue 300
    "#fbbf24", // Amber 400
    "#f59e0b", // Amber 500
    "#fcd34d", // Amber 300
    "#ffffff", // White
];

const getStableHash = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const CloudProjection: React.FC = () => {
    const [displayWords, setDisplayWords] = useState<Word[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const processWords = useCallback((data: any[]) => {
        if (!data) return;
        
        const freq: Record<string, number> = {};
        data.forEach(item => {
            const t = item.text.trim().toUpperCase();
            if (t) freq[t] = (freq[t] || 0) + 1;
        });

        // UPGRADED FOR 500 WORDS
        const wordEntries = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 500);
        const count = wordEntries.length;
        if (count === 0) return;

        // ULTRA HIGH RESOLUTION GRID (30x20 = 600 cells)
        const COLS = 30;
        const ROWS = 20;
        const totalCells = COLS * ROWS;
        const occupancy = new Set<number>();

        // FORBIDDEN ZONES (Logo and Footer)
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 10; c++) occupancy.add(r * COLS + c);
        }
        for (let c = 0; c < 10; c++) occupancy.add((ROWS - 1) * COLS + c);

        const maxFreq = Math.max(...Object.values(freq), 1);
        const h = window.innerHeight;
        
        // MULTI-STAGE SCALING
        let scaleFactor = 1.0;
        if (count > 400) scaleFactor = 0.25;
        else if (count > 250) scaleFactor = 0.35;
        else if (count > 100) scaleFactor = 0.5;
        else scaleFactor = 0.8;

        const baseSize = (h * 0.018) * scaleFactor;
        const sizeRange = (h * 0.06) * scaleFactor;

        const processed: Word[] = [];

        wordEntries.forEach(text => {
            const hash = getStableHash(text);
            const initialIndex = hash % totalCells;

            let cellIndex = initialIndex;
            let attempts = 0;

            while (occupancy.has(cellIndex) && attempts < totalCells) {
                cellIndex = (cellIndex + 1) % totalCells;
                attempts++;
            }

            if (attempts < totalCells) {
                const col = cellIndex % COLS;
                const row = Math.floor(cellIndex / COLS);

                // STRONGER NEIGHBOR BLOCKING
                occupancy.add(cellIndex);
                if (col > 0) occupancy.add(row * COLS + (col - 1));
                if (col < COLS - 1) occupancy.add(row * COLS + (col + 1));
                
                // For top words, block even more space
                if (freq[text] > maxFreq * 0.4) {
                    if (row > 0) occupancy.add((row - 1) * COLS + col);
                    if (row < ROWS - 1) occupancy.add((row + 1) * COLS + col);
                    // Double horizontal for VIP words
                    if (col > 1) occupancy.add(row * COLS + (col - 2));
                    if (col < COLS - 2) occupancy.add(row * COLS + (col + 2));
                }

                // SAFE AREA: 10% to 90%
                const leftPct = 10 + ((col / (COLS - 1)) * 80);
                const topPct = 15 + ((row / (ROWS - 1)) * 70);

                processed.push({
                    id: text,
                    text,
                    fontSize: (freq[text] / maxFreq) * sizeRange + baseSize,
                    color: PREMIUM_COLORS[hash % PREMIUM_COLORS.length],
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    value: freq[text]
                });
            }
        });
        
        setDisplayWords(processed);
        setIsLoaded(true);
    }, []);

    const fetchWords = useCallback(async () => {
        try {
            const data = await getWords();
            processWords(data);
        } catch (error) {
            console.error("Cloud Error:", error);
        }
    }, [processWords]);

    useEffect(() => {
        fetchWords();
        const interval = setInterval(fetchWords, 5000);
        return () => clearInterval(interval);
    }, [fetchWords]);

    useEffect(() => {
        const els = document.querySelectorAll('.word-node');
        els.forEach((el) => {
            if (el.getAttribute('data-active') !== 'true') {
                gsap.fromTo(el, 
                    { opacity: 0, scale: 0 },
                    { 
                        opacity: 1, scale: 1, 
                        duration: 1.5, ease: "elastic.out(1, 0.75)",
                        delay: Math.random() * 2.5,
                        onComplete: () => {
                            gsap.to(el, {
                                y: "random(-2, 2)",
                                x: "random(-2, 2)",
                                duration: "random(6, 10)",
                                repeat: -1,
                                yoyo: true,
                                ease: "sine.inOut"
                            });
                        }
                    }
                );
                el.setAttribute('data-active', 'true');
            }
        });
    }, [displayWords]);

    return (
        <div className="fixed inset-0 bg-[#020617] text-white overflow-hidden font-sans select-none">
            {/* Cinematic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_100%)]" />
            
            {/* Logo Protection Area */}
            <div className="absolute top-12 left-12 flex items-center gap-5 z-50">
                <div className="w-1.5 h-12 bg-gradient-to-b from-blue-500 to-amber-500 rounded-full" />
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white/95 leading-none">AEC INTEGRAR</h1>
                    <p className="text-[10px] font-bold tracking-[0.4em] text-blue-400/70 uppercase mt-2">Insights em Tempo Real</p>
                </div>
            </div>

            {/* Word Cloud Surface */}
            <div className="relative w-full h-full">
                {displayWords.map((word) => (
                    <div
                        key={word.id}
                        className="word-node absolute pointer-events-none font-black whitespace-nowrap transition-all duration-1000 ease-in-out"
                        style={{
                            left: word.left,
                            top: word.top,
                            fontSize: `${word.fontSize}px`,
                            color: word.color,
                            transform: `translate(-50%, -50%)`,
                            textShadow: `0 0 40px ${word.color}33, 0 5px 15px rgba(0,0,0,0.5)`,
                            opacity: 0.9
                        }}
                    >
                        {word.text}
                    </div>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="absolute bottom-12 left-12 flex items-center gap-4 opacity-40 z-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/90">
                    Sessão Ativa: {displayWords.length} Palavras
                </span>
            </div>

            {/* Initial Loading */}
            {!isLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#020617] z-[100]">
                    <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <div className="text-[9px] text-blue-400/50 font-black tracking-[0.5em] uppercase">Engine V5 - 500+ Words Ready</div>
                </div>
            )}
        </div>
    );
};

export default CloudProjection;
