import React, { useState, useEffect } from 'react';
import { Target, Search, Lock, Users, RefreshCw, Trash2, Filter, ChevronLeft, LogOut, Loader2, Download, Upload, Link as LinkIcon } from 'lucide-react';
import { supabase, getEnvVar } from '../lib/supabase';
import { AssessmentRecord } from '../types';
import { ResultsTab } from '../components/ResultsTab';
import { IppsTab, TipiTab, MisTab, ErqTab, PpsTab, CfqTab, BnsssTab, SeqTab, MtsTab, CtTab } from '../components/Questionnaires';
import { PesdTab } from '../components/PesdTab';
import { LinkGenerator } from '../components/LinkGenerator';
import { DISCIPLINES } from '../constants';
import { useQuestionnaireState } from '../hooks/useQuestionnaireState';

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
    const {
        ippsData, tipiData, misData, erqData, ppsData, cfqData, bnsssData, seqData, mtsData, ctData, pesdData,
        setIppsData, setTipiData, setMisData, setErqData, setPpsData, setCfqData, setBnsssData, setSeqData, setMtsData, setCtData, setPesdData,
    } = useQuestionnaireState();

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
                    pesd: d.pesd || []
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
        setSelectedId(record.id);
        setCurrentProfile({
            name: record.name,
            discipline: record.discipline,
            yearsOfPractice: record.yearsOfPractice,
            email: record.email,
            phone: record.phone
        });
        setIppsData(record.ipps || []);
        setTipiData(record.tipi || []);
        setMisData(record.mis || []);
        setErqData(record.erq || []);
        setPpsData(record.pps || []);
        setCfqData(record.cfq || []);
        setBnsssData(record.bnsss || []);
        setSeqData(record.seq || []);
        setMtsData(record.mts || []);
        setCtData(record.ct || []);
        setPesdData(record.pesd || []);
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

    const TABS = [
        { id: 10, label: 'Risultati & Analisi', show: true },
        { id: 0, label: 'IPPS-24', show: ippsData && ippsData.length > 0 },
        { id: 1, label: 'TIPI', show: tipiData && tipiData.length > 0 },
        { id: 2, label: 'MIS', show: misData && misData.length > 0 },
        { id: 3, label: 'ERQ', show: erqData && erqData.length > 0 },
        { id: 4, label: 'PPS-S', show: ppsData && ppsData.length > 0 },
        { id: 5, label: 'CFQ', show: cfqData && cfqData.length > 0 },
        { id: 6, label: 'BNSSS', show: bnsssData && bnsssData.length > 0 },
        { id: 7, label: 'SEQ', show: seqData && seqData.length > 0 },
        { id: 8, label: 'MTS', show: mtsData && mtsData.length > 0 },
        { id: 9, label: 'CT', show: ctData && ctData.length > 0 },
        { id: 11, label: 'PESD', show: pesdData && pesdData.length > 0 }
    ].filter(t => t.show);

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
                                                rec.ipps && 'IPPS',
                                                rec.tipi && 'TIPI',
                                                rec.mis && 'MIS',
                                                rec.erq && 'ERQ',
                                                rec.pps && 'PPS',
                                                rec.cfq && 'CFQ',
                                                rec.bnsss && 'BNSSS',
                                                rec.seq && 'SEQ',
                                                rec.mts && 'MTS',
                                                rec.ct && 'CT',
                                                rec.pesd && 'PESD'
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

                         {/* Tabs Navigation */}
                        <div className="bg-slate-900 border-b border-slate-800 p-4">
                             <div className="flex flex-wrap gap-2 text-sm font-medium">
                                {TABS.map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)} 
                                        className={`py-2 px-4 rounded-lg border-2 transition-colors ${activeTab === tab.id ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                             </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            <div className="max-w-6xl mx-auto">
                                {activeTab === 10 && <ResultsTab profile={currentProfile} data={{ ipps: ippsData, tipi: tipiData, mis: misData, erq: erqData, pps: ppsData, cfq: cfqData, bnsss: bnsssData, seq: seqData, mts: mtsData, ct: ctData, pesd: pesdData }} />}
                                {/* Read-only views of inputs */}
                                <div className={activeTab === 0 ? 'block pointer-events-none opacity-80' : 'hidden'}><IppsTab data={ippsData} onChange={()=>{}} /></div>
                                <div className={activeTab === 1 ? 'block pointer-events-none opacity-80' : 'hidden'}><TipiTab data={tipiData} onChange={()=>{}} /></div>
                                <div className={activeTab === 2 ? 'block pointer-events-none opacity-80' : 'hidden'}><MisTab data={misData} onChange={()=>{}} /></div>
                                <div className={activeTab === 3 ? 'block pointer-events-none opacity-80' : 'hidden'}><ErqTab data={erqData} onChange={()=>{}} /></div>
                                <div className={activeTab === 4 ? 'block pointer-events-none opacity-80' : 'hidden'}><PpsTab data={ppsData} onChange={()=>{}} /></div>
                                <div className={activeTab === 5 ? 'block pointer-events-none opacity-80' : 'hidden'}><CfqTab data={cfqData} onChange={()=>{}} /></div>
                                <div className={activeTab === 6 ? 'block pointer-events-none opacity-80' : 'hidden'}><BnsssTab data={bnsssData} onChange={()=>{}} /></div>
                                <div className={activeTab === 7 ? 'block pointer-events-none opacity-80' : 'hidden'}><SeqTab data={seqData} onChange={()=>{}} /></div>
                                <div className={activeTab === 8 ? 'block pointer-events-none opacity-80' : 'hidden'}><MtsTab data={mtsData} onChange={()=>{}} /></div>
                                <div className={activeTab === 9 ? 'block pointer-events-none opacity-80' : 'hidden'}><CtTab data={ctData} onChange={()=>{}} /></div>
                                <div className={activeTab === 11 ? 'block pointer-events-none opacity-80' : 'hidden'}><PesdTab data={pesdData} onChange={()=>{}} /></div>
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