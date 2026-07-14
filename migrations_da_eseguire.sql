-- ============================================================
-- FLUX Assessment — Migrazioni da eseguire manualmente
-- nel SQL Editor di Supabase.
--
-- NON viene eseguito automaticamente da nessun deploy: è un
-- file di testo da lanciare a mano, nell'ordine in cui compare.
--
-- ORDINE DI DEPLOY OBBLIGATORIO (vedi anche messaggio finale):
--   1. Creare l'utente psicologo in Supabase Auth (dashboard Supabase).
--   2. Deploy del codice (push + build Vercel).
--   3. Verificare che il login con Supabase Auth funzioni.
--   4. SOLO A QUEL PUNTO eseguire questo file.
-- Se si esegue questo file (in particolare il DROP delle policy)
-- PRIMA che il nuovo login funzioni, l'accesso alla dashboard resta
-- bloccato per chiunque — non c'è più alcun modo di autenticarsi
-- con la vecchia password finché il passo 3 non è verificato.
-- ============================================================


-- ------------------------------------------------------------
-- 1) Colonne per il consenso GDPR (additive, non distruttive)
--    I record esistenti avranno consent_given/consent_at = NULL:
--    accettabile, sono compilazioni precedenti all'introduzione
--    del consenso esplicito in-app.
-- ------------------------------------------------------------
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS consent_given BOOLEAN;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;


-- ------------------------------------------------------------
-- 2) Chiusura della falla RLS: SELECT e DELETE erano concesse
--    al ruolo `anon` (chiunque avesse la anon key pubblica del
--    bundle JS poteva leggere e cancellare tutti i record).
--    Vanno ricreate sul ruolo `authenticated`, così solo chi ha
--    fatto login con Supabase Auth (lo psicologo) può leggerle
--    o cancellarle.
--
--    La policy di INSERT su `anon` NON viene toccata: gli atleti
--    devono continuare a poter inviare il questionario senza login.
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Allow authenticated reads" ON assessments;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON assessments;

CREATE POLICY "Allow authenticated reads" ON assessments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated deletes" ON assessments
    FOR DELETE TO authenticated USING (true);

-- Verifica manuale consigliata dopo l'esecuzione (solo lettura):
-- SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'assessments';
-- Ci si aspetta:
--   "Allow anonymous inserts"    | {anon}          | INSERT   (invariata)
--   "Allow authenticated reads"  | {authenticated} | SELECT   (nuova)
--   "Allow authenticated deletes"| {authenticated} | DELETE   (nuova)
