import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell 
} from 'recharts';
import { Download } from 'lucide-react';
import { AthleteProfile, QuestionnaireData } from '../types';
import { PESD_CATEGORIES } from '../constants';

interface ResultsTabProps {
    profile: AthleteProfile;
    data: QuestionnaireData;
}

// ─── PALETTE ────────────────────────────────────────────────
const C = {
    pos:      '#60A5FA',  // Blue 400
    neg:      '#F87171',  // Red 400
    challenge:'#34D399',  // Emerald 400
    pesd:     '#A78BFA',  // Violet 400
    pesdTot:  '#7C3AED',  // Violet 600
    white:    '#F1F5F9',
    muted:    '#94A3B8',
    grid:     '#1E293B',
    cardBg:   'rgba(15,23,42,0.6)',
    chartBg:  'rgba(15,23,42,0.5)',
};

// ─── SCORING HELPERS ────────────────────────────────────────
const mean = (indices: number[], values: number[], reverseIndices: number[] = [], reverseBase: number = 0) => {
    if (!values || values.length === 0 || indices.length === 0) return 0;
    const sum = indices.reduce((acc, idx) => {
        let val = values[idx] || 0;
        if (reverseIndices.includes(idx)) val = reverseBase - val;
        return acc + val;
    }, 0);
    return sum / indices.length;
};

const hasData = (arr: number[] | null | undefined): boolean =>
    Array.isArray(arr) && arr.length > 0;

// ─── TRAFFIC LIGHT ──────────────────────────────────────────
type Polarity = 'pos' | 'neg';

const getSignal = (val: number, scaleMin: number, scaleMax: number, pol: Polarity): string => {
    const range = scaleMax - scaleMin;
    const normHigh = scaleMin + range * 0.7;
    const normLow  = scaleMin + range * 0.4;
    if (pol === 'pos') {
        if (val >= normHigh) return '🟢';
        if (val >= normLow)  return '🟡';
        return '🔴';
    } else {
        if (val >= normHigh) return '🔴';
        if (val >= normLow)  return '🟡';
        return '🟢';
    }
};

const getPesdSignal = (val: number): string => {
    if (val >= 2)  return '🟢';
    if (val >= -1) return '🟡';
    return '🔴';
};

// ─── SCORE CARD ROW ─────────────────────────────────────────
interface ScoreEntry { name: string; val: number; fill: string; pol?: Polarity; }

const ScoreCards = ({ scores, scaleMin, scaleMax, isPesd }: { scores: ScoreEntry[]; scaleMin: number; scaleMax: number; isPesd?: boolean }) => (
    <div className="flex flex-wrap gap-3 mb-4">
        {scores.map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                 style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.4)' }}>
                <span className="text-xs">
                    {isPesd ? getPesdSignal(s.val) : getSignal(s.val, scaleMin, scaleMax, s.pol || 'pos')}
                </span>
                <span className="text-xs text-slate-400 font-medium">{s.name.replace(/[▲▼] ?/, '')}</span>
                <span className="text-sm font-bold text-white">{s.val.toFixed(2)}</span>
            </div>
        ))}
    </div>
);

