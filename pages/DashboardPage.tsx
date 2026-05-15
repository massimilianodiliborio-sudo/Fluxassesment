import React, { useState, useEffect } from 'react';
import { Target, Search, Lock, Users, RefreshCw, Trash2, Filter, ChevronLeft, LogOut, Loader2, Download, Upload, Link as LinkIcon } from 'lucide-react';
import { supabase, getEnvVar } from '../lib/supabase';
import { AssessmentRecord } from '../types';
import { ResultsTab } from '../components/ResultsTab';
import { IppsTab, TipiTab, MisTab, ErqTab, PpsTab, CfqTab, BnsssTab, SeqTab, MtsTab, CtTab, TeiqueTab, MaiaTab, PassionTab } from '../components/Questionnaires';
import { PesdTab } from '../components/PesdTab';
import { LinkGenerator } from '../components/LinkGenerator';
import {
    IPPS_ITEMS, TIPI_ITEMS, MIS_ITEMS, ERQ_ITEMS, PPS_ITEMS, CFQ_ITEMS, BNSSS_ITEMS, SEQ_ITEMS, MTS_ITEMS, CT_ITEMS, PESD_ITEMS, DISCIPLINES,
    TEIQUE_ITEMS, MAIA_ITEMS, PASSION_ITEMS
} from '../constants';

