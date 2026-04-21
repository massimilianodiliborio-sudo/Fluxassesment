import React, { useState } from 'react';
import { Target, Brain, Swords, Activity, Send, CheckCircle, AlertCircle, Lock, Info, ChevronDown, ChevronUp, User, Mail, Phone, Trophy, Calendar } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { IppsTab, TipiTab, MisTab, ErqTab, PpsTab, CfqTab, BnsssTab, SeqTab, MtsTab, CtTab } from '../components/Questionnaires';
import { PesdTab } from '../components/PesdTab';
import { DISCIPLINES } from '../constants';
import { AthleteProfile } from '../types';
import { supabase } from '../lib/supabase';
import { useQuestionnaireState } from '../hooks/useQuestionnaireState';

export const AthletePage = () => {
  const [profile, setProfile] = useState<AthleteProfile>({
    name: '',
    discipline: 'Carabina',
    yearsOfPractice: 0,
    email: '',
    phone: ''
  });

  const {
    ippsData, tipiData, misData, erqData, ppsData, cfqData, bnsssData, seqData, mtsData, ctData, pesdData,
    setIppsData, setTipiData, setMisData, setErqData, setPpsData, setCfqData, setBnsssData, setSeqData, setMtsData, setCtData, setPesdData,
  } = useQuestionnaireState();

  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // State per gestire l'apertura del pannello dati su mobile
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(true);

  const handleProfileChange = (field: keyof AthleteProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const updateQuestionnaire = (setter: React.Dispatch<React.SetStateAction<number[]>>, index: number, val: number) => {
    setter(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // URL Parameter filtering
  const searchParams = new window.URLSearchParams(window.location.hash.split('?')[1] || '');
  const requestedTests = searchParams.get('q')?.split(',') || [];
  const filtersActive = requestedTests.length > 0 && requestedTests[0] !== 'none';

  const isTestRequested = (testKey: string) => !filtersActive || requestedTests.includes(testKey);

  const tabs = [
    { id: 0, testKey: 'IPPS', label: 'IPPS-24', icon: Target, component: <IppsTab data={ippsData} onChange={(i, v) => updateQuestionnaire(setIppsData, i, v)} /> },
    { id: 1, testKey: 'TIPI', label: 'TIPI', icon: Brain, component: <TipiTab data={tipiData} onChange={(i, v) => updateQuestionnaire(setTipiData, i, v)} /> },
    { id: 2, testKey: 'MIS', label: 'MIS', icon: Activity, component: <MisTab data={misData} onChange={(i, v) => updateQuestionnaire(setMisData, i, v)} /> },
    { id: 3, testKey: 'ERQ', label: 'ERQ', icon: Brain, component: <ErqTab data={erqData} onChange={(i, v) => updateQuestionnaire(setErqData, i, v)} /> },
    { id: 4, testKey: 'PPS', label: 'PPS-S', icon: Target, component: <PpsTab data={ppsData} onChange={(i, v) => updateQuestionnaire(setPpsData, i, v)} /> },
    { id: 5, testKey: 'CFQ', label: 'CFQ', icon: Swords, component: <CfqTab data={cfqData} onChange={(i, v) => updateQuestionnaire(setCfqData, i, v)} /> },
    { id: 6, testKey: 'BNSSS', label: 'BNSSS', icon: User, component: <BnsssTab data={bnsssData} onChange={(i, v) => updateQuestionnaire(setBnsssData, i, v)} /> },
    { id: 7, testKey: 'SEQ', label: 'SEQ', icon: Brain, component: <SeqTab data={seqData} onChange={(i, v) => updateQuestionnaire(setSeqData, i, v)} /> },
    { id: 8, testKey: 'MTS', label: 'MTS', icon: Brain, component: <MtsTab data={mtsData} onChange={(i, v) => updateQuestionnaire(setMtsData, i, v)} /> },
    { id: 9, testKey: 'CT', label: 'CT', icon: Target, component: <CtTab data={ctData} onChange={(i, v) => updateQuestionnaire(setCtData, i, v)} /> },
    { id: 10, testKey: 'PESD', label: 'PESD', icon: Activity, component: <PesdTab data={pesdData} onChange={(i, v) => updateQuestionnaire(setPesdData, i, v)} /> }
  ].filter(tab => isTestRequested(tab.testKey));

  React.useEffect(() => {
    // If active tab id doesn't exist in filtered tabs, set to the first available tab
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
        setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const validate = () => {
    if (!profile.name.trim()) return "Il campo 'Nome e Cognome' è obbligatorio.";
    if (!profile.email.trim() && !profile.phone.trim()) return "È necessario inserire almeno un contatto (Email o Telefono).";
    if (tabs.length === 0) return "Nessun questionario selezionato da compilare (parametro link non valido).";
    return null;
  };

  const handleSubmit = async () => {
    const errorValidation = validate();
    if (errorValidation) {
      setErrorMsg(errorValidation);
      if (window.innerWidth < 768) {
          setIsMobileProfileOpen(true);
          window.scrollTo(0, 0);
      }
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from('assessments').insert({
        athlete_name: profile.name,
        discipline: profile.discipline,
        years_of_practice: profile.yearsOfPractice,
        email: profile.email,
        phone: profile.phone,
        ipps: isTestRequested('IPPS') ? ippsData : null,
        tipi: isTestRequested('TIPI') ? tipiData : null,
        mis: isTestRequested('MIS') ? misData : null,
        erq: isTestRequested('ERQ') ? erqData : null,
        pps: isTestRequested('PPS') ? ppsData : null,
        cfq: isTestRequested('CFQ') ? cfqData : null,
        bnsss: isTestRequested('BNSSS') ? bnsssData : null,
        seq: isTestRequested('SEQ') ? seqData : null,
        mts: isTestRequested('MTS') ? mtsData : null,
        ct: isTestRequested('CT') ? ctData : null,
        pesd: isTestRequested('PESD') ? pesdData : null
      });

      if (error) {
          console.error("Supabase Error:", error);
          if (error.code === '42P01') {
              setErrorMsg("⚠️ CONFIGURAZIONE DATABASE MANCANTE: La tabella 'assessments' non esiste.");
          } else {
              setErrorMsg("Errore durante il salvataggio: " + error.message);
          }
          return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Unexpected Error:", err);
      setErrorMsg("Errore imprevisto di connessione.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-8 rounded-2xl shadow-2xl text-center">
            <div className="flex justify-center mb-6">
                <CheckCircle className="w-20 h-20 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)] rounded-full" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Grazie {profile.name}!</h1>
            <p className="text-slate-400 mb-8">
                I tuoi dati sono stati inviati correttamente al Dr. Massimiliano Di Liborio.
            </p>
            <div className="flex flex-col gap-4">
                <button 
                    onClick={() => window.location.reload()} 
                    className="text-sm text-slate-500 hover:text-slate-300 underline transition-colors"
                >
                    Compila un altro questionario
                </button>
                <a href="#/dashboard" className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 font-bold transition-all border border-slate-700">
                    <Lock size={16} /> Vai alla Dashboard
                </a>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
        {/* Sidebar always visible on desktop */}
        <div className="hidden md:block">
            <Sidebar profile={profile} onChange={handleProfileChange} />
        </div>

        {/* Mobile Header & Profile Management */}
        <div className="md:hidden flex flex-col bg-slate-900 border-b border-slate-800 z-30 shadow-lg relative">
             <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2 font-black text-white">
                    <span className="bg-yellow-400 p-1 rounded text-slate-900"><Target size={16} fill="currentColor" /></span>
                    FLUX Assessment
                </div>
                <button 
                    onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
                    className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${isMobileProfileOpen ? 'bg-cyan-900/50 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}
                >
                    <User size={14} /> Dati Atleta {isMobileProfileOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {/* Collapsible Mobile Profile Form */}
            {isMobileProfileOpen && (
                <div className="px-4 pb-6 space-y-4 bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Nome e Cognome *</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none"
                                value={profile.name}
                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                placeholder="Es. Mario Rossi"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block flex items-center gap-1"><Trophy size={10} /> Disciplina</label>
                                <input 
                                    type="text"
                                    list="mobile-disciplines-list"
                                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none placeholder-slate-600 appearance-none"
                                    value={profile.discipline}
                                    onChange={(e) => handleProfileChange('discipline', e.target.value)}
                                    placeholder="Seleziona o scrivi..."
                                />
                                <datalist id="mobile-disciplines-list">
                                    {DISCIPLINES.filter(d => d !== "Altro").map(d => (
                                        <option key={d} value={d} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block flex items-center gap-1"><Calendar size={10} /> Anni Pratica</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none"
                                    value={profile.yearsOfPractice}
                                    onChange={(e) => handleProfileChange('yearsOfPractice', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-800">
                            <p className="text-[10px] text-slate-400 italic">Compila almeno un contatto *</p>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block flex items-center gap-1"><Mail size={10} /> Email</label>
                                <input 
                                    type="email" 
                                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none placeholder-slate-600"
                                    value={profile.email}
                                    onChange={(e) => handleProfileChange('email', e.target.value)}
                                    placeholder="email@esempio.com"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block flex items-center gap-1"><Phone size={10} /> Telefono</label>
                                <input 
                                    type="tel" 
                                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none placeholder-slate-600"
                                    value={profile.phone}
                                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                                    placeholder="+39 ..."
                                />
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setIsMobileProfileOpen(false)}
                            className="w-full py-2 bg-slate-800 text-slate-300 text-xs font-bold uppercase rounded-lg hover:bg-slate-700 mt-2"
                        >
                            Chiudi e compila questionari
                        </button>
                    </div>
                </div>
            )}
        </div>

        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
            
            {/* Validation Banner */}
            {errorMsg && (
                <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 px-6 py-3 flex items-center gap-3 backdrop-blur-sm animate-pulse">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="font-bold text-xs sm:text-sm">{errorMsg}</span>
                </div>
            )}

            {/* General Instructions Banner */}
            <div className="bg-yellow-500/5 border-b border-yellow-500/10 p-4 flex gap-3 items-start backdrop-blur-md">
                <div className="bg-yellow-500/10 p-2 rounded-full text-yellow-500 mt-0.5 shrink-0">
                    <Info size={16} />
                </div>
                <div className="text-xs sm:text-sm text-slate-300">
                    <p className="font-bold text-yellow-500 mb-1">Istruzioni importanti:</p>
                    <p className="leading-relaxed">
                        Qui in basso sono presenti <strong className="text-white">{tabs.length} questionar{tabs.length === 1 ? 'io' : 'i'} da compilare</strong> (scorri le schede o usa i pulsanti). 
                        Completal{tabs.length === 1 ? 'o' : 'i'} e poi premi il tasto verde <strong className="text-green-400">"Invia Assessment"</strong> in basso.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 shadow-lg">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all font-bold text-xs sm:text-sm tracking-wide border-2
                        ${activeTab === tab.id 
                            ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                            : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-32 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="max-w-4xl mx-auto">
                    {tabs.find(t => t.id === activeTab)?.component || (
                        <div className="text-center text-slate-500 py-10">Nessun questionario selezionato</div>
                    )}
                </div>
            </div>

            {/* Bottom Floating Submit Bar */}
            <div className="absolute bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 p-4 shadow-[0_-5px_30px_rgba(0,0,0,0.6)] z-40 flex justify-between items-center">
                 <div className="flex flex-col">
                    <div className="text-xs text-slate-500 hidden md:block font-medium">
                        Completa tutte le sezioni prima di inviare.
                    </div>
                    {/* Link "nascosto" per accesso rapido in preview */}
                    <a href="#/dashboard" className="text-xs text-slate-700 hover:text-cyan-500 flex items-center gap-1 mt-1 font-medium transition-colors cursor-pointer">
                        <Lock size={12} /> <span className="hidden sm:inline">Area Psicologo</span>
                    </a>
                 </div>
                 <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-500 text-slate-950 px-6 py-3 rounded-lg font-black shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:from-green-500 hover:to-green-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
                 >
                    {isSubmitting ? 'Invio...' : (
                        <>
                            <Send size={18} strokeWidth={3} /> <span className="uppercase tracking-wider">Invia Assessment</span>
                        </>
                    )}
                 </button>
            </div>
        </main>
    </div>
  );
};