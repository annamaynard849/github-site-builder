import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingAnswers {
  relationship_to_deceased?: string;
  date_of_death?: string;
  jurisdiction?: { state?: string; county?: string };
  care_status?: string;
  dependents_status?: string;
  notifications_status?: string;
}

export function useOnboardingAnswers(lovedOneId?: string) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAnswers = async () => {
      try {
        const query = supabase
          .from('onboarding_answers')
          .select('answers_json')
          .eq('user_id', user.id);

        if (lovedOneId) {
          query.eq('loved_one_id', lovedOneId);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error('Error fetching onboarding answers:', error);
          return;
        }

        if (data?.answers_json) {
          setAnswers(data.answers_json as OnboardingAnswers);
        }
      } catch (error) {
        console.error('Error fetching onboarding answers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [user, lovedOneId]);

  return { answers, loading };
}
