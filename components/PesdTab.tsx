import React from 'react';
import { PESD_ITEMS } from '../constants';
import { TabProps } from '../types';

export const PesdTab: React.FC<TabProps> = ({ data, onChange }) => {
    
    const getPesdLabel = (val: number) => {
        const abs = Math.abs(val);
        if (val === 0) return "Né...né";
        if (abs === 1) return "Poco";
        if (abs === 2) return "Abbastanza";
        if (abs === 3) return "Molto";
        if (abs === 4) return "Moltissimo";
        return "";
    };

    return (
        <div className="space-y-6">
            <div className="mb-6 p-6 bg-teal-900/10 rounded-lg border border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.05)]">
                <h3 className="text-xl font-bold text-teal-400 mb-3 tracking-wide">PESD-Sport</h3>
                <div className="text-sm text-slate-300 leading-relaxed text-justify space-y-3">
                    <p>
                        Scegli tra i due descrittori opposti quello che riflette <strong>come ti senti in relazione alla prossima gara</strong> e inserisci il valore corrispondente all'intensità.
                    </p>
                    <p>
                        Se nessuno dei due descrittori è presente, inserisci il valore <strong>0 (Né...né)</strong>.
                    </p>
                </div>
                {/* Legenda visuale della scala */}
                <div className="mt-4 bg-slate-950/50 p-3 rounded-md border border-teal-500/20 text-center">
                     <p className="text-xs font-mono text-teal-300 font-bold mb-2 uppercase tracking-wider">Scala di Intensità</p>
                     <div className="grid grid-cols-5 gap-1 text-[10px] sm:text-xs text-slate-400 font-medium">
                        <div>1 = Poco</div>
                        <div>2 = Abbastanza</div>
                        <div>3 = Molto</div>
                        <div>4 = Moltissimo</div>
                        <div className="text-white font-bold">0 = Né...né</div>
                     </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                {PESD_ITEMS.map((item, index) => (
                    <div key={index} className="bg-slate-900 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-800 hover:border-teal-500/30 transition-all">
                        {/* Intestazione Descrittori */}
                        <div className="flex justify-between text-sm font-semibold mb-6 items-end">
                            <span className="text-red-400 w-[40%] text-left leading-tight text-xs sm:text-sm">{item.left}</span>
                            <span className="text-slate-600 w-[20%] text-center text-[10px] uppercase tracking-widest mb-0.5">VS</span>
                            <span className="text-green-400 w-[40%] text-right leading-tight text-xs sm:text-sm">{item.right}</span>
                        </div>
                        
                        <div className="relative pt-2 pb-2">
                            {/* Gradient Background Track */}
                            <div className="absolute top-1/2 left-0 w-full h-2 -mt-1 rounded-full bg-gradient-to-r from-red-900/40 via-slate-700 to-green-900/40 border border-slate-700"></div>
                            
                            <input
                                type="range"
                                min={-4}
                                max={4}
                                step={1}
                                value={data[index]}
                                onChange={(e) => onChange(index, parseInt(e.target.value))}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-slate-200 z-10 relative focus:outline-none"
                            />
                            
                            {/* Labels sotto lo slider - Abbreviate per mobile, ma chiare */}
                            <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 mt-3 px-0.5 font-mono uppercase tracking-tighter">
                                <span className="w-8 text-center hover:text-red-400 transition-colors cursor-pointer" onClick={() => onChange(index, -4)}>Moltis.</span>
                                <span className="w-8 text-center hidden sm:inline-block cursor-pointer" onClick={() => onChange(index, -3)}>Molto</span>
                                <span className="w-8 text-center hover:text-red-300 transition-colors cursor-pointer" onClick={() => onChange(index, -2)}>Abbast.</span>
                                <span className="w-8 text-center hidden sm:inline-block cursor-pointer" onClick={() => onChange(index, -1)}>Poco</span>
                                <span className="w-8 text-center font-bold text-slate-400 hover:text-white transition-colors cursor-pointer" onClick={() => onChange(index, 0)}>Né..né</span>
                                <span className="w-8 text-center hidden sm:inline-block cursor-pointer" onClick={() => onChange(index, 1)}>Poco</span>
                                <span className="w-8 text-center hover:text-green-300 transition-colors cursor-pointer" onClick={() => onChange(index, 2)}>Abbast.</span>
                                <span className="w-8 text-center hidden sm:inline-block cursor-pointer" onClick={() => onChange(index, 3)}>Molto</span>
                                <span className="w-8 text-center hover:text-green-400 transition-colors cursor-pointer" onClick={() => onChange(index, 4)}>Moltis.</span>
                            </div>
                        </div>
                        
                        <div className="text-center mt-5">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold border shadow-inner transition-all duration-300 ${
                                data[index] < 0 ? 'bg-red-950/40 text-red-300 border-red-900/50' : 
                                data[index] > 0 ? 'bg-green-950/40 text-green-300 border-green-900/50' : 
                                'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                                <span className="opacity-70 font-mono text-[10px]">INTENSITÀ:</span> 
                                <span className="uppercase tracking-wide">{getPesdLabel(data[index])}</span>
                                <span className="bg-black/30 px-1.5 rounded text-[10px] ml-1 font-mono">{data[index] > 0 ? '+' : ''}{data[index]}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};