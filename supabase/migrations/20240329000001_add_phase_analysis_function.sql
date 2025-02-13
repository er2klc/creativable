
-- Create the function to handle phase analysis creation in a transaction
create or replace function create_phase_analysis(
  p_lead_id uuid,
  p_phase_id uuid,
  p_user_id uuid,
  p_content text,
  p_analysis_type text,
  p_metadata jsonb
) returns table (
  id uuid,
  lead_id uuid,
  phase_id uuid,
  content text,
  analysis_type text,
  metadata jsonb,
  completed boolean,
  completed_at timestamp with time zone,
  created_at timestamp with time zone
) language plpgsql security definer as $$
declare
  v_note_id uuid;
  v_analysis_id uuid;
begin
  -- Start transaction
  begin
    -- Create timeline note
    insert into notes (
      lead_id,
      user_id,
      content,
      metadata
    ) values (
      p_lead_id,
      p_user_id,
      p_content,
      jsonb_build_object(
        'type', 'phase_analysis',
        'phase', jsonb_build_object(
          'id', p_phase_id,
          'name', (select name from pipeline_phases where id = p_phase_id)
        ),
        'timestamp', now(),
        'analysis_type', p_analysis_type
      )
    ) returning id into v_note_id;

    -- Create phase analysis
    insert into phase_based_analyses (
      lead_id,
      phase_id,
      analysis_type,
      content,
      metadata,
      completed,
      completed_at
    ) values (
      p_lead_id,
      p_phase_id,
      p_analysis_type,
      p_content,
      p_metadata,
      true,
      now()
    ) returning id into v_analysis_id;

    -- Return the created analysis
    return query
    select *
    from phase_based_analyses
    where id = v_analysis_id;
    
  exception
    when unique_violation then
      -- If we hit a unique violation, rollback and return existing analysis
      rollback;
      return query
      select *
      from phase_based_analyses
      where lead_id = p_lead_id
      and phase_id = p_phase_id;
  end;
end;
$$;
