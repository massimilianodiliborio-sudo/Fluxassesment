-- ============================================================
-- FLUX Assessment - Migration: Create assessments table
-- ============================================================
-- This migration creates the main assessments table with all
-- questionnaire columns including TEIQue-SF, MAIA, and Passion Scale.
--
-- NOTE: this file is documentation of the intended schema/policies,
-- it is not executed automatically by anything. The live database
-- was created before consent_given/consent_at existed and before
-- the SELECT/DELETE policies were moved to `authenticated`; those
-- changes must be applied by hand via migrations_da_eseguire.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS assessments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Athlete Profile
    athlete_name        TEXT NOT NULL,
    discipline          TEXT,
    years_of_practice   INTEGER DEFAULT 0,
    email               TEXT,
    phone               TEXT,

    -- Questionnaire 1: IPPS-24 (24 items, scale 1-6)
    ipps        INTEGER[],

    -- Questionnaire 2: TIPI (10 items, scale 1-7)
    tipi        INTEGER[],

    -- Questionnaire 3: MIS (9 items, scale 1-6)
    mis         INTEGER[],

    -- Questionnaire 4: ERQ (6 items, scale 1-7)
    erq         INTEGER[],

    -- Questionnaire 5: PPS-S (9 items, scale 1-7)
    pps         INTEGER[],

    -- Questionnaire 6: CFQ (9 items, scale 1-5)
    cfq         INTEGER[],

    -- Questionnaire 7: BNSSS (9 items, scale 1-7)
    bnsss       INTEGER[],

    -- Questionnaire 8: SEQ (5 items, scale 0-4)
    seq         INTEGER[],

    -- Questionnaire 9: MTS (11 items, scale 1-5)
    mts         INTEGER[],

    -- Questionnaire 10: CT (10 items, scale 1-5)
    ct          INTEGER[],

    -- Questionnaire 11: PESD-Sport (30 items, scale -4 to +4)
    pesd        INTEGER[],

    -- Questionnaire 12: TEIQue-SF (30 items, scale 1-7)
    -- Trait Emotional Intelligence Questionnaire - Short Form
    -- Subscales: Benessere, Autocontrollo, Emotività, Socievolezza, IE Globale
    -- Reverse items (1-indexed): 2,4,5,7,8,10,12,13,14,16,18,22,25,26,28
    teique      INTEGER[],

    -- Questionnaire 13: MAIA (32 items, scale 0-5)
    -- Multidimensional Assessment of Interoceptive Awareness
    -- Subscales: Noticing, Not-Distracting, Not-Worrying, Attention Regulation,
    --            Emotional Awareness, Self-Regulation, Body Listening, Trusting
    -- Reverse items (1-indexed): 5,6,7,8,9
    maia        INTEGER[],

    -- Questionnaire 14: Passion Scale (12 items, scale 1-5)
    -- Subscales: Passione Armoniosa, Passione Ossessiva
    -- No reverse items
    passion     INTEGER[],

    -- GDPR consent (art. 9): given by the athlete before submitting
    consent_given   BOOLEAN,
    consent_at      TIMESTAMPTZ
);

-- Enable Row Level Security (recommended for Supabase)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (athletes submitting questionnaires, no login)
CREATE POLICY "Allow anonymous inserts" ON assessments
    FOR INSERT TO anon WITH CHECK (true);

-- Policy: Allow authenticated reads (psychologist dashboard, logged in via Supabase Auth)
CREATE POLICY "Allow authenticated reads" ON assessments
    FOR SELECT TO authenticated USING (true);

-- Policy: Allow authenticated deletes (psychologist dashboard, logged in via Supabase Auth)
CREATE POLICY "Allow authenticated deletes" ON assessments
    FOR DELETE TO authenticated USING (true);

-- Index on athlete name for search
CREATE INDEX IF NOT EXISTS idx_assessments_athlete_name ON assessments (athlete_name);

-- Index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments (created_at DESC);
