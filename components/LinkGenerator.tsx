import React, { useState } from 'react';
import { Copy, Navigation, Smartphone, Mail, Link as LinkIcon, CheckSquare, Square } from 'lucide-react';
import { QUESTIONNAIRE_MAP } from '../constants';

export const LinkGenerator = () => {
    const keys = Object.keys(QUESTIONNAIRE_MAP);
    const [selectedReqs, setSelectedReqs] = useState<string[]>(keys); // default to all
    const [copied, setCopied] = useState(false);

    const toggleSelection = (key: string) => {
        if (selectedReqs.includes(key)) {
            setSelectedReqs(selectedReqs.filter(k => k !== key));
        } else {
            setSelectedReqs([...selectedReqs, key]);
        }
    };

    const toggleAll = (select: boolean) => {
        if (select) {
            setSelectedReqs(keys);
        } else {
            setSelectedReqs([]);
        }
    };

    const generateLinkURL = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        if (selectedReqs.length === 0) return `${baseUrl}#/compila?q=none`;
        if (selectedReqs.length === keys.length) return `${baseUrl}#/compila`; // all
        return `${baseUrl}#/compila?q=${selectedReqs.join(',')}`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateLinkURL());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const totalItems = selectedReqs.reduce((acc, key) => acc + QUESTIONNAIRE_MAP[key].itemCount, 0);
    const estimatedMinutes = Math.ceil((totalItems * 12) / 60);

    const link = generateLinkURL();
    const encodedLink = encodeURIComponent(link);

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="bg-slate-900 p-6 border-b border-slate-800">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <LinkIcon className="text-cyan-400" /> Genera Link Assessment
                </h2>
                <p className="text-slate-400 mt-2 text-sm">
                    Seleziona quali questionari vuoi inviare all'atleta. 
                    Verrà generato un link personalizzato da condividere via WhatsApp o Email.
                </p>
            </div>

            <div className="p-6 md:p-8 space-y-8 max-w-3xl mx-auto w-full">
                {/* Selection Cards */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-200">Seleziona i questionari da inviare:</h3>
                        <div className="flex gap-2 text-xs">
                            <button onClick={() => toggleAll(true)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors">Seleziona tutti</button>
                            <button onClick={() => toggleAll(false)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors">Nessuno</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {keys.map((key) => {
                            const isSelected = selectedReqs.includes(key);
                            return (
                                <div 
                                    key={key} 
                                    onClick={() => toggleSelection(key)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-800 bg-slate-950 hover:bg-slate-800'}`}
                                >
                                    <div className={`${isSelected ? 'text-cyan-400' : 'text-slate-600'}`}>
                                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                            {QUESTIONNAIRE_MAP[key].label}
                                        </div>
                                        <div className="text-[10px] text-slate-500">{QUESTIONNAIRE_MAP[key].itemCount} item</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 py-3 px-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-cyan-400">{selectedReqs.length}</span> questionari
                        </div>
                        <div className="h-4 border-l border-slate-700"></div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-yellow-400">{totalItems}</span> item
                        </div>
                        <div className="h-4 border-l border-slate-700"></div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                            ~ <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-green-400">{estimatedMinutes} min</span>
                        </div>
                    </div>
                </div>

                {/* Final Link Result */}
                <div className="bg-slate-900 border border-cyan-900/50 rounded-xl p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                    <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <Navigation size={18} className="text-cyan-500" /> Link Pronto da Condividere
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-6 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-hidden">
                        <div className="text-slate-400 font-mono text-sm truncate flex-1 select-all">
                            {link}
                        </div>
                        <button 
                            onClick={handleCopy}
                            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-md transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'}`}
                        >
                            <Copy size={16} /> {copied ? 'Copiato!' : 'Copia'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a 
                            href={`https://wa.me/?text=Ciao,%20compila%20il%20questionario:%20${encodedLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-colors"
                        >
                            <Smartphone size={18} /> Invia su WhatsApp
                        </a>
                        <a 
                            href={`mailto:?subject=FLUX%20Assessment&body=Ciao,%20compila%20il%20questionario%20a%20questo%20link:%0A%0A${encodedLink}`}
                            className="bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 text-blue-400 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-colors"
                        >
                            <Mail size={18} /> Invia via Email
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
