import React, { useState } from 'react';
import { Target, Brain, Swords, Activity, Send, CheckCircle, AlertCircle, Lock, Info, ChevronLeft, ChevronRight, User, Mail, Phone, Trophy, Calendar } from 'lucide-react';
import { IppsTab, TipiTab, MisTab, ErqTab, PpsTab, CfqTab, BnsssTab, SeqTab, MtsTab, CtTab, TeiqueTab, MaiaTab, PassionTab } from '../components/Questionnaires';
import { PesdTab } from '../components/PesdTab';
import {
    IPPS_ITEMS, TIPI_ITEMS, MIS_ITEMS, ERQ_ITEMS, PPS_ITEMS, CFQ_ITEMS, BNSSS_ITEMS, SEQ_ITEMS,
    MTS_ITEMS, CT_ITEMS, PESD_ITEMS, DISCIPLINES,
    TEIQUE_ITEMS, MAIA_ITEMS, PASSION_ITEMS
} from '../constants';
import { AthleteProfile } from '../types';
import { supabase } from '../lib/supabase';

// Bozza salvata in localStorage: risposte + anagrafica + consenso + step corrente.
interface AthleteDraft {
  profile: AthleteProfile;
  consentGiven: boolean;
  step: 1 | 2 | 3;
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

// Se la forma non è quella attesa (JSON corrotto, lunghezze diverse, bozza salvata
// con la struttura a pagina unica precedente, ecc.) la bozza viene scartata in
// silenzio: non si tenta di ripararla.
const parseDraft = (raw: string): AthleteDraft | null => {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.savedAt !== 'string') return null;
    if (typeof parsed.consentGiven !== 'boolean') return null;
    if (parsed.step !== 1 && parsed.step !== 2 && parsed.step !== 3) return null;
    if (!isValidDraftProfile(parsed.profile)) return null;
    for (const key of Object.keys(DRAFT_ITEM_LENGTHS)) {
      if (!isValidAnswerArray(parsed[key], DRAFT_ITEM_LENGTHS[key])) return null;
    }
    return parsed as AthleteDraft;
  } catch {
    return null;
  }
};

const STEP_LABELS = [
  { id: 1 as const, label: 'Benvenuto' },
  { id: 2 as const, label: 'Anagrafica' },
  { id: 3 as const, label: 'Questionari' },
];

