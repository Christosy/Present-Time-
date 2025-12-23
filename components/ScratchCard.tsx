
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Present } from '../types';

interface ScratchCardProps {
  present: Present;
  onDelete: (id: string) => void;
  isFocused: boolean;
  onFocus: (id: string | null) => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ present, onDelete, isFocused, onFocus }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Classic Metallic Grey Overlay
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scratchie Texture
    for (let i = 0; i < 5000; i++) {
      const shade = Math.random() * 60 + 140;
      ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.6)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
    
    setRevealed(false);
    setShowStats(false);
    setScratchProgress(0);
    setTypewriterText("");
  }, []);

  useEffect(() => {
    if (isFocused) {
      // Re-init canvas when it becomes focused so dimensions are right
      setTimeout(initCanvas, 50);
    }
  }, [isFocused, initCanvas]);

  const scratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isFocused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) count++;
    }

    const percent = (count / (canvas.width * canvas.height)) * 100;
    setScratchProgress(percent);
    
    if (percent > 55 && !revealed) {
      setRevealed(true);
      setTimeout(() => {
        setShowStats(true);
        startTypewriter();
      }, 1000);
    }
  };

  // Fix: Removed .toString() from setInterval to ensure the returned value remains a number for clearInterval
  const startTypewriter = () => {
    const fullText = present.description;
    let current = "";
    let i = 0;
    const interval = window.setInterval(() => {
      current += fullText[i];
      setTypewriterText(current);
      i++;
      if (i >= fullText.length) window.clearInterval(interval);
    }, 40);
  };

  if (!isFocused) {
    return (
      <div 
        onClick={() => onFocus(present.id)}
        className="relative aspect-[4/5] rounded-2xl bg-white shadow-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform border-2 border-rose-100"
      >
        <div className="absolute inset-0 bg-[#b0b0b0] flex flex-col items-center justify-center p-6 text-center">
           <div className="text-4xl mb-4 group-hover:rotate-12 transition-transform">🎁</div>
           <p className="font-bold text-gray-600 uppercase tracking-tighter text-sm">Mystery Present</p>
           <p className="text-[10px] text-gray-500 mt-2">CLICK TO SELECT</p>
        </div>
        <div className="absolute top-2 right-2">
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(present.id); }}
             className="p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-700 hover:text-white rounded-full transition-colors"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
             </svg>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      {/* Background Flash Effect */}
      {revealed && !showStats && <div className="absolute inset-0 z-50 bg-white animate-flash" />}

      {/* Close Button */}
      <button 
        onClick={() => onFocus(null)}
        className="absolute top-6 right-6 z-[110] text-white/50 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main Focused Card Container */}
      <div className={`relative w-full max-w-lg aspect-[4/5] rounded-[2.5rem] shadow-[0_0_80px_rgba(255,255,255,0.1)] overflow-hidden border-8 ${revealed ? 'border-yellow-400 animate-card-vibrate' : 'border-white/20'} transition-all duration-700 bg-gray-900`}>
        
        {/* The Gift Image */}
        <div className={`absolute inset-0 z-0 transition-transform duration-[2000ms] ${showStats ? 'scale-110' : 'scale-100'}`}>
          <img src={present.imageUrl} className="w-full h-full object-cover" alt="" />
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-1000 ${showStats ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Introduction / Stats UI */}
        {showStats && present.stats && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 text-white">
            <div className="flex justify-between items-start animate-in slide-in-from-top-10 duration-700">
              <div className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-black text-lg shadow-[4px_4px_0px_#000] rotate-[-2deg]">
                HP {present.stats.hp}
              </div>
              <div className="bg-rose-600 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest animate-bounce shadow-xl">
                {present.stats.rarity}
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center animate-in zoom-in duration-500">
                <h4 className="text-yellow-300 font-black text-xl italic uppercase tracking-tighter drop-shadow-lg mb-1">
                  {present.stats.catchphrase}
                </h4>
                <h3 className="text-5xl font-romantic text-white drop-shadow-2xl">{present.title}</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                    <span>Romance Strength</span>
                    <span className="text-rose-400">{present.stats.romance} XP</span>
                  </div>
                  <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 animate-grow-width" style={{ width: `${(present.stats.romance / 1000) * 100}%` }} />
                  </div>
                </div>
                
                <div className="bg-black/80 border-2 border-white/30 p-4 rounded-2xl">
                   <p className="font-mono text-sm leading-relaxed text-green-400 h-16 overflow-hidden">
                     {typewriterText}<span className="animate-pulse">_</span>
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scratch Canvas Overlay */}
        <canvas
          ref={canvasRef}
          onMouseDown={() => setIsDrawing(true)}
          onMouseMove={scratch}
          onMouseUp={() => { setIsDrawing(false); checkProgress(); }}
          onMouseLeave={() => { setIsDrawing(false); checkProgress(); }}
          onTouchStart={() => setIsDrawing(true)}
          onTouchMove={scratch}
          onTouchEnd={() => { setIsDrawing(false); checkProgress(); }}
          className={`absolute inset-0 z-40 cursor-crosshair touch-none transition-opacity duration-1000 ${revealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        />

        {!revealed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-4 animate-bounce">
              <div className="w-16 h-16 rounded-full border-4 border-white/50 border-t-white animate-spin"></div>
              <p className="bg-white/10 backdrop-blur text-white px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest">
                Release the Hidden Power
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash {
          animation: flash 0.5s ease-out;
        }
        @keyframes grow-width {
          from { width: 0; }
          to { width: inherit; }
        }
        .animate-grow-width {
          animation: grow-width 1.5s ease-out forwards;
        }
        @keyframes card-vibrate {
          0% { transform: translate(0,0) rotate(0deg); }
          25% { transform: translate(2px, 2px) rotate(1deg); }
          50% { transform: translate(-2px, -2px) rotate(-1deg); }
          75% { transform: translate(2px, -2px) rotate(1deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }
        .animate-card-vibrate {
          animation: card-vibrate 0.1s linear infinite;
          animation-iteration-count: 5;
        }
      `}</style>
    </div>
  );
};

export default ScratchCard;
