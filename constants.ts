import { PesdItem } from './types';

export const DISCIPLINES = ["Carabina", "Pistola", "Bersaglio Mobile", "Altro"];

// ==========================================
// 1. IPPS-24
// ==========================================
export const IPPS_ITEMS = [
    "1. In allenamento mi esercito a creare situazioni di impegno e tensione simili a quelle di gara",
    "2. Mi dico mentalmente frasi di incoraggiamento",
    "3. Quando gareggio sono preoccupato di commettere errori o di fallire",
    "4. Sono completamente fiducioso di poter rendere al meglio",
    "5. Quotidianamente o settimanalmente stabilisco obiettivi molto specifici che guidano le mie azioni",
    "6. Quando mi sento troppo teso sono in grado di rilassarmi rapidamente e di ritrovare la calma",
    "7. Sono capace di rivedermi mentalmente, come in un filmato, mentre mi esercito o gareggio",
    "8. Pensieri distraenti mi passano per la mente quando sono in gara",
    "9. Mi alleno cercando di riprodurre la tensione della competizione",
    "10. Mi ripeto mentalmente frasi che mi aiutano a controllare la tensione",
    "11. Mi preoccupo molto di commettere errori",
    "12. Sono molto fiducioso nelle mie doti competitive",
    "13. Stabilisco obiettivi a lungo termine ed un piano per conseguirli",
    "14. Quando voglio riesco a rilassarmi e a controllare le emozioni",
    "15. Riesco a \"vedere mentalmente\" la mia prestazione anche nei minimi dettagli",
    "16. In gara non riesco a focalizzare interamente l'attenzione su ciò che sto facendo",
    "17. In allenamento mi impegno per ricercare le condizioni di tensione e difficoltà della gara",
    "18. Durante la gara mi ripeto frasi ben precise per concentrarmi",
    "19. Mi preoccupo molto quando in gara commetto un errore",
    "20. In gara riesco a mantenere alta la fiducia in me stesso",
    "21. Programmo accuratamente come raggiungere i miei obiettivi",
    "22. Sono capace di rilassarmi e controllare la tensione quando serve",
    "23. Trovo facile ripetere mentalmente l'intera prestazione o singole parti",
    "24. Durante la prestazione la mia attenzione sembra fluttuare fra ciò che sto facendo ed altre cose che non hanno nulla a che fare con la prestazione"
];
export const IPPS_SCALES = [
    { value: 1, label: 'Mai' }, { value: 2, label: 'Quasi mai' }, { value: 3, label: 'Qualche volta' }, 
    { value: 4, label: 'Spesso' }, { value: 5, label: 'Quasi sempre' }, { value: 6, label: 'Sempre' }
];

// ==========================================
// 2. TIPI
// ==========================================
export const TIPI_ITEMS = [
    "1. Estroverso, entusiasta",
    "2. Critico, polemico",
    "3. Affidabile, autodisciplinato",
    "4. Ansioso, emotivamente instabile",
    "5. Aperto a nuove esperienze, curioso",
    "6. Riservato, tranquillo",
    "7. Empatico, cordiale",
    "8. Disorganizzato, negligente",
    "9. Calmo, emotivamente stabile",
    "10. Convenzionale, poco creativo"
];
export const TIPI_SCALES = [
    { value: 1, label: 'Fortemente in disaccordo' }, { value: 2, label: 'Moderatamente in disaccordo' },
    { value: 3, label: 'Un po\' in disaccordo' }, { value: 4, label: 'Né d\'accordo né in disaccordo' },
    { value: 5, label: 'Un po\' d\'accordo' }, { value: 6, label: 'Moderatamente d\'accordo' },
    { value: 7, label: 'Fortemente d\'accordo' }
];

