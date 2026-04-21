import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { Download } from 'lucide-react';
import { AthleteProfile, QuestionnaireData } from '../types';
import { C, ScoreEntry, Polarity, hasData, getSignal, getPesdSignal, computeAllScores } from '../lib/scoring';

interface ResultsTabProps {
    profile: AthleteProfile;
    data: QuestionnaireData;
}

// ─── SCORE CARD ROW ─────────────────────────────────────────
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

    const results = useMemo(() => computeAllScores(data), [data]);

    // ─── CSV EXPORT ─────────────────────────────────────────
    const downloadCSV = () => {
        const headers: string[] = ["Atleta", "Disciplina", "Data", "Email", "Telefono"];
        const row: string[] = [profile.name, profile.discipline, new Date().toLocaleDateString(), profile.email, profile.phone];
        const add = (scores: ScoreEntry[]) => scores.forEach(s => {
            headers.push(s.name.replace(/[▲▼★ ]/g, ''));
            row.push(s.val.toFixed(2));
        });
        if (hasData(data.ipps))  add(results.ipps);
        if (hasData(data.tipi))  add(results.tipi);
        if (hasData(data.mis))   add(results.mis);
        if (hasData(data.erq))   add(results.erq);
        if (hasData(data.pps))   add(results.pps);
        if (hasData(data.cfq))   add(results.cfq);
        if (hasData(data.bnsss)) add(results.bnsss);
        if (hasData(data.seq))   add(results.seq);
        if (hasData(data.mts))   add(results.mts);
        if (hasData(data.ct))    add(results.ct);
        if (hasData(data.pesd))  add(results.pesd);
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
                    accent={C.pos} data={results.ipps} domain={[1, 6]} height={380} yWidth={200}
                    scaleMin={1} scaleMax={6} />
            )}

            {/* ── TIPI + MIS (2 cols) ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasData(data.tipi) && (
                    <ChartSection title="TIPI" subtitle="Scala 1–7 · Big Five · Gosling et al. (2003)"
                        accent={C.pos} data={results.tipi} domain={[1, 7]} height={300} yWidth={170}
                        scaleMin={1} scaleMax={7} />
                )}
                {hasData(data.mis) && (
                    <ChartSection title="MIS" subtitle="Scala 1–6 · Mindfulness in Sport · Thienot et al. (2014)"
                        accent={C.pos} data={results.mis} domain={[1, 6]} height={220} yWidth={160}
                        scaleMin={1} scaleMax={6} />
                )}
            </div>

            {/* ── ERQ + PPS-S (2 cols) ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasData(data.erq) && (
                    <ChartSection title="ERQ" subtitle="Scala 1–7 · Regolazione Emotiva · Balzarotti et al. (2010)"
                        accent={C.challenge} data={results.erq} domain={[1, 7]} height={200} yWidth={200}
                        scaleMin={1} scaleMax={7} />
                )}
                {hasData(data.pps) && (
                    <ChartSection title="PPS-S" subtitle="Scala 1–7 · Perfezionismo · Hill et al. (2016)"
                        accent={C.neg} data={results.pps} domain={[1, 7]} height={220} yWidth={180}
                        scaleMin={1} scaleMax={7} />
                )}
            </div>

            {/* ── CFQ + BNSSS (2 cols) ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasData(data.cfq) && (
                    <ChartSection title="CFQ" subtitle="Scala 1–5 · Coping Funzionale · Kowalski & Crocker (2001)"
                        accent={C.pos} data={results.cfq} domain={[1, 5]} height={220} yWidth={170}
                        scaleMin={1} scaleMax={5} />
                )}
                {hasData(data.bnsss) && (
                    <ChartSection title="BNSSS" subtitle="Scala 1–7 · Bisogni Fondamentali · Ng et al. (2011)"
                        accent={C.challenge} data={results.bnsss} domain={[1, 7]} height={220} yWidth={170}
                        scaleMin={1} scaleMax={7} />
                )}
            </div>

            {/* ── MTS + C&T (2 cols) ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasData(data.mts) && (
                    <ChartSection title="MTS" subtitle="Scala 1–5 · Mental Toughness"
                        accent={C.pos} data={results.mts} domain={[1, 5]} height={140} yWidth={170}
                        scaleMin={1} scaleMax={5} />
                )}
                {hasData(data.ct) && (
                    <ChartSection title="Challenge & Threat" subtitle="Scala 1–7 · Sfida vs Minaccia"
                        accent={C.challenge} data={results.ct} domain={[1, 7]} height={180} yWidth={140}
                        scaleMin={1} scaleMax={7} />
                )}
            </div>

            {/* ── SEQ (full width, 5 bars) ────────────────── */}
            {hasData(data.seq) && (
                <ChartSection title="SEQ" subtitle="Scala 0–4 · Emozioni Sport · Jones et al. (2005)"
                    accent={C.neg} data={results.seq} domain={[0, 4]} height={280} yWidth={170}
                    scaleMin={0} scaleMax={4} />
            )}

            {/* ── PESD (full width, 11 bars) ──────────────── */}
            {hasData(data.pesd) && (
                <ChartSection title="PESD-Sport" subtitle="Scala -4/+4 · Profilo Psicobiosociale · 10 sottoscale + Totale"
                    accent={C.pesd} data={results.pesd} domain={[-4, 4]} height={500} yWidth={170}
                    showRefLine scaleMin={-4} scaleMax={4} isPesd />
            )}
        </div>
    );
};
