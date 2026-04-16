import React from 'react';
import { User, Trophy, Calendar, Zap, Mail, Phone, CalendarDays } from 'lucide-react';
import { AthleteProfile } from '../types';
import { DISCIPLINES } from '../constants';

interface SidebarProps {
    profile: AthleteProfile;
    onChange: (field: keyof AthleteProfile, value: string | number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ profile, onChange }) => {
    // Formattazione data italiana: es. 24/10/2023
    const today = new Date().toLocaleDateString('it-IT');

    return (
        <aside className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex-shrink-0 min-h-screen shadow-2xl z-20">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-yellow-400 p-2 rounded-lg text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.4)]">
                         <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">FLUX</h1>
                        <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Assessment</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">System Architects</p>
                    <div className="flex flex-col gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] hover:drop-shadow-[0_0_12px_rgba(34,211,238,1)] transition-all cursor-default">
                            Massimiliano Di Liborio
                        </span>
                        <span className="font-mono text-xs font-bold text-purple-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] hover:drop-shadow-[0_0_12px_rgba(168,85,247,1)] transition-all cursor-default">
                            Claudio Robazza
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                <div>
                    <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User size={14} />
                        Anagrafica Atleta
                    </h2>
                    
                    <div className="space-y-5">
                        {/* Campo Data Automatico */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Data Compilazione</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-2.5 text-cyan-600" size={18} />
                                <input
                                    type="text"
                                    value={today}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 font-mono text-sm cursor-not-allowed select-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Nome e Cognome *</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => onChange('name', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
                                placeholder="Es. Mario Rossi"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Disciplina</label>
                            <div className="relative">
                                <Trophy className="absolute left-3 top-2.5 text-slate-600" size={18} />
                                <input
                                    type="text"
                                    list="disciplines-options"
                                    value={profile.discipline}
                                    onChange={(e) => onChange('discipline', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                    placeholder="Seleziona..."
                                />
                                <datalist id="disciplines-options">
                                    {DISCIPLINES.filter(d => d !== "Altro").map(d => (
                                        <option key={d} value={d} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Anni di Pratica</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-slate-600" size={18} />
                                <input
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={profile.yearsOfPractice}
                                    onChange={(e) => onChange('yearsOfPractice', parseInt(e.target.value) || 0)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-slate-600" size={18} />
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => onChange('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                    placeholder="email@esempio.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Telefono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-slate-600" size={18} />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => onChange('phone', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                    placeholder="+39 ..."
                                />
                            </div>
                            <p className="text-xs text-slate-600 mt-2 italic">* Email o Telefono obbligatori</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                    <h3 className="text-cyan-400 font-bold mb-2 text-xs uppercase">Info</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                        Compila le sezioni nel pannello principale. I dati vengono salvati in sicurezza.
                    </p>
                </div>
            </div>
        </aside>
    );
};