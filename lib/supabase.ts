import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// ⚙️ CONFIGURAZIONE DATABASE
// ==============================================================================

// Helper per leggere le variabili d'ambiente in modo sicuro
const getEnv = () => {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        return import.meta.env;
    }
    return {};
};

const env = getEnv();

// 1. URL DEL PROGETTO
// Cerca prima nella variabile d'ambiente di Vercel, altrimenti usa il valore di default
const SUPABASE_URL = env.VITE_SUPABASE_URL || "";

// 2. CHIAVE DI SICUREZZA (ANON KEY)
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || "";

// ==============================================================================

// Verifica configurazione
const isConfigured = SUPABASE_URL && SUPABASE_URL.startsWith('http') && 
                     SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 30 && 
                     !SUPABASE_ANON_KEY.includes("INCOLLA_QUI");

let supabaseClient;

if (isConfigured) {
    // Connessione Reale a Supabase
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Connesso a Supabase con successo! URL:", SUPABASE_URL);
} else {
    // MODALITÀ DEMO / OFFLINE
    console.log("⚠️ Modalità Offline/Demo attivata. Uso LocalStorage per evitare errori di rete.");
    if (SUPABASE_URL && !isConfigured) {
         console.warn("⚠️ Credenziali Supabase incomplete o non valide. Passaggio automatico a LocalStorage.");
    }
    
    // --- MOCK IMPLEMENTATION (LocalStorage) ---
    const STORAGE_KEY = 'flux_assessments_db_local_v1';
    
    const getLocalData = () => {
        try {
            const str = localStorage.getItem(STORAGE_KEY);
            return str ? JSON.parse(str) : [];
        } catch (e) { 
            console.error("Error reading local storage", e);
            return []; 
        }
    };

    const saveLocalData = (data: any[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Error saving to local storage", e);
        }
    };

    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    supabaseClient = {
        from: (table: string) => {
            return {
                select: () => ({
                    order: (col: string, { ascending }: any = { ascending: true }) => {
                        const data = getLocalData();
                        data.sort((a: any, b: any) => ascending ? (a[col] > b[col] ? 1 : -1) : (a[col] < b[col] ? 1 : -1));
                        return Promise.resolve({ data, error: null });
                    }
                }),
                insert: (recordOrRecords: any) => {
                    const records = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];
                    const newRecords = records.map((r: any) => ({
                        id: generateId(),
                        created_at: new Date().toISOString(),
                        ...r
                    }));
                    saveLocalData([...getLocalData(), ...newRecords]);
                    return Promise.resolve({ data: newRecords, error: null });
                },
                delete: () => ({
                    eq: (col: string, val: any) => {
                        const data = getLocalData().filter((item: any) => item[col] !== val);
                        saveLocalData(data);
                        return Promise.resolve({ error: null });
                    }
                })
            };
        },
        // Stub auth: nessun backend reale in modalità demo/offline, ma evita
        // che la dashboard vada in crash chiamando supabase.auth.* su undefined.
        auth: {
            signInWithPassword: (_credentials: { email: string; password: string }) => {
                return Promise.resolve({
                    data: { session: null, user: null },
                    error: { message: "Autenticazione non disponibile in modalità demo/offline." }
                });
            },
            signOut: () => Promise.resolve({ error: null }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: (_callback: (event: string, session: any) => void) => {
                return { data: { subscription: { unsubscribe: () => {} } } };
            }
        }
    } as any;
}

export const getEnvVar = (key: string): string => {
    if (key === 'VITE_SUPABASE_URL') return SUPABASE_URL;
    if (key === 'VITE_SUPABASE_ANON_KEY') return SUPABASE_ANON_KEY;
    return '';
};

export const supabase = supabaseClient;