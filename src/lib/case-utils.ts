import { supabase } from "@/integrations/supabase/client";

/**
 * Get the case ID for a loved one owned by the current user
 * Returns the user's case for this loved one, preferring LOSS over PREPLAN
 */
export async function getCaseIdForLovedOne(lovedOneId: string, userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('cases' as any)
      .select('id, type')
      .eq('loved_one_id', lovedOneId)
      .eq('user_id', userId)
      .order('type', { ascending: false }) // LOSS comes before PREPLAN
      .limit(1)
      .maybeSingle() as any;

    if (error) {
      console.error('Error fetching case for loved one:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Exception getting case ID:', err);
    return null;
  }
}

/**
 * Navigate to a case dashboard by loved one ID
 * Looks up the case ID and navigates to /cases/:caseId
 * Falls back to /dashboard if no case found
 */
export async function navigateToCaseByLovedOne(
  lovedOneId: string, 
  userId: string, 
  navigate: (path: string) => void,
  queryParams?: string
) {
  const caseId = await getCaseIdForLovedOne(lovedOneId, userId);
  
  if (caseId) {
    navigate(`/cases/${caseId}${queryParams || ''}`);
  } else {
    // Fallback to case switcher if no case found
    navigate('/dashboard');
  }
}
