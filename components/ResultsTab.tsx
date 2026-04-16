import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell 
} from 'recharts';
import { Download, AlertCircle } from 'lucide-react';
import { AthleteProfile, QuestionnaireData } from '../types';
import { PESD_CATEGORIES } from '../constants';

interface ResultsTabProps {
    profile: AthleteProfile;
    data: QuestionnaireData;
}

const COLORS = {
    positive: '#38bdf8', // Sky 400
    negative: '#f87171', // Red 400
    pesd: '#c084fc',     // Purple 400
    text: '#e2e8f0',     // Slate 200
    grid: '#334155'      // Slate 700
};

// helper for reverse scoring and mean
const mean = (indices: number[], values: number[], reverseIndices: number[] = [], reverseBase: number = 0) => {
    if (indices.length === 0) return 0;
    const sum = indices.reduce((acc, idx) => {
        let val = values[idx] || 0;
        if (reverseIndices.includes(idx)) {
            val = reverseBase - val;
        }
        return acc + val;
    }, 0);
    return sum / indices.length;
};

// Component for miniature charts
const MiniChart = ({ data, title, domain }: { data: any[], title: string, domain: [number, number] }) => (
    <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-800 flex flex-col h-[280px]">
        <h3 className="text-sm font-bold text-slate-200 mb-2 truncate" title={title}>{title}</h3>
        <div className="flex-1 min-h-0 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.grid} />
                    <XAxis type="number" domain={domain} stroke={COLORS.text} tick={{fontSize: 10}} />
                    <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 10, fontWeight: 600, fill: COLORS.text}} stroke={COLORS.text} interval={0} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={16} label={{ position: 'right', fill: '#94a3b8', fontSize: 10, formatter: (v: number) => v.toFixed(2) }}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const ResultsTab: React.FC<ResultsTabProps> = ({ profile, data }) => {
    
    const results = useMemo(() => {
        // IPPS (1-6)
        const ippsScores = [
            { name: '▲ Prep. Gara', val: mean([0, 8, 16], data.ipps), fill: COLORS.positive },
            { name: '▲ Self-talk', val: mean([1, 9, 17], data.ipps), fill: COLORS.positive },
            { name: '▼ Ansia Cogn.', val: mean([2, 10, 18], data.ipps), fill: COLORS.negative },
            { name: '▲ Fiducia', val: mean([3, 11, 19], data.ipps), fill: COLORS.positive },
            { name: '▲ Goal-setting', val: mean([4, 12, 20], data.ipps), fill: COLORS.positive },
            { name: '▲ Ctrl Arousal', val: mean([5, 13, 21], data.ipps), fill: COLORS.positive },
            { name: '▲ Pratica Ment.', val: mean([6, 14, 22], data.ipps), fill: COLORS.positive },
            { name: '▼ Dist. Conc.', val: mean([7, 15, 23], data.ipps), fill: COLORS.negative },
        ];

        // TIPI (1-7) => Base: 8
        const tipiScores = [
            { name: '▲ Estrovers.', val: mean([0, 5], data.tipi || [], [5], 8), fill: COLORS.positive },
            { name: '▲ Amabilità', val: mean([6, 1], data.tipi || [], [1], 8), fill: COLORS.positive },
            { name: '▲ Coscienzios.', val: mean([2, 7], data.tipi || [], [7], 8), fill: COLORS.positive },
            { name: '▲ Stab. Emot.', val: mean([8, 3], data.tipi || [], [3], 8), fill: COLORS.positive },
            { name: '▲ Aper. Mentale', val: mean([4, 9], data.tipi || [], [9], 8), fill: COLORS.positive },
        ];

        // MIS (1-6) => Base: 7
        const misScores = [
            { name: '▲ AWA', val: mean([0, 3, 6], data.mis || []), fill: COLORS.positive },
            { name: '▲ ACC', val: mean([1, 4, 7], data.mis || [], [1, 4, 7], 7), fill: COLORS.positive },
            { name: '▲ REF', val: mean([2, 5, 8], data.mis || []), fill: COLORS.positive },
        ];

        // ERQ (1-7)
        const erqScores = [
            { name: '▲ Ristruttur.', val: mean([1, 3, 5], data.erq || []), fill: COLORS.positive },
            { name: '▼ Soppressione', val: mean([0, 2, 4], data.erq || []), fill: COLORS.negative },
        ];

        // PPS-S (1-7)
        const ppsScores = [
            { name: '▼ SOP', val: mean([0, 3, 6], data.pps || []), fill: COLORS.negative },
            { name: '▼ SPP', val: mean([1, 4, 7], data.pps || []), fill: COLORS.negative },
            { name: '▼ OOP', val: mean([2, 5, 8], data.pps || []), fill: COLORS.negative },
        ];

        // CFQ (1-5)
        const cfqScores = [
            { name: '▲ Su Problema', val: mean([0, 3, 6], data.cfq || []), fill: COLORS.positive },
            { name: '▲ Su Emozione', val: mean([1, 4, 7], data.cfq || []), fill: COLORS.positive },
            { name: '▼ Di Evitament.', val: mean([2, 5, 8], data.cfq || []), fill: COLORS.negative },
        ];

        // BNSSS (1-7) => Base: 8
        const bnsssScores = [
            { name: '▲ Competenza', val: mean([1, 4, 7], data.bnsss || [], [1, 4, 7], 8), fill: COLORS.positive },
            { name: '▲ Autonomia', val: mean([0, 3, 6], data.bnsss || []), fill: COLORS.positive },
            { name: '▲ Relazione', val: mean([2, 5, 8], data.bnsss || []), fill: COLORS.positive },
        ];

        // SEQ (0-4)
        const seqScores = [
            { name: '▼ Ansia', val: data.seq ? data.seq[0] : 0, fill: COLORS.negative },
            { name: '▼ Scoraggiam.', val: data.seq ? data.seq[1] : 0, fill: COLORS.negative },
            { name: '▲ Eccitazione', val: data.seq ? data.seq[2] : 0, fill: COLORS.positive },
            { name: '▼ Rabbia', val: data.seq ? data.seq[3] : 0, fill: COLORS.negative },
            { name: '▲ Felicità', val: data.seq ? data.seq[4] : 0, fill: COLORS.positive },
        ];

        // MTS (1-5)
        const mtsTotal = mean([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], data.mts || []);
        const mtsScores = [
            { name: '▲ Mental Toughness', val: mtsTotal, fill: COLORS.positive }
        ];

        // CT (1-5)
        const ctScores = [
            { name: '▲ Sfida', val: mean([0, 3, 4, 7, 9], data.ct || []), fill: COLORS.positive },
            { name: '▼ Minaccia', val: mean([1, 2, 5, 6, 8], data.ct || []), fill: COLORS.negative }
        ];

        // PESD Calculation
        const pesdScores = PESD_CATEGORIES.map((cat, i) => {
            const indices = [i, i + 10, i + 20];
            const val = mean(indices, data.pesd);
            return { name: cat, val: val, fill: COLORS.pesd };
        });
        
        // PESD Total
        const pesdTotal = pesdScores.reduce((acc, curr) => acc + curr.val, 0) / (pesdScores.length || 1);
        pesdScores.push({ name: 'PESD Totale', val: pesdTotal, fill: '#d8b4fe' });

        return { ippsScores, tipiScores, misScores, erqScores, ppsScores, cfqScores, bnsssScores, seqScores, mtsScores, ctScores, pesdScores };
    }, [data]);

    const downloadCSV = () => {
        const headers = [
            "Atleta", "Disciplina", "Data", "Email", "Telefono"
        ];
        const row = [
            profile.name, profile.discipline, new Date().toLocaleDateString(), profile.email, profile.phone
        ];

        const addScoresToCsv = (scoresData: {name: string, val: number}[]) => {
            scoresData.forEach(s => {
                headers.push(s.name.replace(/[▲▼ ]/g, ''));
                row.push(s.val.toFixed(2));
            });
        };

        if (data.ipps && data.ipps.length > 0) addScoresToCsv(results.ippsScores);
        if (data.tipi && data.tipi.length > 0) addScoresToCsv(results.tipiScores);
        if (data.mis && data.mis.length > 0) addScoresToCsv(results.misScores);
        if (data.erq && data.erq.length > 0) addScoresToCsv(results.erqScores);
        if (data.pps && data.pps.length > 0) addScoresToCsv(results.ppsScores);
        if (data.cfq && data.cfq.length > 0) addScoresToCsv(results.cfqScores);
        if (data.bnsss && data.bnsss.length > 0) addScoresToCsv(results.bnsssScores);
        if (data.seq && data.seq.length > 0) addScoresToCsv(results.seqScores);
        if (data.mts && data.mts.length > 0) addScoresToCsv(results.mtsScores);
        if (data.ct && data.ct.length > 0) addScoresToCsv(results.ctScores);
        if (data.pesd && data.pesd.length > 0) addScoresToCsv(results.pesdScores);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), row.join(",")].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `flux_assessment_${profile.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 p-3 border border-slate-700 shadow-2xl rounded text-sm text-white">
                    <p className="font-bold text-slate-200 mb-1">{payload[0].payload.name}</p>
                    <p className="font-mono text-cyan-400 font-bold text-lg">{Number(payload[0].value).toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-slate-900 p-6 rounded-xl shadow-lg border-l-4 border-cyan-500 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Analisi Profilo</h2>
                    <div className="flex flex-col gap-1 mt-2 text-sm text-slate-400">
                        <span>Atleta: <strong className="text-slate-200">{profile.name}</strong></span>
                        <span>Disciplina: {profile.discipline}</span>
                        <span>Contatti: {profile.email} - {profile.phone}</span>
                    </div>
                </div>
                <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors font-medium border border-slate-700">
                    <Download size={18} /> <span className="hidden md:inline">Scarica CSV</span>
                </button>
            </div>

            {/* Nuovi grafici in griglia moderna e compatta */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(data.ipps && data.ipps.length > 0) && <MiniChart data={results.ippsScores} title="IPPS-24" domain={[1, 6]} />}
                {(data.tipi && data.tipi.length > 0) && <MiniChart data={results.tipiScores} title="TIPI" domain={[1, 7]} />}
                {(data.mis && data.mis.length > 0) && <MiniChart data={results.misScores} title="MIS" domain={[1, 6]} />}
                {(data.erq && data.erq.length > 0) && <MiniChart data={results.erqScores} title="ERQ" domain={[1, 7]} />}
                {(data.pps && data.pps.length > 0) && <MiniChart data={results.ppsScores} title="PPS-S" domain={[1, 7]} />}
                {(data.cfq && data.cfq.length > 0) && <MiniChart data={results.cfqScores} title="CFQ" domain={[1, 5]} />}
                {(data.bnsss && data.bnsss.length > 0) && <MiniChart data={results.bnsssScores} title="BNSSS" domain={[1, 7]} />}
                {(data.seq && data.seq.length > 0) && <MiniChart data={results.seqScores} title="SEQ" domain={[0, 4]} />}
                {(data.mts && data.mts.length > 0) && <MiniChart data={results.mtsScores} title="MTS" domain={[1, 5]} />}
                {(data.ct && data.ct.length > 0) && <MiniChart data={results.ctScores} title="CT" domain={[1, 5]} />}
            </div>

            {/* PESD Chart */}
            {(data.pesd && data.pesd.length > 0) && (
                <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 mt-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">Profilo PESD (Psicobiosociale)</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={results.pesdScores} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke={COLORS.grid} />
                            <XAxis type="number" domain={[-4, 4]} ticks={[-4, -2, 0, 2, 4]} stroke={COLORS.text} tick={{fontSize: 10}} />
                            <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 11, fontWeight: 600, fill: COLORS.text}} interval={0} stroke={COLORS.text} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <ReferenceLine x={0} stroke="#94a3b8" />
                            <Bar dataKey="val" barSize={16} label={{ position: 'right', fill: '#94a3b8', fontSize: 10, formatter: (v: number) => v.toFixed(2) }}>
                                {results.pesdScores.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            )}
        </div>
    );
};