// ==========================================
// 3. MIS
// ==========================================
export const MIS_ITEMS = [
    "1. Sono consapevole dei pensieri che mi passano per la mente",
    "2. Quando mi rendo conto che non sono concentrato sulla mia prestazione, mi rimprovero per essermi distratto",
    "3. Anche quando mi rendo conto di essere \"gasato\" perché sto vincendo, rimango concentrato su quello che devo fare",
    "4. Sono capace di percepire l'intensità della tensione nel mio corpo",
    "5. Quando mi rendo conto che sto già pensando al risultato finale, mi rimprovero per non essere concentrato sugli aspetti importanti di quello che sto facendo",
    "6. Quando mi rendo conto di essere teso, sono in grado di riportare rapidamente la mia attenzione su quello su cui mi devo concentrare",
    "7. Porto attenzione al tipo di emozioni che sto percependo",
    "8. Quando mi rendo conto che sono molto arrabbiato perché sto perdendo, critico la mia reazione",
    "9. Quando mi rendo conto che non mi sto concentrando sulla mia prestazione, sono in grado di rifocalizzare rapidamente l'attenzione su ciò che mi aiuta ad eseguire bene"
];
export const MIS_SCALES = [
    { value: 1, label: 'No, per niente' }, { value: 2, label: 'Molto poco' }, { value: 3, label: 'Poco' },
    { value: 4, label: 'Abbastanza' }, { value: 5, label: 'Molto' }, { value: 6, label: 'Sì, moltissimo' }
];

// ==========================================
// 4. ERQ
// ==========================================
export const ERQ_ITEMS = [
    "1. Tengo i miei sentimenti per me",
    "2. Per non starci male (ad esempio, essere triste/in collera/di cattivo umore), cerco di guardare le cose da una prospettiva diversa",
    "3. Quando sono contento/felice, cerco di non farlo notare",
    "4. Cambiare il modo di pensare ad una situazione, mi aiuta a sentirmi meglio",
    "5. Controllo le mie emozioni non esprimendole",
    "6. Cambiare il modo di pensare ad una situazione, mi aiuta a non starci male"
];
export const ERQ_SCALES = TIPI_SCALES; // 1-7 scale come TIPI, ma labels: 1=Completamente in disaccordo, 2=Fortemente in disaccordo, 3=Moderatamente in disaccordo, 4=Né, 5=Moderatamente, 6=Fortemente, 7=Completamente
export const ERQ_SCALES_EXACT = [
    { value: 1, label: 'Completamente in disaccordo' }, { value: 2, label: 'Fortemente in disaccordo' },
    { value: 3, label: 'Moderatamente in disaccordo' }, { value: 4, label: 'Né d\'accordo né in disaccordo' },
    { value: 5, label: 'Moderatamente d\'accordo' }, { value: 6, label: 'Fortemente d\'accordo' },
    { value: 7, label: 'Completamente d\'accordo' }
];

// ==========================================
// 5. PPS-S
// ==========================================
export const PPS_ITEMS = [
    "1. Sono severo con me stesso quando la mia prestazione non è perfetta",
    "2. Non importa quanto buona sia la mia prestazione, le persone si aspettano da me sempre di più",
    "3. Ho un'opinione bassa degli altri quando la loro prestazione non è perfetta",
    "4. Metto pressione su me stesso per fare una prestazione perfetta",
    "5. La gente vede in modo negativo anche le mie migliori prestazioni",
    "6. Penso male degli altri quando non fanno una prestazione perfetta",
    "7. Penso a me stesso in modo positivo solo quando la mia prestazione è perfetta",
    "8. Le persone mi criticano se la mia prestazione non è perfetta",
    "9. Critico gli altri se la loro prestazione non è perfetta"
];
export const PPS_SCALES = ERQ_SCALES_EXACT;

// ==========================================
// 6. CFQ
// ==========================================
export const CFQ_ITEMS = [
    "1. Faccio del mio meglio per cambiare la situazione stressante",
    "2. Controllo le mie emozioni per affrontare al meglio la situazione stressante",
    "3. Cerco di prendere le distanze dal problema per evitare la situazione stressante",
    "4. Mi impegno per risolvere il problema o per cambiare la situazione",
    "5. Mi impegno nel controllare le mie emozioni",
    "6. Cerco di evitare la situazione per ridurre lo stress",
    "7. Affronto la situazione stressante e cerco di cambiarla",
    "8. Cerco di modificare le mie emozioni per sentirmi meglio",
    "9. Cerco di uscire dalla situazione il prima possibile per ridurre lo stress"
];
export const CFQ_SCALES = [
    { value: 1, label: 'No, per niente' }, { value: 2, label: 'Poco' }, { value: 3, label: 'Abbastanza' },
    { value: 4, label: 'Molto' }, { value: 5, label: 'Sì, moltissimo' }
];

