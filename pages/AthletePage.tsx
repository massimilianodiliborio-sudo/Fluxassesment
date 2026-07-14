import React, { useState } from 'react';
import { Target, Brain, Swords, Activity, Send, CheckCircle, AlertCircle, Lock, Info, ChevronDown, ChevronUp, User, Mail, Phone, Trophy, Calendar } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { IppsTab, TipiTab, MisTab, ErqTab, PpsTab, CfqTab, BnsssTab, SeqTab, MtsTab, CtTab, TeiqueTab, MaiaTab, PassionTab } from '../components/Questionnaires';
import { PesdTab } from '../components/PesdTab';
import { 
    IPPS_ITEMS, TIPI_ITEMS, MIS_ITEMS, ERQ_ITEMS, PPS_ITEMS, CFQ_ITEMS, BNSSS_ITEMS, SEQ_ITEMS,
    MTS_ITEMS, CT_ITEMS, PESD_ITEMS, DISCIPLINES,
    TEIQUE_ITEMS, MAIA_ITEMS, PASSION_ITEMS 
} from '../constants';
import { AthleteProfile } from '../types';
import { supabase } from '../lib/supabase';

// Bozza salvata in localStorage: risposte + anagrafica, mai il consenso
// (va riespresso attivamente ad ogni invio, non ereditato da una bozza).
interface AthleteDraft {
  profile: AthleteProfile;
  ipps: (number | null)[];
  tipi: (number | null)[];
  mis: (number | null)[];
  erq: (number | null)[];
  pps: (number | null)[];
  cfq: (number | null)[];
  bnsss: (number | null)[];
  seq: (number | null)[];
  mts: (number | null)[];
  ct: (number | null)[];
  pesd: (number | null)[];
  teique: (number | null)[];
  maia: (number | null)[];
  passion: (number | null)[];
  savedAt: string;
}

const DRAFT_ITEM_LENGTHS: Record<string, number> = {
  ipps: IPPS_ITEMS.length, tipi: TIPI_ITEMS.length, mis: MIS_ITEMS.length, erq: ERQ_ITEMS.length,
  pps: PPS_ITEMS.length, cfq: CFQ_ITEMS.length, bnsss: BNSSS_ITEMS.length, seq: SEQ_ITEMS.length,
  mts: MTS_ITEMS.length, ct: CT_ITEMS.length, pesd: PESD_ITEMS.length, teique: TEIQUE_ITEMS.length,
  maia: MAIA_ITEMS.length, passion: PASSION_ITEMS.length,
};

const isValidAnswerArray = (val: unknown, expectedLen: number): val is (number | null)[] =>
  Array.isArray(val) && val.length === expectedLen && val.every(v => v === null || typeof v === 'number');

const isValidDraftProfile = (val: unknown): val is AthleteProfile => {
  if (!val || typeof val !== 'object') return false;
  const p = val as Record<string, unknown>;
  return typeof p.name === 'string' && typeof p.discipline === 'string' &&
    typeof p.yearsOfPractice === 'number' && typeof p.email === 'string' && typeof p.phone === 'string';
};

// Se la forma non è quella attesa (JSON corrotto, lunghezze diverse, ecc.)
// la bozza viene scartata in silenzio: non si tenta di ripararla.
const parseDraft = (raw: string): AthleteDraft | null => {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.savedAt !== 'string') return null;
    if (!isValidDraftProfile(parsed.profile)) return null;
    for (const key of Object.keys(DRAFT_ITEM_LENGTHS)) {
      if (!isValidAnswerArray(parsed[key], DRAFT_ITEM_LENGTHS[key])) return null;
    }
    return parsed as AthleteDraft;
  } catch {
    return null;
  }
};

