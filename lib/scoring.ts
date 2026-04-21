import { QuestionnaireData } from '../types';
import { PESD_CATEGORIES } from '../constants';

// ─── PALETTE ────────────────────────────────────────────────
export const C = {
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

// ─── TYPES ──────────────────────────────────────────────────
export type Polarity = 'pos' | 'neg';

export interface ScoreEntry { name: string; val: number; fill: string; pol?: Polarity; }

// ─── SCORING HELPERS ────────────────────────────────────────
export const mean = (indices: number[], values: number[], reverseIndices: number[] = [], reverseBase: number = 0): number => {
    if (!values || values.length === 0 || indices.length === 0) return 0;
    const sum = indices.reduce((acc, idx) => {
        let val = values[idx] || 0;
        if (reverseIndices.includes(idx)) val = reverseBase - val;
        return acc + val;
    }, 0);
    return sum / indices.length;
};

export const hasData = (arr: number[] | null | undefined): boolean =>
    Array.isArray(arr) && arr.length > 0;

// ─── TRAFFIC LIGHT ──────────────────────────────────────────
export const getSignal = (val: number, scaleMin: number, scaleMax: number, pol: Polarity): string => {
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

export const getPesdSignal = (val: number): string => {
    if (val >= 2)  return '🟢';
    if (val >= -1) return '🟡';
    return '🔴';
};

// ─── COMPUTE ALL SCORES ─────────────────────────────────────
export interface AllScores {
    ipps:  ScoreEntry[];
    tipi:  ScoreEntry[];
    mis:   ScoreEntry[];
    erq:   ScoreEntry[];
    pps:   ScoreEntry[];
    cfq:   ScoreEntry[];
    bnsss: ScoreEntry[];
    seq:   ScoreEntry[];
    mts:   ScoreEntry[];
    ct:    ScoreEntry[];
    pesd:  ScoreEntry[];
}

export const computeAllScores = (data: QuestionnaireData): AllScores => {
    // IPPS-24 UITS (1-6), 8 sottoscale × 3 item
    const ipps: ScoreEntry[] = [
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
    const tipi: ScoreEntry[] = [
        { name: '▲ Estroversione',     val: mean([0, 5], data.tipi || [], [5], 8), fill: C.pos, pol: 'pos' },
        { name: '▲ Amabilità',         val: mean([6, 1], data.tipi || [], [1], 8), fill: C.pos, pol: 'pos' },
        { name: '▲ Coscienziosità',    val: mean([2, 7], data.tipi || [], [7], 8), fill: C.pos, pol: 'pos' },
        { name: '▲ Stabilità Emotiva', val: mean([8, 3], data.tipi || [], [3], 8), fill: C.pos, pol: 'pos' },
        { name: '▲ Apertura Mentale',  val: mean([4, 9], data.tipi || [], [9], 8), fill: C.pos, pol: 'pos' },
    ];

    // MIS (1-6), reverse base=7
    const mis: ScoreEntry[] = [
        { name: '▲ Awareness',      val: mean([0, 3, 6], data.mis || []),            fill: C.pos, pol: 'pos' },
        { name: '▲ Non-Judgmental',  val: mean([1, 4, 7], data.mis || [], [1, 4, 7], 7), fill: C.pos, pol: 'pos' },
        { name: '▲ Refocusing',      val: mean([2, 5, 8], data.mis || []),            fill: C.pos, pol: 'pos' },
    ];

    // ERQ (1-7)
    const erq: ScoreEntry[] = [
        { name: '▲ Riappraisal Cognitivo',  val: mean([1, 3, 5], data.erq || []), fill: C.challenge, pol: 'pos' },
        { name: '▼ Soppressione Espressiva', val: mean([0, 2, 4], data.erq || []), fill: C.neg,       pol: 'neg' },
    ];

    // PPS-S (1-7)
    const pps: ScoreEntry[] = [
        { name: '▼ Self-oriented',      val: mean([0, 3, 6], data.pps || []), fill: C.neg, pol: 'neg' },
        { name: '▼ Socially Prescribed', val: mean([1, 4, 7], data.pps || []), fill: C.neg, pol: 'neg' },
        { name: '▼ Other-oriented',      val: mean([2, 5, 8], data.pps || []), fill: C.neg, pol: 'neg' },
    ];

    // CFQ (1-5)
    const cfq: ScoreEntry[] = [
        { name: '▲ Problem-focused',  val: mean([0, 3, 6], data.cfq || []), fill: C.pos,       pol: 'pos' },
        { name: '▲ Emotion-focused',  val: mean([1, 4, 7], data.cfq || []), fill: C.pos,       pol: 'pos' },
        { name: '▼ Avoidance Coping', val: mean([2, 5, 8], data.cfq || []), fill: C.neg,       pol: 'neg' },
    ];

    // BNSSS (1-7), reverse base=8
    const bnsss: ScoreEntry[] = [
        { name: '▲ Autonomia',         val: mean([0, 3, 6], data.bnsss || []),               fill: C.challenge, pol: 'pos' },
        { name: '▲ Competenza',        val: mean([1, 4, 7], data.bnsss || [], [1, 4, 7], 8), fill: C.challenge, pol: 'pos' },
        { name: '▲ Relazioni Sociali', val: mean([2, 5, 8], data.bnsss || []),               fill: C.challenge, pol: 'pos' },
    ];

    // SEQ (0-4)
    const seq: ScoreEntry[] = [
        { name: '▼ Ansia',          val: data.seq ? data.seq[0] : 0, fill: C.neg,       pol: 'neg' },
        { name: '▼ Scoraggiamento', val: data.seq ? data.seq[1] : 0, fill: C.neg,       pol: 'neg' },
        { name: '▲ Eccitazione',    val: data.seq ? data.seq[2] : 0, fill: C.challenge, pol: 'pos' },
        { name: '▼ Rabbia',         val: data.seq ? data.seq[3] : 0, fill: C.neg,       pol: 'neg' },
        { name: '▲ Felicità',       val: data.seq ? data.seq[4] : 0, fill: C.challenge, pol: 'pos' },
    ];

    // MTS (1-5)
    const mts: ScoreEntry[] = [
        { name: '▲ Mental Toughness', val: mean([0,1,2,3,4,5,6,7,8,9,10], data.mts || []), fill: C.pos, pol: 'pos' }
    ];

    // CT (1-7)
    const ct: ScoreEntry[] = [
        { name: '▲ Challenge', val: mean([0, 3, 4, 7, 9], data.ct || []), fill: C.challenge, pol: 'pos' },
        { name: '▼ Threat',    val: mean([1, 2, 5, 6, 8], data.ct || []), fill: C.neg,       pol: 'neg' },
    ];

    // PESD (-4 / +4)
    const pesd: ScoreEntry[] = PESD_CATEGORIES.map((cat, i) => ({
        name: cat, val: mean([i, i + 10, i + 20], data.pesd), fill: C.pesd, pol: 'pos' as Polarity
    }));
    const pesdTotal = pesd.reduce((a, c) => a + c.val, 0) / (pesd.length || 1);
    pesd.push({ name: '★ PESD Totale', val: pesdTotal, fill: C.pesdTot, pol: 'pos' });

    return { ipps, tipi, mis, erq, pps, cfq, bnsss, seq, mts, ct, pesd };
};
