
-- Überprüfen und löschen bestehender Constraints, falls vorhanden
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'phase_based_analyses') THEN
        ALTER TABLE IF EXISTS public.phase_based_analyses 
        DROP CONSTRAINT IF EXISTS phase_based_analyses_lead_id_fkey,
        DROP CONSTRAINT IF EXISTS phase_based_analyses_phase_id_fkey,
        DROP CONSTRAINT IF EXISTS phase_based_analyses_created_by_fkey;
    END IF;
END $$;

-- Tabelle neu erstellen oder aktualisieren
CREATE TABLE IF NOT EXISTS public.phase_based_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    phase_id UUID NOT NULL REFERENCES public.pipeline_phases(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    analysis_type TEXT DEFAULT 'phase_analysis',
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(lead_id, phase_id, created_by)
);

-- RLS Policies
ALTER TABLE public.phase_based_analyses ENABLE ROW LEVEL SECURITY;

-- Bestehende Policies löschen
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.phase_based_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.phase_based_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.phase_based_analyses;

-- Neue Policies erstellen
CREATE POLICY "Users can view their own analyses"
    ON public.phase_based_analyses
    FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own analyses"
    ON public.phase_based_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own analyses"
    ON public.phase_based_analyses
    FOR UPDATE
    USING (auth.uid() = created_by);

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_phase_analyses_lead_phase 
    ON public.phase_based_analyses(lead_id, phase_id);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_phase_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_phase_analyses_timestamp 
    ON public.phase_based_analyses;

CREATE TRIGGER update_phase_analyses_timestamp
    BEFORE UPDATE ON public.phase_based_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_phase_analyses_updated_at();

-- Kommentare hinzufügen
COMMENT ON TABLE public.phase_based_analyses IS 'Speichert KI-generierte Analysen für Phasen von Leads';
COMMENT ON COLUMN public.phase_based_analyses.lead_id IS 'Referenz zum analysierten Lead';
COMMENT ON COLUMN public.phase_based_analyses.phase_id IS 'Referenz zur Phase, für die die Analyse erstellt wurde';
COMMENT ON COLUMN public.phase_based_analyses.created_by IS 'Benutzer, der die Analyse erstellt hat';
COMMENT ON COLUMN public.phase_based_analyses.metadata IS 'JSON mit zusätzlichen Analysedaten wie Zusammenfassung, Kernpunkte etc.';
