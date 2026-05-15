import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
    IPPS_ITEMS, IPPS_SCALES,
    TIPI_ITEMS, TIPI_SCALES,
    MIS_ITEMS, MIS_SCALES,
    ERQ_ITEMS, ERQ_SCALES, ERQ_SCALES_EXACT,
    PPS_ITEMS, PPS_SCALES,
    CFQ_ITEMS, CFQ_SCALES,
    BNSSS_ITEMS, BNSSS_SCALES,
    SEQ_ITEMS, SEQ_SCALES,
    MTS_ITEMS, CT_ITEMS,
    TEIQUE_ITEMS, TEIQUE_SCALES,
    MAIA_ITEMS, MAIA_SCALES,
    PASSION_ITEMS, PASSION_SCALES
} from '../constants';
import { TabProps } from '../types';

interface SliderItemProps {
    label: string;
    value: number | null;
    min: number;
    max: number;
    labels: string[];
    onChange: (val: number) => void;
}

const SliderItem: React.FC<SliderItemProps> = ({ label, value, min, max, labels, onChange }) => {
    const isAnswered = value !== null;
    const displayValue = value ?? min;

    return (
        <div className={`mb-8 p-6 rounded-xl shadow-lg border transition-all group ${
            isAnswered
                ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/30'
                : 'bg-slate-900/70 border-orange-500/40 hover:border-orange-500/60'
        }`}>
            {!isAnswered && (
                <div className="mb-3 flex items-center gap-2 text-orange-400 text-xs font-bold">
                    <AlertCircle size={13} /> Da rispondere
                </div>
            )}
            <h4 className="text-md font-medium text-slate-200 mb-6 leading-relaxed group-hover:text-white transition-colors">{label}</h4>

            <div className="relative mb-8">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={displayValue}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer z-10 relative focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                        isAnswered ? 'bg-slate-700 accent-cyan-500' : 'bg-orange-900/40 accent-orange-400'
                    }`}
                />
                {/* Ticks */}
                <div className="absolute top-3 left-0 w-full flex justify-between px-1">
                    {labels.map((l, i) => (
                        <div key={i} className="flex flex-col items-center" style={{ width: `${100 / (labels.length || 1)}%` }}>
                            <div className="h-1.5 w-0.5 bg-slate-600 mb-1"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* m1 fix: text-xs (12px) instead of text-[10px] */}
            <div className="flex justify-between items-start text-xs text-slate-500 font-medium tracking-tight mt-2">
                {labels.map((l, i) => (
                    <div
                        key={i}
                        className={`text-center transition-all duration-300 w-16 ${
                            isAnswered && value === min + i ? 'text-cyan-400 font-bold scale-110 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'hover:text-slate-300'
                        }`}
                        onClick={() => onChange(min + i)}
                        style={{ cursor: 'pointer' }}
                    >
                        {l}
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                {isAnswered ? (
                    <span className="inline-block px-4 py-1.5 bg-slate-950 border border-slate-700 text-cyan-400 rounded-md font-mono font-bold text-sm shadow-inner">
                        Punteggio: <span className="text-white">{value}</span>
                    </span>
                ) : (
                    <span className="inline-block px-4 py-1.5 bg-orange-950/30 border border-orange-800/50 text-orange-400 rounded-md font-mono text-xs">
                        Sposta il cursore per rispondere
                    </span>
                )}
            </div>
        </div>
    );
};

export const IppsTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-blue-900/10 rounded-lg border border-blue-500/30">
            <h3 className="text-xl font-bold text-blue-400 mb-3 tracking-wide">IPPS-24</h3>
            <p className="text-sm text-slate-300 mb-4">Pensando alla tua esperienza competitiva, cerca di ricordare con precisione quanto spesso hai sperimentato le situazioni descritte e poi segna un numero da 1 a 6 accanto ad ogni affermazione.</p>
            <div className="text-xs font-mono text-blue-300 grid grid-cols-2 md:grid-cols-3 gap-2">
                {IPPS_SCALES.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {IPPS_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={6} labels={IPPS_SCALES.map(s => s.label)} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const TipiTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-purple-900/10 rounded-lg border border-purple-500/30">
            <h3 className="text-xl font-bold text-purple-400 mb-3 tracking-wide">TIPI (Ten-Item Personality Inventory)</h3>
            <p className="text-sm text-slate-300 mb-4">Le affermazioni che seguono descrivono coppie di tratti della personalità. Pensando alla tua esperienza sportiva, segna un numero da 1 a 7 che indica quanto la coppia di tratti nel suo insieme si applica a te stesso.</p>
            <div className="text-xs font-mono text-purple-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TIPI_SCALES.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {TIPI_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={7} labels={["Fort. dis.", "Mod. dis.", "Un po' dis.", "Né/Né", "Un po' acc.", "Mod. acc.", "Fort. acc."]} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const MisTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-teal-900/10 rounded-lg border border-teal-500/30">
            <h3 className="text-xl font-bold text-teal-400 mb-3 tracking-wide">MIS (Mindfulness Inventory for Sport)</h3>
            <p className="text-sm text-slate-300 mb-4">Pensando alle situazioni di gara, segna un numero da 1 a 6 che corrisponde maggiormente alle tue esperienze.</p>
            <div className="text-xs font-mono text-teal-300 grid grid-cols-2 md:grid-cols-3 gap-2">
                {MIS_SCALES.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {MIS_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={6} labels={MIS_SCALES.map(s => s.label)} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const ErqTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-emerald-900/10 rounded-lg border border-emerald-500/30">
            <h3 className="text-xl font-bold text-emerald-400 mb-3 tracking-wide">ERQ (Emotion Regulation Questionnaire)</h3>
            <p className="text-sm text-slate-300 mb-4">Pensando alla tua esperienza competitiva, cerca di ricordare con precisione quanto ti comporti nel modo descritto e poi segna un numero da 1 a 7 accanto ad ogni affermazione.</p>
            <div className="text-xs font-mono text-emerald-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ERQ_SCALES_EXACT.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {ERQ_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={7} labels={["Compl. dis.", "Fort. dis.", "Mod. dis.", "Né/Né", "Mod. acc.", "Fort. acc.", "Compl. acc."]} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const PpsTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-orange-900/10 rounded-lg border border-orange-500/30">
            <h3 className="text-xl font-bold text-orange-400 mb-3 tracking-wide">PPS-S (Performance Perfectionism Scale)</h3>
            <p className="text-sm text-slate-300 mb-4">Di seguito sono riportate alcune affermazioni che riflettono l'opinione che gli atleti hanno di se stessi rispetto alla loro attività sportiva. Segna un numero da 1 a 7 che indica quanto sei d'accordo.</p>
            <div className="text-xs font-mono text-orange-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PPS_SCALES.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {PPS_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={7} labels={["Compl. dis.", "Fort. dis.", "Mod. dis.", "Né/Né", "Mod. acc.", "Fort. acc.", "Compl. acc."]} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const CfqTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-cyan-900/10 rounded-lg border border-cyan-500/30">
            <h3 className="text-xl font-bold text-cyan-400 mb-3 tracking-wide">CFQ (Coping Function Questionnaire)</h3>
            <p className="text-sm text-slate-300 mb-4">Sono descritte delle strategie che gli atleti possono usare per far fronte a situazioni stressanti in gara. Segna un numero da 1 a 5 che indica quanto utilizzi la strategia descritta.</p>
            <div className="text-xs font-mono text-cyan-300 grid grid-cols-2 gap-2">
                {CFQ_SCALES.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {CFQ_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={5} labels={CFQ_SCALES.map(s => s.label)} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const BnsssTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-lime-900/10 rounded-lg border border-lime-500/30">
            <h3 className="text-xl font-bold text-lime-400 mb-3 tracking-wide">BNSSS (Basic Needs Satisfaction in Sport)</h3>
            <p className="text-sm text-slate-300 mb-4">Pensando alla tua esperienza sportiva, segna un numero da 1 a 7 che indica quanto sei d'accordo con ciascuna affermazione.</p>
            <div className="text-xs font-mono text-lime-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BNSSS_SCALES.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {BNSSS_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={7} labels={["Compl. dis.", "Fort. dis.", "Mod. dis.", "Né/Né", "Mod. acc.", "Fort. acc.", "Compl. acc."]} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const SeqTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-pink-900/10 rounded-lg border border-pink-500/30">
            <h3 className="text-xl font-bold text-pink-400 mb-3 tracking-wide">SEQ (Sport Emotion Questionnaire)</h3>
            <p className="text-sm text-slate-300 mb-4">Sono riportate sequenze di emozioni che gli atleti percepiscono in relazione alla loro prestazione. Pensando ad una tua prossima competizione importante, segna un numero da 0 a 4 che indica come ti senti.</p>
            <div className="text-xs font-mono text-pink-300 flex flex-wrap gap-4">
                {SEQ_SCALES.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {SEQ_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={0} max={4} labels={SEQ_SCALES.map(s => s.label)} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const MtsTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-blue-900/10 rounded-lg border border-blue-500/30">
            <h3 className="text-xl font-bold text-blue-400 mb-3 tracking-wide">Mental Toughness (MTS)</h3>
            <p className="text-sm text-slate-300 mb-4">Per favore, leggi le seguenti affermazioni e indica quanto sei d'accordo con ciascuna segnando un numero da 1 a 5.</p>
            <div className="text-xs font-mono text-blue-300 grid grid-cols-5 gap-2">
                <div>1 = Falso</div><div>2 = Quasi falso</div><div>3 = Dipende</div><div>4 = Quasi vero</div><div>5 = Vero</div>
            </div>
        </div>
        {MTS_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={5} labels={["Falso", "Quasi falso", "Dipende", "Quasi vero", "Vero"]} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const CtTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-red-900/10 rounded-lg border border-red-500/30">
            <h3 className="text-xl font-bold text-red-400 mb-3 tracking-wide">Sfida e Minaccia (CT)</h3>
            <p className="text-sm text-slate-300 mb-4">Leggi attentamente ogni affermazione ed indica quanto sei d'accordo su una scala da 1 (Per niente) a 5 (Moltissimo).</p>
            <div className="text-xs font-mono text-red-300 grid grid-cols-5 gap-2">
                <div>1 = Per niente</div><div>2 = Un po'</div><div>3 = Moderatamente</div><div>4 = Molto</div><div>5 = Moltissimo</div>
            </div>
        </div>
        {CT_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={5} labels={["Per niente", "Un po'", "Mod.", "Molto", "Moltissimo"]} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const TeiqueTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-indigo-900/10 rounded-lg border border-indigo-500/30">
            <h3 className="text-xl font-bold text-indigo-400 mb-3 tracking-wide">TEIQue-SF (Intelligenza Emotiva)</h3>
            <p className="text-sm text-slate-300 mb-4">Leggi ogni affermazione e scegli il numero che meglio riflette il tuo livello di accordo.</p>
            <div className="text-xs font-mono text-indigo-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TEIQUE_SCALES.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {TEIQUE_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={7} labels={["Compl. dis.", "Fort. dis.", "Un po' dis.", "Né/Né", "Un po' acc.", "Fort. acc.", "Compl. acc."]} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const MaiaTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-yellow-900/10 rounded-lg border border-yellow-500/30">
            <h3 className="text-xl font-bold text-yellow-500 mb-3 tracking-wide">MAIA (Consapevolezza Interocettiva)</h3>
            <p className="text-sm text-slate-300 mb-4">Indica quanto spesso ciascuna affermazione si riferisce a te nella vita quotidiana.</p>
            <div className="text-xs font-mono text-yellow-300 grid grid-cols-2 md:grid-cols-3 gap-2">
                {MAIA_SCALES.map(s => <div key={s.value}>{s.value} = {s.label}</div>)}
            </div>
        </div>
        {MAIA_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={0} max={5} labels={MAIA_SCALES.map(s => s.label)} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);

export const PassionTab: React.FC<TabProps> = ({ data, onChange }) => (
    <div className="space-y-4">
        <div className="mb-6 p-6 bg-rose-900/10 rounded-lg border border-rose-500/30">
            <h3 className="text-xl font-bold text-rose-400 mb-3 tracking-wide">Passion Scale (Passione per lo Sport)</h3>
            <p className="text-sm text-slate-300 mb-1 font-semibold">Lo sport che pratico: <span className="text-white font-bold">________________</span></p>
            <p className="text-sm text-slate-300 mb-4">Pensando alle tue esperienze relative al tuo sport, per ciascuna affermazione scegli la voce che meglio corrisponde alle tue sensazioni.</p>
            <div className="text-xs font-mono text-rose-300 grid grid-cols-5 gap-2">
                {PASSION_SCALES.map(s => <div key={s.value} className="text-center">{s.value} = {s.label}</div>)}
            </div>
        </div>
        {PASSION_ITEMS.map((item, index) => (
            <SliderItem key={index} label={item} value={data[index]} min={1} max={5} labels={PASSION_SCALES.map(s => s.label)} onChange={(val) => onChange(index, val)} />
        ))}
    </div>
);