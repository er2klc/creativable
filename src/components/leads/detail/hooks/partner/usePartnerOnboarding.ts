import { supabase } from "@/integrations/supabase/client";

export const handlePartnerOnboarding = async (leadId: string) => {
  try {
    // Check for existing progress
    const { data: existingProgress, error: progressCheckError } = await supabase
      .from('partner_onboarding_progress')
      .select('*')
      .eq('lead_id', leadId)
      .maybeSingle();

    if (progressCheckError) {
      console.error('Error checking partner progress:', progressCheckError);
      throw progressCheckError;
    }

    // Only create new progress if none exists
    if (!existingProgress) {
      // Get the first phase
      const { data: firstPhase, error: phaseError } = await supabase
        .from('partner_onboarding_phases')
        .select('id')
        .eq('order_index', 0)
        .single();

      if (phaseError) {
        console.error('Error getting first phase:', phaseError);
        throw phaseError;
      }

      if (firstPhase) {
        const { error: progressError } = await supabase
          .from('partner_onboarding_progress')
          .upsert({
            lead_id: leadId,
            phase_id: firstPhase.id,
            status: 'in_progress'
          });

        if (progressError && progressError.code !== '23505') {
          console.error('Error creating partner progress:', progressError);
          throw progressError;
        }
      }
    }
  } catch (error) {
    console.error('Error handling partner onboarding:', error);
    throw error;
  }
};