export const DashboardPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [records, setRecords] = useState<AssessmentRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<AssessmentRecord[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [disciplineFilter, setDisciplineFilter] = useState('Tutte');
    const [activeTab, setActiveTab] = useState(9); // Default to Results
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Selected data state
    const [currentProfile, setCurrentProfile] = useState({ name: '', discipline: '', yearsOfPractice: 0, email: '', phone: '' });
    const [ippsData, setIppsData] = useState<number[]>(new Array(IPPS_ITEMS.length).fill(3));
    const [tipiData, setTipiData] = useState<number[]>(new Array(TIPI_ITEMS.length).fill(4));
    const [misData, setMisData] = useState<number[]>(new Array(MIS_ITEMS.length).fill(3));
    const [erqData, setErqData] = useState<number[]>(new Array(ERQ_ITEMS.length).fill(4));
    const [ppsData, setPpsData] = useState<number[]>(new Array(PPS_ITEMS.length).fill(4));
    const [cfqData, setCfqData] = useState<number[]>(new Array(CFQ_ITEMS.length).fill(3));
    const [bnsssData, setBnsssData] = useState<number[]>(new Array(BNSSS_ITEMS.length).fill(4));
    const [seqData, setSeqData] = useState<number[]>(new Array(SEQ_ITEMS.length).fill(2));
    const [mtsData, setMtsData] = useState<number[]>(new Array(MTS_ITEMS.length).fill(3));
    const [ctData, setCtData] = useState<number[]>(new Array(CT_ITEMS.length).fill(3));
    const [pesdData, setPesdData] = useState<number[]>(new Array(PESD_ITEMS.length).fill(0));
    const [teiqueData, setTeiqueData] = useState<number[]>(new Array(TEIQUE_ITEMS.length).fill(4));
    const [maiaData, setMaiaData] = useState<number[]>(new Array(MAIA_ITEMS.length).fill(2));
    const [passionData, setPassionData] = useState<number[]>(new Array(PASSION_ITEMS.length).fill(3));

    // Tracks which questionnaires have real data from DB (not just safeArr defaults)
    const [compiled, setCompiled] = useState<Record<string, boolean>>({});

    // Mobile view state
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Supabase Error:", error);
                if (error.message && (error.message.includes("fetch") || error.message.includes("network"))) {
                    alert("⚠️ Errore di connessione al database online. Verifica la tua connessione o le credenziali.");
                } else {
                    alert("Errore nel caricamento dati: " + error.message);
                }
            } else if (data) {
                const mapped: AssessmentRecord[] = data.map(d => ({
                    id: d.id,
                    date: new Date(d.created_at).toLocaleDateString(),
                    name: d.athlete_name,
                    discipline: d.discipline,
                    yearsOfPractice: d.years_of_practice,
                    email: d.email || '',
                    phone: d.phone || '',
                    ipps: d.ipps || [],
                    tipi: d.tipi || [],
                    mis: d.mis || [],
                    erq: d.erq || [],
                    pps: d.pps || [],
                    cfq: d.cfq || [],
                    bnsss: d.bnsss || [],
                    seq: d.seq || [],
                    mts: d.mts || [],
                    ct: d.ct || [],
                    pesd: d.pesd || [],
                    teique: d.teique || [],
                    maia: d.maia || [],
                    passion: d.passion || []
                }));
                setRecords(mapped);
                applyFilters(mapped, searchTerm, disciplineFilter);
            }
        } catch (err: any) {
            console.error("Unexpected Fetch Error:", err);
            alert("⚠️ Errore imprevisto durante il caricamento.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        const { data, error } = await supabase.from('assessments').select('*');
        if (error || !data) {
            alert("Errore durante l'esportazione dei dati.");
            return;
        }
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `flux_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target?.result as string);
                if (Array.isArray(importedData)) {
                    if(confirm(`Trovati ${importedData.length} record nel backup. Vuoi importarli?`)) {
                        const { error } = await supabase.from('assessments').insert(importedData);
                        if (!error) {
                            alert("✅ Backup importato con successo!");
                            fetchRecords();
                        } else {
                            alert("Errore importazione: " + error.message);
                        }
                    }
                } else {
                    alert("Il file non contiene un elenco valido di dati.");
                }
            } catch (err) {
                alert("File di backup non valido o corrotto.");
            }
            if (event.target) event.target.value = ''; 
        };
        reader.readAsText(file);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const envPass = getEnvVar('VITE_ADMIN_PASSWORD') || 'admin';
        if (password === envPass) {
            setIsAuthenticated(true);
            fetchRecords();
        } else {
            alert("Password errata");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
        setSelectedId(null);
    };

    const applyFilters = (data: AssessmentRecord[], search: string, disc: string) => {
        let res = data;
        if (search) {
            const lower = search.toLowerCase();
            res = res.filter(r => r.name.toLowerCase().includes(lower));
        }
        if (disc !== 'Tutte') {
            res = res.filter(r => r.discipline === disc);
        }
        setFilteredRecords(res);
    };

    useEffect(() => {
        applyFilters(records, searchTerm, disciplineFilter);
    }, [searchTerm, disciplineFilter, records]);

    const selectRecord = (record: AssessmentRecord) => {
        // M4: validate array lengths to prevent crashes on malformed DB data
        const safeArr = (arr: number[] | undefined, expectedLen: number, fallback: number): number[] => {
            if (!arr || arr.length !== expectedLen) return new Array(expectedLen).fill(fallback);
            return arr;
        };
        // Track which questionnaires have real data from DB
        const hasData = (arr: number[] | undefined): boolean => !!(arr && arr.length > 0);

        // M1: reset compiled first to avoid stale state from previous record
        setCompiled({});

        setCompiled({
            IPPS:    hasData(record.ipps),
            TIPI:    hasData(record.tipi),
            MIS:     hasData(record.mis),
            ERQ:     hasData(record.erq),
            PPS:     hasData(record.pps),
            CFQ:     hasData(record.cfq),
            BNSSS:   hasData(record.bnsss),
            SEQ:     hasData(record.seq),
            MTS:     hasData(record.mts),
            CT:      hasData(record.ct),
            PESD:    hasData(record.pesd),
            TEIQUE:  hasData(record.teique),
            MAIA:    hasData(record.maia),
            PASSION: hasData(record.passion),
        });

        setSelectedId(record.id);
        setCurrentProfile({
            name: record.name,
            discipline: record.discipline,
            yearsOfPractice: record.yearsOfPractice,
            email: record.email,
            phone: record.phone
        });
        setIppsData(safeArr(record.ipps,    IPPS_ITEMS.length,    3));
        setTipiData(safeArr(record.tipi,    TIPI_ITEMS.length,    4));
        setMisData(safeArr(record.mis,      MIS_ITEMS.length,     3));
        setErqData(safeArr(record.erq,      ERQ_ITEMS.length,     4));
        setPpsData(safeArr(record.pps,      PPS_ITEMS.length,     4));
        setCfqData(safeArr(record.cfq,      CFQ_ITEMS.length,     3));
        setBnsssData(safeArr(record.bnsss,  BNSSS_ITEMS.length,   4));
        setSeqData(safeArr(record.seq,      SEQ_ITEMS.length,     2));
        setMtsData(safeArr(record.mts,      MTS_ITEMS.length,     3));
        setCtData(safeArr(record.ct,        CT_ITEMS.length,      3));
        setPesdData(safeArr(record.pesd,    PESD_ITEMS.length,    0));
        setTeiqueData(safeArr(record.teique, TEIQUE_ITEMS.length, 4));
        setMaiaData(safeArr(record.maia,    MAIA_ITEMS.length,    2));
        setPassionData(safeArr(record.passion, PASSION_ITEMS.length, 3));
        setActiveTab(10); // 10 represents the Results tab
        setIsMobileListVisible(false);
    };

    const clearSelection = () => {
        setSelectedId(null);
        setIsMobileListVisible(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Sei sicuro di voler eliminare definitivamente questo record?")) {
            const { error } = await supabase.from('assessments').delete().eq('id', id);
            if (error) {
                alert("Errore eliminazione");
            } else {
                const updated = records.filter(r => r.id !== id);
                setRecords(updated);
                if (selectedId === id) clearSelection();
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-slate-800 max-w-sm w-full">
                    <div className="flex justify-center mb-6 text-cyan-400">
                        <Lock size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-white mb-6">Accesso Psicologo</h2>
                    <input
                        type="password"
                        placeholder="Password Amministratore"
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg mb-4 outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-600"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-lg font-bold transition-all shadow-lg shadow-cyan-900/50">
                        Entra
                    </button>
                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-500">Password richiesta per accedere ai dati sensibili.</p>
                    </div>
                    <div className="mt-6 text-center border-t border-slate-800 pt-4">
                        <a href="#/compila" className="text-sm text-slate-400 hover:text-white underline transition-colors">Torna al questionario</a>
                    </div>
                </form>
            </div>
        );
    }

    const NotCompiled = ({ label }: { label: string }) => (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 text-slate-600 text-sm italic">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
            {label} — non compilato
        </div>
    );

    // m4: true if no questionnaire has data at all
    const nothingCompiled = Object.keys(compiled).length > 0 && Object.values(compiled).every(v => !v);

    const TABS = [
        { id: 10, label: 'Risultati & Analisi', key: null },
        { id: 0,  label: 'IPPS-24',      key: 'IPPS'    },
        { id: 1,  label: 'TIPI',         key: 'TIPI'    },
        { id: 2,  label: 'MIS',          key: 'MIS'     },
        { id: 3,  label: 'ERQ',          key: 'ERQ'     },
        { id: 4,  label: 'PPS-S',        key: 'PPS'     },
        { id: 5,  label: 'CFQ',          key: 'CFQ'     },
        { id: 6,  label: 'BNSSS',        key: 'BNSSS'   },
        { id: 7,  label: 'SEQ',          key: 'SEQ'     },
        { id: 8,  label: 'MTS',          key: 'MTS'     },
        { id: 9,  label: 'CT',           key: 'CT'      },
        { id: 11, label: 'PESD',         key: 'PESD'    },
        { id: 12, label: 'TEIQue-SF',    key: 'TEIQUE'  },
        { id: 13, label: 'MAIA',         key: 'MAIA'    },
        { id: 14, label: 'Passion Scale',key: 'PASSION' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
            {/* Left Panel: List of Assessments */}
            <aside className={`w-full md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-xl transition-transform duration-300 absolute md:relative h-full ${isMobileListVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                        <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <Users size={18} className="text-cyan-400" /> Database Atleti
                        </h2>
                        <div className="flex gap-2">
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImport} 
                                className="hidden" 
                                accept=".json"
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-green-400 rounded-full transition" title="Importa Backup">
                                <Upload size={16} />
                            </button>
                            <button onClick={handleExport} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded-full transition" title="Esporta Backup">
                                <Download size={16} />
                            </button>
                            <button onClick={fetchRecords} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition" title="Aggiorna">
                                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                            <button onClick={handleLogout} className="p-2 hover:bg-red-900/20 text-red-500 rounded-full transition" title="Esci">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { setSelectedId('link-generator'); setIsMobileListVisible(false); }}
                        className={`w-full mb-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold transition-all border ${selectedId === 'link-generator' ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/50' : 'bg-slate-950 border-slate-700 text-cyan-400 hover:bg-slate-800'}`}
                    >
                        <LinkIcon size={16} /> Genera Link Assessment
                    </button>

                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Cerca atleta..." 
                                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none placeholder-slate-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1">
                            <Filter size={14} className="text-slate-500" />
                            <select 
                                className="w-full py-1 text-sm bg-transparent outline-none cursor-pointer text-slate-300"
                                value={disciplineFilter}
                                onChange={(e) => setDisciplineFilter(e.target.value)}
                            >
                                <option value="Tutte" className="bg-slate-900">Tutte le discipline</option>
                                {DISCIPLINES.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-cyan-500" />
                            <span className="text-xs">Caricamento dati...</span>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            <div className="bg-slate-800/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                <Users size={20} className="opacity-50" />
                            </div>
                            Nessun assessment trovato.
                        </div>
                    ) : (
                        <ul>
                            {filteredRecords.map(rec => (
                                <li 
                                    key={rec.id}
                                    onClick={() => selectRecord(rec)}
                                    className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors relative group ${selectedId === rec.id ? 'bg-slate-800 border-l-4 border-cyan-500' : ''}`}
                                >
                                    <div className="font-bold text-slate-200">{rec.name}</div>
                                    <div className="text-xs text-slate-500 flex flex-col gap-1 mt-1">
                                        <div className="flex justify-between">
                                            <span>{rec.discipline}</span>
                                            <span>{rec.date}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1 truncate">
                                            Test: {[
                                                rec.ipps?.length   ? 'IPPS'    : null,
                                                rec.tipi?.length   ? 'TIPI'    : null,
                                                rec.mis?.length    ? 'MIS'     : null,
                                                rec.erq?.length    ? 'ERQ'     : null,
                                                rec.pps?.length    ? 'PPS'     : null,
                                                rec.cfq?.length    ? 'CFQ'     : null,
                                                rec.bnsss?.length  ? 'BNSSS'   : null,
                                                rec.seq?.length    ? 'SEQ'     : null,
                                                rec.mts?.length    ? 'MTS'     : null,
                                                rec.ct?.length     ? 'CT'      : null,
                                                rec.pesd?.length   ? 'PESD'    : null,
                                                rec.teique?.length ? 'TEIQue'  : null,
                                                rec.maia?.length   ? 'MAIA'    : null,
                                                rec.passion?.length? 'Passion' : null,
                                            ].filter(Boolean).join(', ') || 'Nessuno'}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDelete(rec.id, e)}
                                        className="absolute right-2 top-3 p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Elimina record"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>

            {/* Main Area: Detailed View */}
            <main className={`flex-1 flex flex-col overflow-hidden bg-slate-950 absolute md:relative w-full h-full transition-transform duration-300 ${!isMobileListVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {selectedId === 'link-generator' ? (
                    <>
                        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center gap-3 text-white">
                            <button onClick={clearSelection} className="p-2 -ml-2 hover:bg-slate-800 rounded-full">
                                <ChevronLeft size={24} />
                            </button>
                            <span className="font-bold truncate">Indietro</span>
                        </div>
                        <LinkGenerator />
                    </>
                ) : selectedId ? (
                    <>
                        {/* Mobile Header for Detail View */}
                        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center gap-3 text-white">
                            <button onClick={clearSelection} className="p-2 -ml-2 hover:bg-slate-800 rounded-full">
                                <ChevronLeft size={24} />
                            </button>
                            <span className="font-bold truncate">{currentProfile.name}</span>
                        </div>

                         {/* Tabs Navigation — M7: compiled tabs bright, non-compiled visibly dimmed */}
                        <div className="bg-slate-900 border-b border-slate-800 p-4">
                             <div className="flex flex-nowrap overflow-x-auto gap-2 text-sm font-medium pb-1 scrollbar-none">
                                {TABS.map(tab => {
                                    const isCompiled = tab.key === null || compiled[tab.key];
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`py-2 px-3 rounded-lg border transition-colors shrink-0 text-xs ${
                                                isActive
                                                    ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400'
                                                    : isCompiled
                                                        ? 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                                                        : 'border-slate-800 text-slate-600 hover:bg-slate-800/40 line-through decoration-slate-700'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                             </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            <div className="max-w-6xl mx-auto">
                            {/* m4: show single message if nothing was compiled */}
                            {activeTab !== 10 && nothingCompiled && (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-600 gap-3">
                                    <span className="text-4xl">—</span>
                                    <p className="text-sm italic">Nessun dato disponibile per questo atleta.</p>
                                </div>
                            )}
                                {activeTab === 10 && <ResultsTab profile={currentProfile} data={{ ipps: ippsData, tipi: tipiData, mis: misData, erq: erqData, pps: ppsData, cfq: cfqData, bnsss: bnsssData, seq: seqData, mts: mtsData, ct: ctData, pesd: pesdData, teique: teiqueData, maia: maiaData, passion: passionData }} />}
                                {/* Read-only views — show placeholder if not compiled (skip if nothingCompiled shows the global message) */}
                                {!nothingCompiled && activeTab === 0  && (compiled.IPPS    ? <div className="pointer-events-none opacity-80"><IppsTab    data={ippsData}    onChange={()=>{}} /></div> : <NotCompiled label="IPPS-24" />)}
                                {!nothingCompiled && activeTab === 1  && (compiled.TIPI    ? <div className="pointer-events-none opacity-80"><TipiTab    data={tipiData}    onChange={()=>{}} /></div> : <NotCompiled label="TIPI" />)}
                                {!nothingCompiled && activeTab === 2  && (compiled.MIS     ? <div className="pointer-events-none opacity-80"><MisTab     data={misData}     onChange={()=>{}} /></div> : <NotCompiled label="MIS" />)}
                                {!nothingCompiled && activeTab === 3  && (compiled.ERQ     ? <div className="pointer-events-none opacity-80"><ErqTab     data={erqData}     onChange={()=>{}} /></div> : <NotCompiled label="ERQ" />)}
                                {!nothingCompiled && activeTab === 4  && (compiled.PPS     ? <div className="pointer-events-none opacity-80"><PpsTab     data={ppsData}     onChange={()=>{}} /></div> : <NotCompiled label="PPS-S" />)}
                                {!nothingCompiled && activeTab === 5  && (compiled.CFQ     ? <div className="pointer-events-none opacity-80"><CfqTab     data={cfqData}     onChange={()=>{}} /></div> : <NotCompiled label="CFQ" />)}
                                {!nothingCompiled && activeTab === 6  && (compiled.BNSSS   ? <div className="pointer-events-none opacity-80"><BnsssTab   data={bnsssData}   onChange={()=>{}} /></div> : <NotCompiled label="BNSSS" />)}
                                {!nothingCompiled && activeTab === 7  && (compiled.SEQ     ? <div className="pointer-events-none opacity-80"><SeqTab     data={seqData}     onChange={()=>{}} /></div> : <NotCompiled label="SEQ" />)}
                                {!nothingCompiled && activeTab === 8  && (compiled.MTS     ? <div className="pointer-events-none opacity-80"><MtsTab     data={mtsData}     onChange={()=>{}} /></div> : <NotCompiled label="MTS" />)}
                                {!nothingCompiled && activeTab === 9  && (compiled.CT      ? <div className="pointer-events-none opacity-80"><CtTab      data={ctData}      onChange={()=>{}} /></div> : <NotCompiled label="Sfida & Minaccia" />)}
                                {!nothingCompiled && activeTab === 11 && (compiled.PESD    ? <div className="pointer-events-none opacity-80"><PesdTab    data={pesdData}    onChange={()=>{}} /></div> : <NotCompiled label="PESD-Sport" />)}
                                {!nothingCompiled && activeTab === 12 && (compiled.TEIQUE  ? <div className="pointer-events-none opacity-80"><TeiqueTab  data={teiqueData}  onChange={()=>{}} /></div> : <NotCompiled label="TEIQue-SF" />)}
                                {!nothingCompiled && activeTab === 13 && (compiled.MAIA    ? <div className="pointer-events-none opacity-80"><MaiaTab    data={maiaData}    onChange={()=>{}} /></div> : <NotCompiled label="MAIA" />)}
                                {!nothingCompiled && activeTab === 14 && (compiled.PASSION ? <div className="pointer-events-none opacity-80"><PassionTab data={passionData} onChange={()=>{}} /></div> : <NotCompiled label="Passion Scale" />)}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-6 text-center">
                        <Target size={64} className="mb-4 opacity-20" />
                        <p className="text-xl font-medium text-slate-400">Seleziona un atleta dal database</p>
                        <p className="text-sm mt-2">Usa la barra laterale per cercare e filtrare i risultati.</p>
                    </div>
                )}
            </main>
        </div>
    );
};