const StepIndicator: React.FC<{ current: 1 | 2 | 3 }> = ({ current }) => (
  <div className="flex items-center gap-2">
    {STEP_LABELS.map((s, i) => (
      <React.Fragment key={s.id}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
            current === s.id
              ? 'border-cyan-500 bg-cyan-900/40 text-cyan-400'
              : current > s.id
                ? 'border-green-600 bg-green-900/30 text-green-400'
                : 'border-slate-700 text-slate-600'
          }`}>
            {current > s.id ? '✓' : s.id}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wide hidden sm:inline ${
            current === s.id ? 'text-cyan-400' : current > s.id ? 'text-green-400' : 'text-slate-600'
          }`}>
            {s.label}
          </span>
        </div>
        {i < STEP_LABELS.length - 1 && (
          <div className={`flex-1 h-px ${current > s.id ? 'bg-green-700' : 'bg-slate-800'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

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

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // Bozza autosalvata: mostrata come banner (solo allo step 1) finché l'atleta
  // non decide se riprenderla.
  const [pendingDraft, setPendingDraft] = useState<AthleteDraft | null>(null);
  // true dopo la prima interazione reale — evita scritture su localStorage a vuoto
  const hasInteractedRef = React.useRef(false);

  // Campi anagrafici "toccati": mostra l'errore inline solo dopo che l'atleta
  // è passato dal campo, non appena entra nello step 2.
  const [step2Touched, setStep2Touched] = useState<{ name?: boolean; contact?: boolean }>({});

  const handleProfileChange = (field: keyof AthleteProfile, value: string | number) => {
    hasInteractedRef.current = true;
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleConsentChange = (checked: boolean) => {
    hasInteractedRef.current = true;
    setConsentGiven(checked);
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
  // (lo stesso tablet può passare da un atleta all'altro) — la propone via banner
  // allo step 1, prima di tutto il resto.
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
          consentGiven,
          step,
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
  }, [profile, consentGiven, step, ippsData, tipiData, misData, erqData, ppsData, cfqData, bnsssData, seqData,
      mtsData, ctData, pesdData, teiqueData, maiaData, passionData, pendingDraft, draftKey]);

  const resumeDraft = () => {
    if (!pendingDraft) return;
    setProfile(pendingDraft.profile);
    setConsentGiven(pendingDraft.consentGiven);
    setStep(pendingDraft.step);
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
    setStep(1);
    setPendingDraft(null);
  };

  // Validazione step 2 (anagrafica), mostrata inline sul campo.
  const step2Errors = {
    name: profile.name.trim() ? undefined : "Il campo è obbligatorio.",
    contact: (profile.email.trim() || profile.phone.trim()) ? undefined : "Inserisci almeno un contatto (email o telefono)."
  };
  const isStep2Valid = !step2Errors.name && !step2Errors.contact;

  // Validazione finale (step 3): anagrafica e consenso sono già stati validati
  // agli step precedenti, qui si controlla solo che tutti gli item siano risposti.
  const validate = () => {
    if (tabs.length === 0) return "Nessun questionario selezionato da compilare (parametro link non valido).";

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

    return null;
  };

  const handleSubmit = async () => {
    const errorValidation = validate();
    if (errorValidation) {
      setErrorMsg(errorValidation);
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

  // Item risposti / totali sui questionari richiesti — barra di progresso step 3
  const totalItems = tabs.reduce((sum, t) => sum + (tabDataMap[t.testKey]?.length ?? 0), 0);
  const answeredItems = tabs.reduce((sum, t) => sum + (tabDataMap[t.testKey]?.filter(v => v !== null).length ?? 0), 0);
  const progressPct = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
        {/* Header: logo + indicatore di step, uguale su mobile e desktop */}
        <header className="shrink-0 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4">
            <div className="flex flex-col mb-3">
                {/* Pulsazione lenta e sobria (solo opacità, ~3s, ease-in-out):
                    motion-safe: la disattiva del tutto se l'utente ha
                    richiesto prefers-reduced-motion, senza bisogno di
                    gestirlo a mano. */}
                <div
                    className="flex items-center gap-2 font-black text-white motion-safe:animate-pulse"
                    style={{ animationDuration: '3s' }}
                >
                    <span className="bg-yellow-400 p-1 rounded text-slate-900"><Target size={16} fill="currentColor" /></span>
                    FLUX Assessment
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">
                    Creato da Dr. Massimiliano Di Liborio e Prof. Claudio Robazza
                </span>
            </div>
            <StepIndicator current={step} />
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">

            {/* STEP 1 — Benvenuto, istruzioni, informativa, consenso */}
            {step === 1 && (
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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

                    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
                        <div>
                            <h1 className="text-2xl font-black text-white mb-1">Benvenuto/a</h1>
                            <p className="text-slate-400 text-sm">Prima di iniziare, leggi come funziona l'assessment.</p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                            <h2 className="text-base font-bold text-white">Come funziona</h2>
                            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                                <p>Ti verranno proposti alcuni questionari sul tuo modo di vivere l'allenamento e la gara.</p>
                                <p>Non ci sono risposte giuste o sbagliate. Non è un esame e non è una valutazione del tuo valore come atleta: serve a me per capire come lavori, così da poterti essere utile.</p>
                                <p>Rispondi di getto, con la prima cosa che ti viene. Le risposte troppo ragionate sono di solito meno accurate di quelle immediate.</p>
                                <p>Puoi interrompere e riprendere più tardi: le risposte restano salvate su questo dispositivo finché non invii.</p>
                                <p>Le tue risposte le vedo solo io.</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-3">
                                {tabs.length} questionar{tabs.length === 1 ? 'io' : 'i'} da compilare
                            </h2>
                            <ul className="space-y-2">
                                {tabs.map(tab => (
                                    <li key={tab.id} className="flex items-center justify-between text-sm text-slate-300 border-b border-slate-800/60 pb-2 last:border-0 last:pb-0">
                                        <span className="flex items-center gap-2"><tab.icon size={14} className="text-cyan-400 shrink-0" /> {tab.label}</span>
                                        <span className="text-xs text-slate-500 font-mono shrink-0">{tabDataMap[tab.testKey]?.length ?? 0} item</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Informativa privacy e consenso GDPR — obbligatoria prima di iniziare */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Informativa sulla Privacy</h3>
                            <div className="max-h-64 overflow-y-auto overscroll-contain bg-slate-950/50 border border-slate-800 rounded-lg p-4 text-xs text-slate-400 leading-relaxed whitespace-pre-line scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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
                                    onChange={(e) => handleConsentChange(e.target.checked)}
                                    className="mt-1 w-4 h-4 accent-cyan-500 shrink-0"
                                />
                                <span className="text-xs text-slate-300">
                                    Dichiaro di aver letto l'informativa e presto il mio consenso esplicito al trattamento dei miei dati personali, inclusi i dati relativi alla salute, per le finalità sopra indicate. *
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2 — Dati anagrafici */}
            {step === 2 && (
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <div className="max-w-xl mx-auto space-y-5">
                        <div>
                            <h1 className="text-2xl font-black text-white mb-1">I tuoi dati</h1>
                            <p className="text-slate-400 text-sm">Servono per associare le risposte a te. Sono visibili solo al Dr. Di Liborio.</p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Nome e Cognome *</label>
                                <input
                                    type="text"
                                    className={`w-full p-2.5 bg-slate-950 border rounded-lg text-white focus:border-cyan-500 outline-none ${
                                        step2Touched.name && step2Errors.name ? 'border-red-500/60' : 'border-slate-700'
                                    }`}
                                    value={profile.name}
                                    onChange={(e) => handleProfileChange('name', e.target.value)}
                                    onBlur={() => setStep2Touched(prev => ({ ...prev, name: true }))}
                                    placeholder="Es. Mario Rossi"
                                />
                                {step2Touched.name && step2Errors.name && (
                                    <p className="text-xs text-red-400 mt-1">{step2Errors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block flex items-center gap-1"><Trophy size={10} /> Disciplina</label>
                                    <input
                                        type="text"
                                        list="athlete-disciplines-list"
                                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none placeholder-slate-600 appearance-none"
                                        value={profile.discipline}
                                        onChange={(e) => handleProfileChange('discipline', e.target.value)}
                                        placeholder="Seleziona o scrivi..."
                                    />
                                    <datalist id="athlete-disciplines-list">
                                        {DISCIPLINES.filter(d => d !== "Altro").map(d => (
                                            <option key={d} value={d} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block flex items-center gap-1"><Calendar size={10} /> Anni Pratica</label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none"
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
                                        className={`w-full p-2.5 bg-slate-950 border rounded-lg text-white focus:border-cyan-500 outline-none placeholder-slate-600 ${
                                            step2Touched.contact && step2Errors.contact ? 'border-red-500/60' : 'border-slate-700'
                                        }`}
                                        value={profile.email}
                                        onChange={(e) => handleProfileChange('email', e.target.value)}
                                        onBlur={() => setStep2Touched(prev => ({ ...prev, contact: true }))}
                                        placeholder="email@esempio.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block flex items-center gap-1"><Phone size={10} /> Telefono</label>
                                    <input
                                        type="tel"
                                        className={`w-full p-2.5 bg-slate-950 border rounded-lg text-white focus:border-cyan-500 outline-none placeholder-slate-600 ${
                                            step2Touched.contact && step2Errors.contact ? 'border-red-500/60' : 'border-slate-700'
                                        }`}
                                        value={profile.phone}
                                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                                        onBlur={() => setStep2Touched(prev => ({ ...prev, contact: true }))}
                                        placeholder="+39 ..."
                                    />
                                </div>
                                {step2Touched.contact && step2Errors.contact && (
                                    <p className="text-xs text-red-400">{step2Errors.contact}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3 — Questionari */}
            {step === 3 && (
                <>
                    <div className="shrink-0 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 shadow-lg space-y-3">
                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
                                <AlertCircle size={20} className="shrink-0" />
                                <span className="font-bold text-xs sm:text-sm">{errorMsg}</span>
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-slate-400">
                                <span>{answeredItems} / {totalItems} item risposti</span>
                                <span className="text-cyan-400">{progressPct}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>

                        {/* M4: overflow-x-auto + flex-nowrap for horizontal scroll on mobile */}
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

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <div className="max-w-4xl mx-auto">
                            {tabs.find(t => t.id === activeTab)?.component || (
                                <div className="text-center text-slate-500 py-10">Nessun questionario selezionato</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </main>

        {/* Barra azioni in basso: cambia in base allo step */}
        <div className="shrink-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 p-4 shadow-[0_-5px_30px_rgba(0,0,0,0.6)] flex justify-end items-center gap-3">
            {step === 1 && (
                <button
                    onClick={() => setStep(2)}
                    disabled={!consentGiven}
                    className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 px-6 py-3 rounded-lg font-black shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:from-cyan-500 hover:to-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
                >
                    Inizia <ChevronRight size={18} strokeWidth={3} />
                </button>
            )}

            {step === 2 && (
                <>
                    <button
                        onClick={() => setStep(1)}
                        className="px-4 py-3 text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm transition-colors mr-auto"
                    >
                        <ChevronLeft size={18} /> Indietro
                    </button>
                    <button
                        onClick={() => setStep(3)}
                        disabled={!isStep2Valid}
                        className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 px-6 py-3 rounded-lg font-black shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:from-cyan-500 hover:to-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
                    >
                        Avanti <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </>
            )}

            {step === 3 && (
                <>
                    <button
                        onClick={() => setStep(2)}
                        className="px-4 py-3 text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm transition-colors mr-auto"
                    >
                        <ChevronLeft size={18} /> Indietro
                    </button>
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
                </>
            )}
        </div>
    </div>
  );
};
