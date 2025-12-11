import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Case {
  id: string;
  user_id: string;
  loved_one_id: string;
  type: 'PREPLAN' | 'LOSS';
  status: string;
  preplan_case_id: string | null;
  created_at: string;
  updated_at: string;
  loved_ones?: {
    first_name: string;
    last_name: string;
    photo_url: string | null;
    date_of_birth: string | null;
    date_of_death: string | null;
  };
}

interface CurrentCaseContextType {
  currentCase: Case | null;
  loading: boolean;
  error: string | null;
  refreshCase: () => Promise<void>;
  setCurrentCase: (caseData: Case | null) => void;
}

const CurrentCaseContext = createContext<CurrentCaseContextType | undefined>(undefined);

export function CurrentCaseProvider({ 
  children, 
  caseId 
}: { 
  children: React.ReactNode; 
  caseId?: string;
}) {
  const { user } = useAuth();
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = async () => {
    if (!caseId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('cases' as any)
        .select(`
          *,
          loved_ones (
            first_name,
            last_name,
            photo_url,
            date_of_birth,
            date_of_death
          )
        `)
        .eq('id', caseId)
        .eq('user_id', user.id)
        .maybeSingle() as any;

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Case not found or access denied');
        setCurrentCase(null);
      } else {
        setCurrentCase(data as Case);
      }
    } catch (err: any) {
      console.error('Error fetching case:', err);
      setError(err.message || 'Failed to load case');
      setCurrentCase(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [caseId, user?.id]);

  const refreshCase = async () => {
    await fetchCase();
  };

  return (
    <CurrentCaseContext.Provider 
      value={{ 
        currentCase, 
        loading, 
        error,
        refreshCase,
        setCurrentCase
      }}
    >
      {children}
    </CurrentCaseContext.Provider>
  );
}

export function useCurrentCase() {
  const context = useContext(CurrentCaseContext);
  if (context === undefined) {
    throw new Error('useCurrentCase must be used within a CurrentCaseProvider');
  }
  return context;
}