// ==========================================
// 7. BNSSS
// ==========================================
export const BNSSS_ITEMS = [
    "1. Nel mio sport ho la possibilità di prendere decisioni riguardanti il mio programma di allenamento",
    "2. Nel mio sport spesso non mi sento molto competente",
    "3. Nel mio sport le persone con cui interagisco mi sono molto simpatiche",
    "4. Nel mio sport prendo parte alla progettazione del mio programma di allenamento",
    "5. Nel mio sport non ho molte possibilità di dimostrare effettivamente ciò di cui sono capace",
    "6. Nel mio sport vado d'accordo con le persone con le quali interagisco",
    "7. Nel mio sport posso esprimere la mia opinione per quanto riguarda il mio programma di allenamento",
    "8. Nel mio sport spesso non mi sento capace di fare buone prestazioni",
    "9. Nel mio sport considero le persone con le quali interagisco regolarmente come mie amiche"
];
export const BNSSS_SCALES = ERQ_SCALES_EXACT;

// ==========================================
// 8. SEQ
// ==========================================
export const SEQ_ITEMS = [
    "1. Inquieto, Teso, Nervoso, Preoccupato, Ansioso",
    "2. Avvilito, Triste, Infelice, Deluso, Demoralizzato",
    "3. Euforico, Eccitato, Entusiasta, Energico",
    "4. Irritato, Furioso, Infastidito, Arrabbiato",
    "5. Contento, Gioioso, Felice, Allegro"
];
export const SEQ_SCALES = [
    { value: 0, label: 'Per nulla' }, { value: 1, label: 'Un po\'' }, { value: 2, label: 'Abbastanza' },
    { value: 3, label: 'Molto' }, { value: 4, label: 'Moltissimo' }
];

// ==========================================
// MTS
// ==========================================
export const MTS_ITEMS = [
    "1. Ho un concetto di me stesso che mi fa credere di poter ottenere qualsiasi cosa mi prefiggo",
    "2. Dopo un successo, so quando smettere di compiacermi per concentrarmi sulla prossima sfida",
    "3. Quando sento che posso vincere, una spinta interna mi rende capace di approfittare del momento",
    "4. So cosa bisogna fare per realizzare quello che è necessario per vincere",
    "5. Ho la pazienza e la disciplina per gestire l'impegno necessario per raggiungere tutti gli obiettivi",
    "6. Anche se sono stanco, continuo ad allenarmi per raggiungere il mio obiettivo",
    "7. Riesco a sfruttare a mio vantaggio tutti gli aspetti di un contesto di allenamento molto difficile",
    "8. Sono in grado di aumentare il mio impegno quando è necessario per vincere",
    "9. Quando c'è un ostacolo sulla mia strada, trovo un modo per superarlo",
    "10. Accetto persino volentieri anche gli aspetti dell'allenamento che sono considerati dolorosi",
    "11. Ci metto il massimo impegno per raggiungere il mio obiettivo fino a quando c'è la possibilità di successo"
];

// ==========================================
// CT
// ==========================================
export const CT_ITEMS = [
    "1. Considero la competizione una sfida positiva",
    "2. Penso spesso a cosa potrebbe accadere se la mia prestazione in gara fosse scadente",
    "3. Vedo la competizione come una minaccia",
    "4. Non vedo l'ora che la sfida competitiva abbia inizio",
    "5. Credo che la competizione possa avere per me conseguenze positive",
    "6. Penso che la competizione possa essere per me una minaccia",
    "7. La competizione mi fa paura",
    "8. Penso che la competizione rappresenti per me una sfida positiva",
    "9. Credo che la competizione possa avere per me conseguenze negative",
    "10. Penso spesso a cosa potrebbe succedere se la mia prestazione in gara fosse buona"
];