// ─── CHART SECTION ──────────────────────────────────────────
interface ChartSectionProps {
    title: string;
    subtitle: string;
    accent: string;
    data: ScoreEntry[];
    domain: [number, number];
    height: number;
    yWidth?: number;
    showRefLine?: boolean;
    scaleMin: number;
    scaleMax: number;
    isPesd?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <p style={{ color: '#CBD5E1', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{payload[0].payload.name}</p>
                <p style={{ color: '#22D3EE', fontSize: 20, fontWeight: 800, fontFamily: 'monospace' }}>{Number(payload[0].value).toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

const ChartSection: React.FC<ChartSectionProps> = ({ title, subtitle, accent, data, domain, height, yWidth = 180, showRefLine, scaleMin, scaleMax, isPesd }) => (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.chartBg, border: '1px solid rgba(71,85,105,0.3)', backdropFilter: 'blur(8px)' }}>
        <div className="px-6 pt-5 pb-2">
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            <div className="mt-1 mb-3" style={{ width: 40, height: 3, borderRadius: 2, background: accent }} />
            <p className="text-xs text-slate-500 mb-3">{subtitle}</p>
            <ScoreCards scores={data} scaleMin={scaleMin} scaleMax={scaleMax} isPesd={isPesd} />
        </div>
        <div className="px-4 pb-5" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ top: 4, right: 44, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(51,65,85,0.5)" />
                    <XAxis type="number" domain={domain} stroke="#475569" tick={{ fontSize: 11, fill: '#64748B' }}
                           tickLine={false} axisLine={{ stroke: '#334155' }} />
                    <YAxis dataKey="name" type="category" width={yWidth} interval={0}
                           tick={{ fontSize: 12, fontWeight: 600, fill: '#CBD5E1' }}
                           stroke="transparent" tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    {showRefLine && <ReferenceLine x={0} stroke="#64748B" strokeDasharray="4 4" />}
                    <Bar dataKey="val" radius={[0, 6, 6, 0]} barSize={28}
                         label={{ position: 'right', fill: '#E2E8F0', fontSize: 13, fontWeight: 700,
                                  formatter: (v: number) => v.toFixed(2) }}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.85} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────
export const ResultsTab: React.FC<ResultsTabProps> = ({ profile, data }) => {

    const results = useMemo(() => {
        // IPPS-24 UITS (1-6), 8 sottoscale × 3 item
        const ippsScores: ScoreEntry[] = [
            { name: '▲ Preparazione Gara',        val: mean([0, 8, 16],  data.ipps), fill: C.pos, pol: 'pos' },
            { name: '▲ Self-talk',                 val: mean([1, 9, 17],  data.ipps), fill: C.pos, pol: 'pos' },
            { name: '▼ Ansia Cognitiva',           val: mean([2, 10, 18], data.ipps), fill: C.neg, pol: 'neg' },
            { name: '▲ Fiducia',                   val: mean([3, 11, 19], data.ipps), fill: C.pos, pol: 'pos' },
            { name: '▲ Goal-setting',              val: mean([4, 12, 20], data.ipps), fill: C.pos, pol: 'pos' },
            { name: '▲ Controllo Arousal',         val: mean([5, 13, 21], data.ipps), fill: C.pos, pol: 'pos' },
            { name: '▲ Pratica Mentale',           val: mean([6, 14, 22], data.ipps), fill: C.pos, pol: 'pos' },
            { name: '▼ Dist. Concentrazione',      val: mean([7, 15, 23], data.ipps), fill: C.neg, pol: 'neg' },
        ];

        // TIPI (1-7), reverse base=8
        const tipiScores: ScoreEntry[] = [
            { name: '▲ Estroversione',     val: mean([0, 5], data.tipi || [], [5], 8), fill: C.pos, pol: 'pos' },
            { name: '▲ Amabilità',         val: mean([6, 1], data.tipi || [], [1], 8), fill: C.pos, pol: 'pos' },
            { name: '▲ Coscienziosità',    val: mean([2, 7], data.tipi || [], [7], 8), fill: C.pos, pol: 'pos' },
            { name: '▲ Stabilità Emotiva', val: mean([8, 3], data.tipi || [], [3], 8), fill: C.pos, pol: 'pos' },
            { name: '▲ Apertura Mentale',  val: mean([4, 9], data.tipi || [], [9], 8), fill: C.pos, pol: 'pos' },
        ];

        // MIS (1-6), reverse base=7
        const misScores: ScoreEntry[] = [
            { name: '▲ Awareness',      val: mean([0, 3, 6], data.mis || []),            fill: C.pos, pol: 'pos' },
            { name: '▲ Non-Judgmental',  val: mean([1, 4, 7], data.mis || [], [1, 4, 7], 7), fill: C.pos, pol: 'pos' },
            { name: '▲ Refocusing',      val: mean([2, 5, 8], data.mis || []),            fill: C.pos, pol: 'pos' },
        ];

        // ERQ (1-7)
        const erqScores: ScoreEntry[] = [
            { name: '▲ Riappraisal Cognitivo',  val: mean([1, 3, 5], data.erq || []), fill: C.challenge, pol: 'pos' },
            { name: '▼ Soppressione Espressiva', val: mean([0, 2, 4], data.erq || []), fill: C.neg,       pol: 'neg' },
        ];

        // PPS-S (1-7)
        const ppsScores: ScoreEntry[] = [
            { name: '▼ Self-oriented',      val: mean([0, 3, 6], data.pps || []), fill: C.neg, pol: 'neg' },
            { name: '▼ Socially Prescribed', val: mean([1, 4, 7], data.pps || []), fill: C.neg, pol: 'neg' },
            { name: '▼ Other-oriented',      val: mean([2, 5, 8], data.pps || []), fill: C.neg, pol: 'neg' },
        ];

        // CFQ (1-5)
        const cfqScores: ScoreEntry[] = [
            { name: '▲ Problem-focused',  val: mean([0, 3, 6], data.cfq || []), fill: C.pos,       pol: 'pos' },
            { name: '▲ Emotion-focused',  val: mean([1, 4, 7], data.cfq || []), fill: C.pos,       pol: 'pos' },
            { name: '▼ Avoidance Coping', val: mean([2, 5, 8], data.cfq || []), fill: C.neg,       pol: 'neg' },
        ];

        // BNSSS (1-7), reverse base=8
        const bnsssScores: ScoreEntry[] = [
            { name: '▲ Autonomia',         val: mean([0, 3, 6], data.bnsss || []),               fill: C.challenge, pol: 'pos' },
            { name: '▲ Competenza',        val: mean([1, 4, 7], data.bnsss || [], [1, 4, 7], 8), fill: C.challenge, pol: 'pos' },
            { name: '▲ Relazioni Sociali', val: mean([2, 5, 8], data.bnsss || []),               fill: C.challenge, pol: 'pos' },
        ];

        // SEQ (0-4)
        const seqScores: ScoreEntry[] = [
            { name: '▼ Ansia',          val: data.seq ? data.seq[0] : 0, fill: C.neg,       pol: 'neg' },
            { name: '▼ Scoraggiamento', val: data.seq ? data.seq[1] : 0, fill: C.neg,       pol: 'neg' },
            { name: '▲ Eccitazione',    val: data.seq ? data.seq[2] : 0, fill: C.challenge, pol: 'pos' },
            { name: '▼ Rabbia',         val: data.seq ? data.seq[3] : 0, fill: C.neg,       pol: 'neg' },
            { name: '▲ Felicità',       val: data.seq ? data.seq[4] : 0, fill: C.challenge, pol: 'pos' },
        ];

        // MTS (1-5)
        const mtsScores: ScoreEntry[] = [
            { name: '▲ Mental Toughness', val: mean([0,1,2,3,4,5,6,7,8,9,10], data.mts || []), fill: C.pos, pol: 'pos' }
        ];

        // CT (1-7)
        const ctScores: ScoreEntry[] = [
            { name: '▲ Challenge', val: mean([0, 3, 4, 7, 9], data.ct || []), fill: C.challenge, pol: 'pos' },
            { name: '▼ Threat',    val: mean([1, 2, 5, 6, 8], data.ct || []), fill: C.neg,       pol: 'neg' },
        ];

        // PESD (-4 / +4)
        const pesdScores: ScoreEntry[] = PESD_CATEGORIES.map((cat, i) => ({
            name: cat, val: mean([i, i + 10, i + 20], data.pesd), fill: C.pesd, pol: 'pos' as Polarity
        }));
        const pesdTotal = pesdScores.reduce((a, c) => a + c.val, 0) / (pesdScores.length || 1);
        pesdScores.push({ name: '★ PESD Totale', val: pesdTotal, fill: C.pesdTot, pol: 'pos' });

        return { ippsScores, tipiScores, misScores, erqScores, ppsScores, cfqScores, bnsssScores, seqScores, mtsScores, ctScores, pesdScores };
    }, [data]);

    // ─── CSV EXPORT ─────────────────────────────────────────
    const downloadCSV = () => {
        const headers: string[] = ["Atleta", "Disciplina", "Data", "Email", "Telefono"];
        const row: string[] = [profile.name, profile.discipline, new Date().toLocaleDateString(), profile.email, profile.phone];
        const add = (scores: ScoreEntry[]) => scores.forEach(s => {
            headers.push(s.name.replace(/[▲▼★ ]/g, ''));
            row.push(s.val.toFixed(2));
        });
        if (hasData(data.ipps))  add(results.ippsScores);
        if (hasData(data.tipi))  add(results.tipiScores);
        if (hasData(data.mis))   add(results.misScores);
        if (hasData(data.erq))   add(results.erqScores);
        if (hasData(data.pps))   add(results.ppsScores);
        if (hasData(data.cfq))   add(results.cfqScores);
        if (hasData(data.bnsss)) add(results.bnsssScores);
        if (hasData(data.seq))   add(results.seqScores);
        if (hasData(data.mts))   add(results.mtsScores);
        if (hasData(data.ct))    add(results.ctScores);
        if (hasData(data.pesd))  add(results.pesdScores);
        const csv = "data:text/csv;charset=utf-8," + [headers.join(","), row.join(",")].join("\n");
        const a = document.createElement("a");
        a.href = encodeURI(csv);
        a.download = `flux_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    // ─── RENDER ─────────────────────────────────────────────
    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="rounded-2xl px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                 style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.7) 100%)',
                          border: '1px solid rgba(96,165,250,0.3)', backdropFilter: 'blur(8px)' }}>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Analisi Profilo</h2>
                    <div className="mt-2 text-sm text-slate-400 space-y-0.5">
                        <p>Atleta: <strong className="text-white">{profile.name}</strong></p>
                        <p>Disciplina: {profile.discipline} · Contatti: {profile.email || '–'} {profile.phone || ''}</p>
                    </div>
                </div>
                <button onClick={downloadCSV}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                               bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50">
                    <Download size={16} /> Scarica CSV
                </button>
            </div>

            {/* ── IPPS-24 (full width, 8 bars) ───────────── */}
            {hasData(data.ipps) && (
                <ChartSection title="IPPS-24" subtitle="Scala 1–6 · Media di 3 item per sottoscala · Robazza, Bortoli & Gramaccioni (2009)"
                    accent={C.pos} data={results.ippsScores} domain={[1, 6]} height={380} yWidth={200}
                    scaleMin={1} scaleMax={6} />
            )}

            {/* ── TIPI + MIS (2 cols) ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasData(data.tipi) && (
                    <ChartSection title="TIPI" subtitle="Scala 1–7 · Big Five · Gosling et al. (2003)"
                        accent={C.pos} data={results.tipiScores} domain={[1, 7]} height={300} yWidth={170}
                        scaleMin={1} scaleMax={7} />
                )}
                {hasData(data.mis) && (
                    <ChartSection title="MIS" subtitle="Scala 1–6 · Mindfulness in Sport · Thienot et al. (2014)"
                        accent={C.pos} data={results.misScores} domain={[1, 6]} height={220} yWidth={160}
                        scaleMin={1} scaleMax={6} />
                )}
            </div>

            {/* ── ERQ + PPS-S (2 cols) ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasData(data.erq) && (
                    <ChartSection title="ERQ" subtitle="Scala 1–7 · Regolazione Emotiva · Balzarotti et al. (2010)"
                        accent={C.challenge} data={results.erqScores} domain={[1, 7]} height={200} yWidth={200}
                        scaleMin={1} scaleMax={7} />
                )}
                {hasData(data.pps) && (
                    <ChartSection title="PPS-S" subtitle="Scala 1–7 · Perfezionismo · Hill et al. (2016)"
                        accent={C.neg} data={results.ppsScores} domain={[1, 7]} height={220} yWidth={180}
                        scaleMin={1} scaleMax={7} />
                )}
            </div>

            {/* ── CFQ + BNSSS (2 cols) ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasData(data.cfq) && (
                    <ChartSection title="CFQ" subtitle="Scala 1–5 · Coping Funzionale · Kowalski & Crocker (2001)"
                        accent={C.pos} data={results.cfqScores} domain={[1, 5]} height={220} yWidth={170}
                        scaleMin={1} scaleMax={5} />
                )}
                {hasData(data.bnsss) && (
                    <ChartSection title="BNSSS" subtitle="Scala 1–7 · Bisogni Fondamentali · Ng et al. (2011)"
                        accent={C.challenge} data={results.bnsssScores} domain={[1, 7]} height={220} yWidth={170}
                        scaleMin={1} scaleMax={7} />
                )}
            </div>

            {/* ── MTS + C&T (2 cols) ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasData(data.mts) && (
                    <ChartSection title="MTS" subtitle="Scala 1–5 · Mental Toughness"
                        accent={C.pos} data={results.mtsScores} domain={[1, 5]} height={140} yWidth={170}
                        scaleMin={1} scaleMax={5} />
                )}
                {hasData(data.ct) && (
                    <ChartSection title="Challenge & Threat" subtitle="Scala 1–7 · Sfida vs Minaccia"
                        accent={C.challenge} data={results.ctScores} domain={[1, 7]} height={180} yWidth={140}
                        scaleMin={1} scaleMax={7} />
                )}
            </div>

            {/* ── SEQ (full width, 5 bars) ────────────────── */}
            {hasData(data.seq) && (
                <ChartSection title="SEQ" subtitle="Scala 0–4 · Emozioni Sport · Jones et al. (2005)"
                    accent={C.neg} data={results.seqScores} domain={[0, 4]} height={280} yWidth={170}
                    scaleMin={0} scaleMax={4} />
            )}

            {/* ── PESD (full width, 11 bars) ──────────────── */}
            {hasData(data.pesd) && (
                <ChartSection title="PESD-Sport" subtitle="Scala -4/+4 · Profilo Psicobiosociale · 10 sottoscale + Totale"
                    accent={C.pesd} data={results.pesdScores} domain={[-4, 4]} height={500} yWidth={170}
                    showRefLine scaleMin={-4} scaleMax={4} isPesd />
            )}
        </div>
    );
};