export const AthletePage = () => {
  const [profile, setProfile] = useState<AthleteProfile>({
    name: '',
    discipline: 'Carabina',
    yearsOfPractice: 0,
    email: '',
    phone: ''
  });

  const [ippsData, setIppsData] = useState<(number | null)[]>(new Array(IPPS_ITEMS.length).fill(null));
  const [tipiData, setTipiData] = useState<(number | null)[]>(new Array(TIPI_ITEMS.length).fill(null));
  const [misData, setMisData] = useState<(number | null)[]>(new Array(MIS_ITEMS.length).fill(null));
  const [erqData, setErqData] = useState<(number | null)[]>(new Array(ERQ_ITEMS.length).fill(null));
  const [ppsData, setPpsData] = useState<(number | null)[]>(new Array(PPS_ITEMS.length).fill(null));
  const [cfqData, setCfqData] = useState<(number | null)[]>(new Array(CFQ_ITEMS.length).fill(null));
  const [bnsssData, setBnsssData] = useState<(number | null)[]>(new Array(BNSSS_ITEMS.length).fill(null));
  const [seqData, setSeqData] = useState<(number | null)[]>(new Array(SEQ_ITEMS.length).fill(null));
  const [mtsData, setMtsData] = useState<(number | null)[]>(new Array(MTS_ITEMS.length).fill(null));
  const [ctData, setCtData] = useState<(number | null)[]>(new Array(CT_ITEMS.length).fill(null));
  const [pesdData, setPesdData] = useState<(number | null)[]>(new Array(PESD_ITEMS.length).fill(null));
  const [teiqueData, setTeiqueData] = useState<(number | null)[]>(new Array(TEIQUE_ITEMS.length).fill(null));
  const [maiaData, setMaiaData] = useState<(number | null)[]>(new Array(MAIA_ITEMS.length).fill(null));
  const [passionData, setPassionData] = useState<(number | null)[]>(new Array(PASSION_ITEMS.length).fill(null));

  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // Bozza autosalvata: mostrata come banner finché l'atleta non decide se riprenderla
  const [pendingDraft, setPendingDraft] = useState<AthleteDraft | null>(null);
  // true dopo la prima modifica reale — evita scritture su localStorage a vuoto
  const hasInteractedRef = React.useRef(false);

  // State per gestire l'apertura del pannello dati su mobile — M6: chiuso di default
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  const handleProfileChange = (field: keyof AthleteProfile, value: string | number) => {
    hasInteractedRef.current = true;
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const updateQuestionnaire = (setter: React.Dispatch<React.SetStateAction<number[]>>, index: number, val: number) => {
    hasInteractedRef.current = true;
    setter(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // URL Parameter filtering — C1: filter out empty strings from malformed ?q= params
  const searchParams = new window.URLSearchParams(window.location.hash.split('?')[1] || '');
  const requestedTests = (searchParams.get('q')?.split(',') || []).filter(t => t.trim() !== '');
  const filtersActive = requestedTests.length > 0 && requestedTests[0] !== 'none';

  // Una bozza per link: la chiave incorpora il set di questionari richiesti da ?q=
  const draftKey = `flux_draft_${
    requestedTests.length > 0
      ? [...requestedTests].sort().join(',').replace(/[^a-zA-Z0-9_,]/g, '_')
      : 'full'
  }`;

  const isTestRequested = (testKey: string) => !filtersActive || requestedTests.includes(testKey);

  // M5: map each questionnaire key to its data array to compute completion
  const tabDataMap: Record<string, (number | null)[]> = {
    IPPS: ippsData, TIPI: tipiData, MIS: misData, ERQ: erqData,
    PPS: ppsData, CFQ: cfqData, BNSSS: bnsssData, SEQ: seqData,
    MTS: mtsData, CT: ctData, PESD: pesdData,
    TEIQUE: teiqueData, MAIA: maiaData, PASSION: passionData,
  };
  const isTabComplete = (testKey: string) =>
    (tabDataMap[testKey] ?? []).every(v => v !== null);

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
    { id: 10, testKey: 'PESD', label: 'PESD', icon: Activity, component: <PesdTab data={pesdData} onChange={(i, v) => updateQuestionnaire(setPesdData, i, v)} /> },
    { id: 11, testKey: 'TEIQUE', label: 'TEIQue-SF', icon: Brain, component: <TeiqueTab data={teiqueData} onChange={(i, v) => updateQuestionnaire(setTeiqueData, i, v)} /> },
    { id: 12, testKey: 'MAIA', label: 'MAIA', icon: Activity, component: <MaiaTab data={maiaData} onChange={(i, v) => updateQuestionnaire(setMaiaData, i, v)} /> },
    { id: 13, testKey: 'PASSION', label: 'Passion Scale', icon: Target, component: <PassionTab data={passionData} onChange={(i, v) => updateQuestionnaire(setPassionData, i, v)} /> }
  ].filter(tab => isTestRequested(tab.testKey));

  React.useEffect(() => {
    // If active tab id doesn't exist in filtered tabs, set to the first available tab
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
        setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  // Al montaggio: cerca una bozza per questo link. Non la applica mai in automatico
  // (lo stesso tablet può passare da un atleta all'altro) — la propone via banner.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = parseDraft(raw);
        if (draft) setPendingDraft(draft);
      }
    } catch {
      // localStorage non disponibile (es. Safari privato): nessuna bozza da proporre
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosalvataggio con debounce ~500ms. Non scrive prima della prima interazione
  // reale, e non scrive finché una bozza trovata al mount non è stata risolta
  // (altrimenti la si sovrascriverebbe con lo state vuoto prima della scelta dell'atleta).
  React.useEffect(() => {
    if (!hasInteractedRef.current || pendingDraft) return;

    const timer = setTimeout(() => {
      try {
        const draft: AthleteDraft = {
          profile,
          ipps: ippsData, tipi: tipiData, mis: misData, erq: erqData,
          pps: ppsData, cfq: cfqData, bnsss: bnsssData, seq: seqData,
          mts: mtsData, ct: ctData, pesd: pesdData, teique: teiqueData,
          maia: maiaData, passion: passionData,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch {
        // localStorage non disponibile (es. Safari privato): niente autosave, niente crash
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [profile, ippsData, tipiData, misData, erqData, ppsData, cfqData, bnsssData, seqData,
      mtsData, ctData, pesdData, teiqueData, maiaData, passionData, pendingDraft, draftKey]);

  const resumeDraft = () => {
    if (!pendingDraft) return;
    setProfile(pendingDraft.profile);
    setIppsData(pendingDraft.ipps);
    setTipiData(pendingDraft.tipi);
    setMisData(pendingDraft.mis);
    setErqData(pendingDraft.erq);
    setPpsData(pendingDraft.pps);
    setCfqData(pendingDraft.cfq);
    setBnsssData(pendingDraft.bnsss);
    setSeqData(pendingDraft.seq);
    setMtsData(pendingDraft.mts);
    setCtData(pendingDraft.ct);
    setPesdData(pendingDraft.pesd);
    setTeiqueData(pendingDraft.teique);
    setMaiaData(pendingDraft.maia);
    setPassionData(pendingDraft.passion);
    hasInteractedRef.current = true;
    setPendingDraft(null);
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // localStorage non disponibile: nulla da rimuovere
    }
    setPendingDraft(null);
  };

  const validate = () => {
    if (!profile.name.trim()) return "Il campo 'Nome e Cognome' è obbligatorio.";
    if (!profile.email.trim() && !profile.phone.trim()) return "È necessario inserire almeno un contatto (Email o Telefono).";
    if (tabs.length === 0) return "Nessun questionario selezionato da compilare (parametro link non valido).";

    // C2: verifica che tutti gli item dei questionari attivi siano stati risposti
    const questionnaires = [
      { key: 'IPPS',    data: ippsData,    label: 'IPPS-24' },
      { key: 'TIPI',    data: tipiData,    label: 'TIPI' },
      { key: 'MIS',     data: misData,     label: 'MIS' },
      { key: 'ERQ',     data: erqData,     label: 'ERQ' },
      { key: 'PPS',     data: ppsData,     label: 'PPS-S' },
      { key: 'CFQ',     data: cfqData,     label: 'CFQ' },
      { key: 'BNSSS',   data: bnsssData,   label: 'BNSSS' },
      { key: 'SEQ',     data: seqData,     label: 'SEQ' },
      { key: 'MTS',     data: mtsData,     label: 'MTS' },
      { key: 'CT',      data: ctData,      label: 'Sfida & Minaccia' },
      { key: 'PESD',    data: pesdData,    label: 'PESD-Sport' },
      { key: 'TEIQUE',  data: teiqueData,  label: 'TEIQue-SF' },
      { key: 'MAIA',    data: maiaData,    label: 'MAIA' },
      { key: 'PASSION', data: passionData, label: 'Passion Scale' },
    ];
    for (const q of questionnaires) {
      if (isTestRequested(q.key) && q.data.some(v => v === null)) {
        return `Completa tutti gli item del questionario ${q.label} prima di inviare.`;
      }
    }

    if (!consentGiven) return "Devi accettare l'informativa sulla privacy per poter inviare l'assessment.";

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
        ipps: isTestRequested('IPPS') ? ippsData as number[] : null,
        tipi: isTestRequested('TIPI') ? tipiData as number[] : null,
        mis: isTestRequested('MIS') ? misData as number[] : null,
        erq: isTestRequested('ERQ') ? erqData as number[] : null,
        pps: isTestRequested('PPS') ? ppsData as number[] : null,
        cfq: isTestRequested('CFQ') ? cfqData as number[] : null,
        bnsss: isTestRequested('BNSSS') ? bnsssData as number[] : null,
        seq: isTestRequested('SEQ') ? seqData as number[] : null,
        mts: isTestRequested('MTS') ? mtsData as number[] : null,
        ct: isTestRequested('CT') ? ctData as number[] : null,
        pesd: isTestRequested('PESD') ? pesdData as number[] : null,
        teique: isTestRequested('TEIQUE') ? teiqueData as number[] : null,
        maia: isTestRequested('MAIA') ? maiaData as number[] : null,
        passion: isTestRequested('PASSION') ? passionData as number[] : null,
        consent_given: consentGiven,
        consent_at: new Date().toISOString()
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

      try {
        localStorage.removeItem(draftKey);
      } catch {
        // localStorage non disponibile: nessun problema, il submit è comunque riuscito
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
                    className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${
                        isMobileProfileOpen
                            ? 'bg-cyan-900/50 text-cyan-400'
                            : profile.name.trim()
                                ? 'bg-green-900/40 text-green-400'
                                : 'bg-orange-900/40 text-orange-400 animate-pulse'
                    }`}
                >
                    <User size={14} />
                    {profile.name.trim() ? profile.name.split(' ')[0] : 'Inserisci dati'}
                    {isMobileProfileOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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

            {/* Banner bozza trovata — richiede una scelta esplicita, mai ripristino silenzioso */}
            {pendingDraft && (
                <div className="bg-cyan-500/10 border-b border-cyan-500/20 text-cyan-100 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 backdrop-blur-sm">
                    <div className="flex items-center gap-3 flex-1">
                        <Info size={20} className="shrink-0 text-cyan-400" />
                        <span className="text-xs sm:text-sm font-medium">
                            Trovata una compilazione non inviata del {new Date(pendingDraft.savedAt).toLocaleString()}. Vuoi riprenderla?
                        </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={resumeDraft}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded-lg transition-colors"
                        >
                            Riprendi
                        </button>
                        <button
                            onClick={discardDraft}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors border border-slate-700"
                        >
                            Ricomincia da capo
                        </button>
                    </div>
                </div>
            )}

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

            {/* M4: overflow-x-auto + flex-nowrap for horizontal scroll on mobile */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 shadow-lg">
                <div className="flex flex-nowrap overflow-x-auto gap-2 scrollbar-none pb-1">
                    {tabs.map((tab) => {
                        const complete = isTabComplete(tab.testKey);
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all font-bold text-xs sm:text-sm tracking-wide border-2 shrink-0
                                ${isActive
                                    ? 'border-cyan-500 bg-cyan-900/20 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                                    : complete
                                        ? 'border-green-700/40 text-slate-400 hover:text-white hover:bg-slate-800'
                                        : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                            >
                                {/* M5: green checkmark when all items answered */}
                                {complete
                                    ? <span className="text-green-400 text-xs">✓</span>
                                    : <tab.icon size={14} />}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-32 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="max-w-4xl mx-auto">
                    {tabs.find(t => t.id === activeTab)?.component || (
                        <div className="text-center text-slate-500 py-10">Nessun questionario selezionato</div>
                    )}

                    {/* Informativa privacy e consenso GDPR — obbligatoria prima dell'invio */}
                    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Informativa sulla Privacy</h3>
                        <div className="max-h-64 overflow-y-auto bg-slate-950/50 border border-slate-800 rounded-lg p-4 text-xs text-slate-400 leading-relaxed whitespace-pre-line scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
{`INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI
(artt. 13 e 9 del Regolamento UE 2016/679 – GDPR)

TITOLARE DEL TRATTAMENTO
Dr. Massimiliano Di Liborio, Psicologo–Psicoterapeuta, iscritto all'Ordine degli
Psicologi della Regione Abruzzo con n. 2401.
Centro Medico Abaton, Via Caravaggio 127, Pescara.
Contatto per l'esercizio dei diritti: massimiliano.diliborio@gmail.com

DATI RACCOLTI
Dati identificativi e di contatto (nome e cognome, email, telefono), dati relativi
all'attività sportiva (disciplina, anni di pratica) e le risposte ai questionari
psicologici somministrati. Le risposte ai questionari costituiscono dati relativi
alla salute, appartenenti alle categorie particolari di cui all'art. 9 GDPR.

FINALITÀ
I dati sono trattati esclusivamente per la valutazione e il sostegno psicologico
in ambito sportivo, nell'ambito del rapporto professionale tra lo psicologo e
l'atleta, e per l'elaborazione dei profili psicometrici funzionali a tale attività.

BASE GIURIDICA
Il trattamento dei dati relativi alla salute avviene sulla base del suo consenso
esplicito, ai sensi dell'art. 9, par. 2, lett. a) del GDPR. Il conferimento dei
dati è facoltativo, ma senza di essi non è possibile procedere alla valutazione
psicologica.

MODALITÀ E LUOGO DEL TRATTAMENTO
I dati sono raccolti tramite questa applicazione web e conservati su infrastruttura
cloud fornita da Supabase e Vercel, che agiscono in qualità di responsabili del
trattamento. Il trattamento può comportare il trasferimento dei dati verso Paesi
terzi, effettuato sulla base delle garanzie previste dal Capo V del GDPR.
I dati sono accessibili al solo Titolare, tenuto al segreto professionale ai sensi
dell'art. 11 del Codice Deontologico degli Psicologi Italiani.

CONSERVAZIONE
I dati sono conservati per il tempo necessario alle finalità indicate e comunque
per 10 anni dalla conclusione del rapporto professionale, in conformità agli
obblighi di conservazione della documentazione professionale dello psicologo.
Decorso tale termine i dati sono cancellati.

DIRITTI DELL'INTERESSATO
Lei ha diritto di chiedere in ogni momento l'accesso ai suoi dati, la loro rettifica
o cancellazione, la limitazione del trattamento, la portabilità dei dati, e di
opporsi al trattamento. Ha inoltre diritto di revocare il consenso in qualsiasi
momento, senza che ciò pregiudichi la liceità del trattamento effettuato prima
della revoca. Per esercitare tali diritti può scrivere a
massimiliano.diliborio@gmail.com.
Ha altresì diritto di proporre reclamo al Garante per la protezione dei dati
personali (www.garanteprivacy.it).

MINORI
Se l'interessato ha meno di 18 anni, il consenso deve essere prestato da chi esercita
la responsabilità genitoriale.`}
                        </div>
                        <label className="flex items-start gap-3 pt-2 border-t border-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={consentGiven}
                                onChange={(e) => { setConsentGiven(e.target.checked); if (errorMsg) setErrorMsg(null); }}
                                className="mt-1 w-4 h-4 accent-cyan-500 shrink-0"
                            />
                            <span className="text-xs text-slate-300">
                                Dichiaro di aver letto l'informativa e presto il mio consenso esplicito al trattamento dei miei dati personali, inclusi i dati relativi alla salute, per le finalità sopra indicate. *
                            </span>
                        </label>
                    </div>
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