export const CT_SUBSCALES = {
    challenge: [0, 3, 4, 7, 9], // Items 1, 4, 5, 8, 10
    threat: [1, 2, 5, 6, 8]     // Items 2, 3, 6, 7, 9
};

// ==========================================
// 9. PESD
// ==========================================
export const PESD_ITEMS: PesdItem[] = [
    { left: "Infelice", right: "Felice" },
    { left: "Sfiduciato", right: "Fiducioso" },
    { left: "Preoccupato in modo dannoso", right: "Preoccupato in modo utile" },
    { left: "Remissivo", right: "Combattivo" },
    { left: "Distratto", right: "Vigile" },
    { left: "Fisicamente debole", right: "Fisicamente vigoroso" },
    { left: "Scoordinato nei movimenti", right: "Coordinato nei movimenti" },
    { left: "Inefficace nella mia prestazione", right: "Efficace nella mia prestazione" },
    { left: "Essere comunicativo mi danneggia", right: "Essere comunicativo mi è utile" },
    { left: "Mi sento ignorato", right: "Mi sento considerato" },
    { left: "Triste", right: "Gioioso" },
    { left: "Insicuro", right: "Sicuro" },
    { left: "Mentalmente teso in modo dannoso", right: "Mentalmente teso in modo utile" },
    { left: "Fragile", right: "Grintoso" },
    { left: "Deconcentrato", right: "Concentrato" },
    { left: "Fisicamente affaticato", right: "Pieno di energia" },
    { left: "Inerte nei movimenti", right: "Dinamico nei movimenti" },
    { left: "Scadente nella mia prestazione", right: "Abile nella mia prestazione" },
    { left: "Essere espansivo mi danneggia", right: "Essere espansivo mi è utile" },
    { left: "Mi sento trascurato", right: "Mi sento supportato" },
    { left: "Avvilito", right: "Allegro" },
    { left: "Incerto", right: "Certo" },
    { left: "Nervoso in modo dannoso", right: "Nervoso in modo utile" },
    { left: "Arrendevole", right: "Agguerrito" },
    { left: "Disattento", right: "Attento" },
    { left: "Fisicamente scarico", right: "Fisicamente carico" },
    { left: "Goffo nei movimenti", right: "Fluido nei movimenti" },
    { left: "Instabile nella mia prestazione", right: "Stabile nella mia prestazione" },
    { left: "Essere socievole mi danneggia", right: "Essere socievole mi è utile" },
    { left: "Mi sento rifiutato", right: "Mi sento accettato" },
];

export const PESD_CATEGORIES = [
    "Emozioni", "Fiducia", "Ansia", "Assertività", "Aspetti Cognitivi",
    "Aspetti Somatici", "Aspetti Motori", "Prestazione", "Comunicazione", "Sostegno Sociale"
];

export const QUESTIONNAIRE_MAP: Record<string, { label: string; itemCount: number; dbKey: string }> = {
    'IPPS': { label: 'IPPS-24', itemCount: 24, dbKey: 'ipps' },
    'TIPI': { label: 'TIPI', itemCount: 10, dbKey: 'tipi' },
    'MIS': { label: 'MIS', itemCount: 9, dbKey: 'mis' },
    'ERQ': { label: 'ERQ', itemCount: 6, dbKey: 'erq' },
    'PPS': { label: 'PPS-S', itemCount: 9, dbKey: 'pps' },
    'CFQ': { label: 'CFQ', itemCount: 9, dbKey: 'cfq' },
    'BNSSS': { label: 'BNSSS', itemCount: 9, dbKey: 'bnsss' },
    'SEQ': { label: 'SEQ', itemCount: 5, dbKey: 'seq' },
    'MTS': { label: 'MTS', itemCount: 11, dbKey: 'mts' },
    'CT': { label: 'C&T', itemCount: 10, dbKey: 'ct' },
    'PESD': { label: 'PESD', itemCount: 30, dbKey: 'pesd' },
};