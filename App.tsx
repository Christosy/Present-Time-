
import React, { useState, useEffect, useMemo } from 'react';
import { Present, OverlayType, PresentStats } from './types';
import ScratchCard from './components/ScratchCard';
import { generateGiftData } from './services/geminiService';

const FallingBackground = () => {
  const items = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 15}s`,
      delay: `${Math.random() * 10}s`,
      size: `${20 + Math.random() * 30}px`,
      content: Math.random() > 0.3 ? '🎁' : '🎅',
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="falling-present"
          style={{
            left: item.left,
            animationDuration: item.duration,
            animationDelay: item.delay,
            fontSize: item.size,
          }}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [presents, setPresents] = useState<Present[]>([]);
  const [focusedPresentId, setFocusedPresentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hp, setHp] = useState<number>(100);
  const [romance, setRomance] = useState<number>(500);
  const [joy, setJoy] = useState<number>(80);
  const [rarity, setRarity] = useState<PresentStats['rarity']>('Rare');
  const [catchphrase, setCatchphrase] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('lovescratch_presents_v4');
    if (saved) {
      try {
        setPresents(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load presents", e);
      }
    } else {
        const initial: Present[] = [
            {
                id: '1',
                title: 'A Secret Getaway',
                imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800',
                description: 'To the mountains we go, where the air is sweet and the love is pure.',
                createdAt: Date.now(),
                overlayColor: OverlayType.SILVER,
                stats: { hp: 120, romance: 850, joy: 95, rarity: 'Legendary', catchphrase: "THE ADVENTURE AWAKENS!" }
            }
        ];
        setPresents(initial);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lovescratch_presents_v4', JSON.stringify(presents));
  }, [presents]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoFill = async () => {
    if (!title) {
      alert("Please enter a title first so AI knows what the gift is!");
      return;
    }
    setIsLoading(true);
    try {
      const { description: aiDesc, stats: aiStats } = await generateGiftData(title);
      setHp(aiStats.hp);
      setRomance(aiStats.romance);
      setJoy(aiStats.joy);
      setRarity(aiStats.rarity);
      setCatchphrase(aiStats.catchphrase);
      setDescription(aiDesc);
    } catch (error) {
      console.error("Auto-fill failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPresent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    const newPresent: Present = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      imageUrl,
      description: description || "A mystery awaits...",
      createdAt: Date.now(),
      overlayColor: OverlayType.SILVER,
      stats: {
        hp,
        romance,
        joy,
        rarity,
        catchphrase: catchphrase || "A NEW SURPRISE APPEARS!"
      }
    };

    setPresents([newPresent, ...presents]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setImageUrl('');
    setHp(100);
    setRomance(500);
    setJoy(80);
    setRarity('Rare');
    setCatchphrase('');
    setDescription('');
  };

  const deletePresent = (id: string) => {
    setPresents(presents.filter(p => p.id !== id));
  };

  const focusedPresent = presents.find(p => p.id === focusedPresentId);

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-7xl mx-auto relative">
      <FallingBackground />
      
      <header className="py-12 text-center relative z-10">
        <div className="relative inline-block">
          <h1 className="text-6xl md:text-8xl font-romantic text-rose-600 drop-shadow-xl mb-4 hover:scale-105 transition-transform cursor-default relative z-10">
            Present Time!
          </h1>
          {/* Minecraft Splash Text */}
          <div className="absolute -top-4 -right-8 md:-right-16 z-20">
            <span className="minecraft-splash text-lg md:text-2xl whitespace-nowrap">Verified by Kirk</span>
          </div>
        </div>
        
        <div className="block mt-2">
          <div className="inline-block px-4 py-1 bg-white/40 backdrop-blur rounded-full border border-rose-200">
             <p className="text-rose-500 font-bold tracking-widest uppercase text-[10px]">Trainer: Keisha Bridde &lt;3</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 relative z-10">
        {presents.map(present => (
          <ScratchCard 
            key={present.id} 
            present={present} 
            onDelete={deletePresent}
            isFocused={focusedPresentId === present.id}
            onFocus={setFocusedPresentId}
          />
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="aspect-[4/5] rounded-2xl border-4 border-dashed border-rose-200 bg-white/30 hover:bg-white/60 transition-all flex flex-col items-center justify-center group shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[10px] font-bold mt-2 uppercase tracking-tighter text-rose-400">Add Mystery Card</span>
        </button>
      </div>

      {focusedPresent && (
        <ScratchCard 
          present={focusedPresent}
          onDelete={deletePresent}
          isFocused={true}
          onFocus={setFocusedPresentId}
        />
      )}

      {/* Customization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto pt-20 pb-20">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border-4 border-rose-500 relative animate-in zoom-in-95 duration-300">
            <div className="bg-rose-500 px-8 py-6 flex justify-between items-center text-white sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-romantic">Customize Your Card</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Card Maker v1.0</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={addPresent} className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="space-y-1">
                    <label className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Surprise Name</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Moonlight Picnic"
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-rose-400 focus:bg-white transition-all outline-none font-bold text-gray-800"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Mystery Image</label>
                    <label className="flex flex-col items-center justify-center w-full h-52 border-4 border-dotted border-gray-200 rounded-3xl cursor-pointer hover:bg-rose-50 hover:border-rose-200 transition-all overflow-hidden relative group">
                      {imageUrl ? (
                        <div className="w-full h-full relative">
                          <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white font-bold text-xs uppercase bg-rose-500 px-3 py-1 rounded-full">Change Photo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <p className="text-xs font-black uppercase tracking-tighter">Click to Upload</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Base Stats</h4>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Hit Points (HP)</label>
                      <span className="text-[10px] font-black text-rose-500">{hp}</span>
                    </div>
                    <input type="range" min="10" max="200" value={hp} onChange={(e) => setHp(parseInt(e.target.value))} className="w-full accent-rose-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Romance Power</label>
                      <span className="text-[10px] font-black text-rose-500">{romance} XP</span>
                    </div>
                    <input type="range" min="10" max="999" value={romance} onChange={(e) => setRomance(parseInt(e.target.value))} className="w-full accent-rose-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Joy Factor</label>
                      <span className="text-[10px] font-black text-rose-500">{joy}%</span>
                    </div>
                    <input type="range" min="1" max="100" value={joy} onChange={(e) => setJoy(parseInt(e.target.value))} className="w-full accent-rose-500" />
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Card Rarity</label>
                    <select 
                      value={rarity} 
                      onChange={(e) => setRarity(e.target.value as PresentStats['rarity'])}
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-100 font-bold text-sm text-gray-700 focus:border-rose-400 outline-none"
                    >
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                      <option value="Mythical">Mythical</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Card Flavor Text</h4>
                  <button 
                    type="button" 
                    onClick={handleAutoFill}
                    disabled={isLoading || !title}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors disabled:opacity-40"
                  >
                    {isLoading ? "Thinking..." : "✨ AI Auto-fill Stats"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Intro Catchphrase</label>
                    <input 
                      type="text" 
                      value={catchphrase}
                      onChange={(e) => setCatchphrase(e.target.value)}
                      placeholder="THE STARS ALIGN..."
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-rose-400 focus:bg-white transition-all outline-none font-black italic uppercase text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Gift Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the magic of this gift..."
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-rose-400 focus:bg-white transition-all outline-none font-medium text-sm h-32"
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={isLoading || !imageUrl || !title}
                  className="w-full py-6 bg-rose-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-rose-200 hover:bg-rose-600 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  Confirm Legendary Summon ❤️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
